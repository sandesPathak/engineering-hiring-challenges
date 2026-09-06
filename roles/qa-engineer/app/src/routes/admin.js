import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

const PAGE_SIZE = 25;

adminRouter.get('/donations', (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? PAGE_SIZE);
  const sort = req.query.sort ?? 'created_at';
  const dir = req.query.dir ?? 'desc';

  const clauses = [];
  const params = [];

  if (req.query.status) {
    clauses.push('d.status = ?');
    params.push(req.query.status);
  }
  if (req.query.from) {
    clauses.push('d.created_at >= ?');
    params.push(req.query.from);
  }
  if (req.query.to) {
    clauses.push('d.created_at <= ?');
    params.push(req.query.to);
  }
  if (req.query.q) {
    // Strip anything that is not a letter, a digit or a space before it reaches the
    // database, so that a search box cannot be used to smuggle SQL.
    const term = String(req.query.q).replace(/[^a-zA-Z0-9 ]/g, '');
    clauses.push('(LOWER(p.name) LIKE LOWER(?) OR LOWER(p.email) LIKE LOWER(?))');
    params.push(`%${term}%`, `%${term}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const total = db
    .prepare(`SELECT COUNT(*) AS n FROM donations d JOIN donors p ON p.id = d.donor_id ${where}`)
    .get(...params).n;

  const rows = db
    .prepare(
      `SELECT d.id, d.amount, d.status, d.privacy_mode, d.receipt_number, d.created_at,
              d.dedication_type, d.dedication_name, d.dedication_message,
              p.name AS donor_name, p.email AS donor_email, c.title AS campaign
         FROM donations d
         JOIN donors p ON p.id = d.donor_id
         JOIN campaigns c ON c.id = d.campaign_id
         ${where}
        ORDER BY d.${sort} ${dir}
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
    )
    .all(...params);

  res.json({
    data: rows,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

adminRouter.post('/donations/:id/refund', (req, res) => {
  const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(req.params.id);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  db.prepare("UPDATE donations SET status = 'refunded' WHERE id = ?").run(donation.id);
  db.prepare('INSERT INTO audit_log (id, donation_id, actor_id, action, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), donation.id, req.user.id, 'refund', req.body?.reason ?? null, new Date().toISOString());

  return res.json({ id: donation.id, status: 'refunded' });
});

adminRouter.get('/stats', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const todayTotal = db
    .prepare(
      `SELECT SUM(amount) AS total, COUNT(*) AS count
         FROM donations
        WHERE status = 'completed' AND substr(created_at, 1, 10) = ?`,
    )
    .get(today);

  const byStatus = db
    .prepare('SELECT status, COUNT(*) AS count, SUM(amount) AS total FROM donations GROUP BY status')
    .all();

  const recurring = db
    .prepare("SELECT COUNT(*) AS count FROM donations WHERE is_recurring = 1 AND status = 'completed'")
    .get();

  res.json({
    today: { date: today, total: todayTotal.total ?? 0, count: todayTotal.count },
    byStatus,
    recurringDonors: recurring.count,
  });
});

adminRouter.get('/donations.csv', (req, res) => {
  const rows = db
    .prepare(
      `SELECT d.receipt_number, p.name AS donor_name, p.email AS donor_email, d.amount,
              d.status, d.privacy_mode, d.dedication_name, d.dedication_message, d.created_at
         FROM donations d JOIN donors p ON p.id = d.donor_id
        ORDER BY d.created_at DESC`,
    )
    .all();

  const header = [
    'receipt_number', 'donor_name', 'donor_email', 'amount',
    'status', 'privacy_mode', 'dedication_name', 'dedication_message', 'created_at',
  ];

  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.receipt_number,
        r.donor_name,
        r.donor_email,
        r.amount.toFixed(2),
        r.status,
        r.privacy_mode,
        r.dedication_name ?? '',
        r.dedication_message ?? '',
        r.created_at,
      ].join(','),
    );
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
  res.send(lines.join('\n'));
});

adminRouter.get('/audit', (req, res) => {
  const rows = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200').all();
  res.json({ data: rows });
});
