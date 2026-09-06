import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

export const donorRouter = Router();

donorRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

donorRouter.get('/me/donations', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT d.id, d.amount, d.status, d.receipt_number, d.created_at, c.title AS campaign
         FROM donations d
         JOIN campaigns c ON c.id = d.campaign_id
        WHERE d.donor_id = ?
        ORDER BY d.created_at DESC`,
    )
    .all(req.user.id);

  const total = rows
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  res.json({ data: rows, totalGiven: total });
});

donorRouter.get('/donations/:id', requireAuth, (req, res) => {
  const donation = db
    .prepare(
      `SELECT d.*, p.name AS donor_name, p.email AS donor_email, c.title AS campaign
         FROM donations d
         JOIN donors p ON p.id = d.donor_id
         JOIN campaigns c ON c.id = d.campaign_id
        WHERE d.id = ?`,
    )
    .get(req.params.id);

  if (!donation) return res.status(404).json({ error: 'Donation not found' });
  return res.json(donation);
});

donorRouter.get('/donors/:id', requireAuth, (req, res) => {
  const donor = db
    .prepare('SELECT id, name, email, phone, address, role FROM donors WHERE id = ?')
    .get(req.params.id);

  if (!donor) return res.status(404).json({ error: 'Donor not found' });

  const history = db
    .prepare('SELECT amount, status, created_at FROM donations WHERE donor_id = ? ORDER BY created_at DESC')
    .all(donor.id);

  return res.json({ ...donor, donations: history });
});

donorRouter.get('/receipts/:receiptNumber', (req, res) => {
  const donation = db
    .prepare(
      `SELECT d.receipt_number, d.amount, d.created_at, d.status, p.name AS donor_name, p.email AS donor_email
         FROM donations d JOIN donors p ON p.id = d.donor_id
        WHERE d.receipt_number = ?`,
    )
    .get(req.params.receiptNumber);

  if (!donation) return res.status(404).json({ error: 'Receipt not found' });
  return res.json(donation);
});
