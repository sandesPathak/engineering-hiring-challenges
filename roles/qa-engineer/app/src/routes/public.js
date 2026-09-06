import express from 'express';
import { randomUUID } from 'node:crypto';
import { db, hoursBetween } from '../db.js';
import { requireAuth } from '../auth.js';

export const publicRouter = express.Router();

/** Express 4 does not forward a rejected promise from an async handler. */
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const OPENS = '09:00';
const CLOSES = '23:00';

function spaceBySlug(slug) {
  return db.prepare('SELECT * FROM spaces WHERE slug = ?').get(slug);
}

function serialiseSpace(s) {
  return {
    slug: s.slug,
    name: s.name,
    description: s.description,
    capacity: s.capacity,
    hourlyRate: s.hourly_rate,
    deposit: s.deposit,
    isActive: Boolean(s.is_active),
  };
}

publicRouter.get('/spaces', (req, res) => {
  const spaces = db.prepare('SELECT * FROM spaces ORDER BY capacity DESC').all();
  res.json({ spaces: spaces.map(serialiseSpace) });
});

publicRouter.get('/spaces/:slug', (req, res) => {
  const space = spaceBySlug(req.params.slug);
  if (!space) return res.status(404).json({ error: 'No such space' });

  const addons = db.prepare('SELECT code, name, unit_price AS unitPrice FROM addons').all();
  const blackouts = db.prepare('SELECT date, reason FROM blackouts ORDER BY date').all();
  return res.json({ space: serialiseSpace(space), addons, blackouts, opens: OPENS, closes: CLOSES });
});

/**
 * What is already taken on a given day, so the form can grey out the hours.
 */
publicRouter.get('/spaces/:slug/availability', (req, res) => {
  const space = spaceBySlug(req.params.slug);
  if (!space) return res.status(404).json({ error: 'No such space' });

  const date = String(req.query.date ?? '');
  const taken = db
    .prepare(
      `SELECT start_time AS start, end_time AS end, reference
         FROM bookings
        WHERE space_id = ? AND event_date = ? AND status = 'confirmed'
        ORDER BY start_time`,
    )
    .all(space.id, date);

  const blackout = db.prepare('SELECT reason FROM blackouts WHERE date = ?').get(date);
  res.json({ date, opens: OPENS, closes: CLOSES, closed: Boolean(blackout), reason: blackout?.reason ?? null, taken });
});

/**
 * The public what's-on calendar. Members mark an event private when they do not want
 * their name on the noticeboard.
 */
publicRouter.get('/calendar', (req, res) => {
  const from = String(req.query.from ?? '2026-01-01');
  const to = String(req.query.to ?? '2026-12-31');

  const rows = db
    .prepare(
      `SELECT b.reference, b.event_date, b.start_time, b.end_time, b.purpose, b.visibility,
              b.status, b.attendees, s.name AS space_name, m.name AS member_name
         FROM bookings b
         JOIN spaces s ON s.id = b.space_id
         JOIN members m ON m.id = b.member_id
        WHERE b.event_date BETWEEN ? AND ?
        ORDER BY b.event_date, b.start_time`,
    )
    .all(from, to);

  res.json({
    from,
    to,
    events: rows.map((r) => ({
      reference: r.reference,
      date: r.event_date,
      start: r.start_time,
      end: r.end_time,
      space: r.space_name,
      title: r.visibility === 'private' ? 'Private event' : r.purpose,
      purpose: r.purpose,
      bookedBy: r.member_name,
      visibility: r.visibility,
      status: r.status,
      attendees: r.attendees,
    })),
  });
});

function quoteFor(space, startTime, endTime, addonLines) {
  const hours = hoursBetween(startTime, endTime);
  let total = hours * space.hourly_rate;
  for (const line of addonLines) {
    total = total + line.unitPrice * line.quantity;
  }
  return { hours, total };
}

/** Stands in for the pricing service the real build calls before it writes. */
async function confirmQuote(quote) {
  await new Promise((resolve) => setTimeout(resolve, 25));
  return quote;
}

function nextReference() {
  const row = db.prepare("SELECT reference FROM bookings ORDER BY reference DESC LIMIT 1").get();
  const last = row ? Number(row.reference.split('-').pop()) : 4200;
  return `HCC-BK-${last + 1}`;
}

