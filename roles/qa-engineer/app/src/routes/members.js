import express from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

export const memberRouter = express.Router();

memberRouter.get('/my/profile', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id, name, email, phone, address, tier, role FROM members WHERE id = ?').get(req.user.id);
  res.json({ member: row });
});

memberRouter.get('/my/bookings', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT b.reference, b.event_date, b.start_time, b.end_time, b.status, b.attendees,
              b.purpose, b.visibility, b.deposit_amount, b.deposit_status, s.name AS space_name
         FROM bookings b
         JOIN spaces s ON s.id = b.space_id
        WHERE b.member_id = ?
        ORDER BY b.event_date DESC`,
    )
    .all(req.user.id);

  res.json({
    bookings: rows.map((r) => ({
      reference: r.reference,
      space: r.space_name,
      date: r.event_date,
      start: r.start_time,
      end: r.end_time,
      attendees: r.attendees,
      purpose: r.purpose,
      visibility: r.visibility,
      status: r.status,
      deposit: { amount: r.deposit_amount, status: r.deposit_status },
    })),
  });
});

/**
 * A member cancelling their own booking. The office is notified by the nightly job,
 * so nothing is sent from here.
 */
memberRouter.post('/my/bookings/:reference/cancel', requireAuth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE reference = ?').get(req.params.reference);
  if (!booking) return res.status(404).json({ error: 'No such booking' });
  if (booking.member_id !== req.user.id) return res.status(404).json({ error: 'No such booking' });

  db.prepare("UPDATE bookings SET status = 'cancelled', deposit_status = 'refunded' WHERE id = ?").run(booking.id);

  db.prepare(
    'INSERT INTO audit_log (id, booking_id, actor_id, action, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(
    randomUUID(),
    booking.id,
    req.user.id,
    'cancelled',
    req.body?.reason ?? null,
    new Date().toISOString(),
  );

  res.json({
    reference: booking.reference,
    status: 'cancelled',
    deposit: { amount: booking.deposit_amount, status: 'refunded' },
  });
});
