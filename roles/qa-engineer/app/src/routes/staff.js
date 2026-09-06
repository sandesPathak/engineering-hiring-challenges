import express from 'express';
import { randomUUID } from 'node:crypto';
import { db, hoursBetween } from '../db.js';
import { requireStaff } from '../auth.js';

export const staffRouter = express.Router();

/**
 * The CSV export is opened with window.location, which cannot set an Authorization
 * header, so the console passes the session token as a query parameter instead.
 */
staffRouter.use((req, res, next) => {
  if (req.query.token && !req.get('authorization')) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  return next();
});

staffRouter.use(requireStaff);

const SORTABLE = ['event_date', 'created_at', 'attendees', 'status'];

function listQuery(req) {
  const where = ['1 = 1'];
  const params = [];

  if (req.query.q) {
    // The console search box is used with a barcode scanner at the front desk, so
    // punctuation is stripped before the query runs.
    const term = String(req.query.q).replace(/[^a-zA-Z0-9 ]/g, '');
    where.push('(m.name LIKE ? OR m.email LIKE ? OR b.reference LIKE ?)');
    params.push(`%${term}%`, `%${term}%`, `%${term}%`);
  }
  if (req.query.status && req.query.status !== 'all') {
    where.push('b.status = ?');
    params.push(String(req.query.status));
  }
  if (req.query.space) {
    where.push('s.slug = ?');
    params.push(String(req.query.space));
  }
  if (req.query.from) {
    where.push('b.event_date >= ?');
    params.push(String(req.query.from));
  }
  if (req.query.to) {
    where.push('b.event_date <= ?');
    params.push(String(req.query.to));
  }

  return { where: where.join(' AND '), params };
}

staffRouter.get('/bookings', (req, res) => {
  const { where, params } = listQuery(req);
  const sort = SORTABLE.includes(String(req.query.sort)) ? String(req.query.sort) : 'event_date';
  const dir = String(req.query.dir ?? 'desc');
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 25);

  const rows = db
    .prepare(
      `SELECT b.reference, b.event_date, b.start_time, b.end_time, b.attendees, b.purpose,
              b.notes, b.visibility, b.status, b.deposit_amount, b.deposit_status, b.created_at,
              s.name AS space_name, s.hourly_rate,
              m.name AS member_name, m.email AS member_email, m.phone AS member_phone
         FROM bookings b
         JOIN spaces s ON s.id = b.space_id
         JOIN members m ON m.id = b.member_id
        WHERE ${where}
        ORDER BY b.${sort} ${dir}
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
    )
    .all(...params);

  const total = db
    .prepare(
      `SELECT COUNT(*) AS n FROM bookings b
         JOIN spaces s ON s.id = b.space_id
         JOIN members m ON m.id = b.member_id
        WHERE ${where}`,
    )
    .get(...params).n;

  res.json({
    page,
    pageSize,
    total,
    bookings: rows.map((r) => ({
      reference: r.reference,
      space: r.space_name,
      date: r.event_date,
      start: r.start_time,
      end: r.end_time,
      hours: hoursBetween(r.start_time, r.end_time),
      hireFee: hoursBetween(r.start_time, r.end_time) * r.hourly_rate,
      attendees: r.attendees,
      purpose: r.purpose,
      notes: r.notes,
      visibility: r.visibility,
      status: r.status,
      deposit: { amount: r.deposit_amount, status: r.deposit_status },
      member: { name: r.member_name, email: r.member_email, phone: r.member_phone },
      createdAt: r.created_at,
    })),
  });
});

staffRouter.get('/stats', (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.start_time, b.end_time, b.status, s.hourly_rate
         FROM bookings b JOIN spaces s ON s.id = b.space_id`,
    )
    .all();

  let hours = 0;
  let fees = 0;
  for (const r of rows) {
    const h = hoursBetween(r.start_time, r.end_time);
    hours += h;
    fees += h * r.hourly_rate;
  }

  const pending = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE status = 'pending'").get().n;
  const heldDeposits = db
    .prepare("SELECT SUM(deposit_amount) AS d FROM bookings WHERE deposit_status = 'held'")
    .get().d;

  res.json({
    hoursBooked: hours,
    hireFees: fees,
    pendingRequests: pending,
    depositsHeld: heldDeposits ?? 0,
    utilisation: (hours / (rows.length * 14)) * 100,
  });
});

staffRouter.post('/bookings/:reference/approve', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE reference = ?').get(req.params.reference);
  if (!booking) return res.status(404).json({ error: 'No such booking' });

  db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").run(booking.id);
  db.prepare('INSERT INTO audit_log (id, booking_id, actor_id, action, created_at) VALUES (?, ?, ?, ?, ?)').run(
    randomUUID(),
    booking.id,
    null,
    'approved',
    new Date().toISOString(),
  );

  res.json({ reference: booking.reference, status: 'confirmed' });
});

staffRouter.post('/bookings/:reference/reject', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE reference = ?').get(req.params.reference);
  if (!booking) return res.status(404).json({ error: 'No such booking' });

  db.prepare("UPDATE bookings SET status = 'rejected' WHERE id = ?").run(booking.id);
  db.prepare(
    'INSERT INTO audit_log (id, booking_id, actor_id, action, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(randomUUID(), booking.id, null, 'rejected', req.body?.reason ?? null, new Date().toISOString());

  res.json({ reference: booking.reference, status: 'rejected' });
});

staffRouter.get('/bookings.csv', (req, res) => {
  const { where, params } = listQuery(req);
  const rows = db
    .prepare(
      `SELECT b.reference, b.event_date, b.start_time, b.end_time, b.attendees, b.purpose,
              b.status, b.deposit_amount, s.name AS space_name, m.name AS member_name,
              m.email AS member_email
         FROM bookings b
         JOIN spaces s ON s.id = b.space_id
         JOIN members m ON m.id = b.member_id
        WHERE ${where}
        ORDER BY b.event_date DESC`,
    )
    .all(...params);

  const header = 'reference,date,start,end,space,member,email,attendees,purpose,status,deposit';
  const lines = rows.map((r) =>
    [
      r.reference,
      r.event_date,
      r.start_time,
      r.end_time,
      r.space_name,
      r.member_name,
      r.member_email,
      r.attendees,
      r.purpose ?? '',
      r.status,
      r.deposit_amount,
    ].join(','),
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
  res.send([header, ...lines].join('\n'));
});

staffRouter.get('/audit', (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.action, a.reason, a.created_at, a.actor_id, b.reference
         FROM audit_log a LEFT JOIN bookings b ON b.id = a.booking_id
        ORDER BY a.created_at DESC LIMIT 100`,
    )
    .all();
  res.json({ entries: rows });
});