publicRouter.post(
  '/bookings',
  requireAuth,
  asyncRoute(async (req, res) => {
    const { spaceSlug, eventDate, startTime, endTime, attendees, purpose, notes, visibility, addons } = req.body ?? {};

    const space = spaceBySlug(String(spaceSlug ?? ''));
    if (!space) return res.status(404).json({ error: 'No such space' });
    if (!space.is_active) return res.status(409).json({ error: 'That space is not currently bookable' });

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(eventDate ?? ''))) {
      return res.status(422).json({ error: 'eventDate must be YYYY-MM-DD' });
    }
    if (!/^\d{2}:(00|30)$/.test(String(startTime ?? '')) || !/^\d{2}:(00|30)$/.test(String(endTime ?? ''))) {
      return res.status(422).json({ error: 'Times must be on the hour or the half hour' });
    }
    if (endTime <= startTime) {
      return res.status(422).json({ error: 'The end time must be after the start time' });
    }
    if (startTime < OPENS || endTime > CLOSES) {
      return res.status(422).json({ error: `The building is open ${OPENS}–${CLOSES}` });
    }

    const blackout = db.prepare('SELECT reason FROM blackouts WHERE date = ?').get(eventDate);
    if (blackout) return res.status(422).json({ error: `The building is closed that day: ${blackout.reason}` });

    const clash = db
      .prepare(
        `SELECT reference FROM bookings
          WHERE space_id = ? AND event_date = ? AND status != 'cancelled'
            AND start_time <= ? AND end_time >= ?`,
      )
      .get(space.id, eventDate, endTime, startTime);
    if (clash) {
      return res.status(409).json({ error: 'That time is already taken', conflictsWith: clash.reference });
    }

    const addonLines = [];
    for (const line of Array.isArray(addons) ? addons : []) {
      const addon = db.prepare('SELECT * FROM addons WHERE code = ?').get(line.code);
      if (!addon) return res.status(422).json({ error: `Unknown add-on: ${line.code}` });
      addonLines.push({ id: addon.id, unitPrice: addon.unit_price, quantity: Number(line.quantity) });
    }

    const quote = await confirmQuote(quoteFor(space, startTime, endTime, addonLines));

    const id = randomUUID();
    const reference = nextReference();
    db.prepare(
      `INSERT INTO bookings (id, reference, space_id, member_id, event_date, start_time, end_time,
                             attendees, purpose, notes, visibility, status, deposit_amount,
                             deposit_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'held', ?)`,
    ).run(
      id,
      reference,
      space.id,
      req.user.id,
      eventDate,
      startTime,
      endTime,
      Number(attendees),
      purpose ?? null,
      notes ?? null,
      visibility ?? 'public',
      space.deposit,
      new Date().toISOString(),
    );

    for (const line of addonLines) {
      db.prepare('INSERT INTO booking_addons (id, booking_id, addon_id, quantity) VALUES (?, ?, ?, ?)').run(
        randomUUID(),
        id,
        line.id,
        line.quantity,
      );
    }

    db.prepare('INSERT INTO audit_log (id, booking_id, actor_id, action, created_at) VALUES (?, ?, ?, ?, ?)').run(
      randomUUID(),
      id,
      req.user.id,
      'requested',
      new Date().toISOString(),
    );

    return res.status(201).json({
      reference,
      status: 'pending',
      hours: quote.hours,
      total: quote.total,
      deposit: space.deposit,
      message: 'Your request has been sent to the office. You will hear back within two working days.',
    });
  }),
);

publicRouter.get('/bookings/:reference', requireAuth, (req, res) => {
  const row = db
    .prepare(
      `SELECT b.*, s.name AS space_name, s.slug AS space_slug,
              m.name AS member_name, m.email AS member_email, m.phone AS member_phone,
              m.address AS member_address
         FROM bookings b
         JOIN spaces s ON s.id = b.space_id
         JOIN members m ON m.id = b.member_id
        WHERE b.reference = ?`,
    )
    .get(req.params.reference);

  if (!row) return res.status(404).json({ error: 'No such booking' });

  res.json({
    reference: row.reference,
    space: { slug: row.space_slug, name: row.space_name },
    date: row.event_date,
    start: row.start_time,
    end: row.end_time,
    attendees: row.attendees,
    purpose: row.purpose,
    notes: row.notes,
    visibility: row.visibility,
    status: row.status,
    deposit: { amount: row.deposit_amount, status: row.deposit_status },
    member: {
      name: row.member_name,
      email: row.member_email,
      phone: row.member_phone,
      address: row.member_address,
    },
  });
});
