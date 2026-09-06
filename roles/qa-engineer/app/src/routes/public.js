import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';

export const publicRouter = Router();

/**
 * Express 4 does not forward a rejected promise from an async handler to the error
 * middleware, so every async route below is registered through this.
 */
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const GUEST_COOLDOWN_SECONDS = Number(process.env.GUEST_COOLDOWN_SECONDS ?? 120);
const lastGuestDonationByIp = new Map();

function campaignBySlug(slug) {
  return db.prepare('SELECT * FROM campaigns WHERE slug = ?').get(slug);
}

publicRouter.get('/campaigns', (req, res) => {
  const rows = db.prepare('SELECT slug, title, goal, is_active FROM campaigns ORDER BY is_active DESC, title').all();
  res.json({ data: rows });
});

publicRouter.get('/campaigns/:slug', (req, res) => {
  const campaign = campaignBySlug(req.params.slug);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const totals = db
    .prepare(
      `SELECT SUM(amount) AS raised, COUNT(DISTINCT donor_id) AS donors
         FROM donations
        WHERE campaign_id = ? AND status != 'failed'`,
    )
    .get(campaign.id);

  const raised = totals.raised ?? 0;

  return res.json({
    slug: campaign.slug,
    title: campaign.title,
    story: campaign.story,
    goal: campaign.goal,
    raised,
    donorCount: totals.donors ?? 0,
    percent: (raised / campaign.goal) * 100,
    presets: JSON.parse(campaign.presets),
    minAmount: campaign.min_amount,
    maxAmount: campaign.max_amount,
    isActive: Boolean(campaign.is_active),
  });
});

publicRouter.get('/campaigns/:slug/donations', (req, res) => {
  const campaign = campaignBySlug(req.params.slug);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const limit = Number(req.query.limit ?? 20);
  const rows = db
    .prepare(
      `SELECT d.id, d.amount, d.privacy_mode, d.dedication_type, d.dedication_name,
              d.dedication_message, d.created_at, p.name AS donor_name
         FROM donations d
         JOIN donors p ON p.id = d.donor_id
        WHERE d.campaign_id = ? AND d.status = 'completed'
        ORDER BY d.created_at DESC
        LIMIT ?`,
    )
    .all(campaign.id, limit);

  const data = rows.map((r) => ({
    id: r.id,
    donorName: r.donor_name,
    displayName: displayNameFor(r),
    amount: r.amount,
    dedication: r.dedication_type
      ? { type: r.dedication_type, name: r.dedication_name }
      : null,
    message: r.dedication_message,
    createdAt: r.created_at,
  }));

  return res.json({ data });
});

function displayNameFor(row) {
  if (row.privacy_mode === 'anonymous') return 'Anonymous';
  if (row.privacy_mode === 'family') {
    const parts = row.donor_name.trim().split(/\s+/);
    return `The ${parts[parts.length - 1]} family`;
  }
  return row.donor_name;
}

/** Stands in for the hosted payment provider's round trip. */
function settlePayment(token) {
  const latency = Number(process.env.PAYMENT_LATENCY_MS ?? 120);
  return new Promise((resolve) => setTimeout(() => resolve(`ch_${token ?? 'tok_ok'}`), latency));
}

publicRouter.post('/donations', asyncRoute(async (req, res) => {
  const { campaignSlug, amount, donor, dedication, privacyMode, isRecurring, paymentToken } = req.body ?? {};

  const campaign = campaignBySlug(campaignSlug);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  if (!campaign.is_active) return res.status(422).json({ error: 'This campaign is closed' });

  if (!donor?.email || !donor?.name) {
    return res.status(422).json({ error: 'Name and email are required' });
  }
  if (!amount) {
    return res.status(422).json({ error: 'An amount is required' });
  }

  // Guests are limited to one donation per cooldown window per IP address. This is
  // intentional product behaviour — see SPEC.md §7.
  const ip = req.ip;
  const last = lastGuestDonationByIp.get(ip);
  const now = Date.now();
  if (last && now - last < GUEST_COOLDOWN_SECONDS * 1000) {
    const wait = Math.ceil((GUEST_COOLDOWN_SECONDS * 1000 - (now - last)) / 1000);
    return res.status(429).json({ error: `Please wait ${wait} seconds before donating again`, retryAfter: wait });
  }

  if (paymentToken === 'tok_decline') {
    return res.status(402).json({ error: 'The card was declined' });
  }

  await settlePayment(paymentToken);

  let donorRow = db.prepare('SELECT * FROM donors WHERE email = ?').get(donor.email);
  if (!donorRow) {
    const id = randomUUID();
    db.prepare('INSERT INTO donors (id, name, email, role) VALUES (?, ?, ?, ?)').run(id, donor.name, donor.email, 'donor');
    donorRow = { id };
  }

  const receiptNumber = nextReceiptNumber();
  const donationId = randomUUID();
  db.prepare(
    `INSERT INTO donations (id, campaign_id, donor_id, amount, status, privacy_mode,
                            dedication_type, dedication_name, dedication_message,
                            is_recurring, receipt_number, created_at)
     VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    donationId,
    campaign.id,
    donorRow.id,
    Number(amount),
    privacyMode ?? 'public',
    dedication?.type ?? null,
    dedication?.name ?? null,
    dedication?.message ?? null,
    isRecurring ? 1 : 0,
    receiptNumber,
    new Date().toISOString(),
  );

  lastGuestDonationByIp.set(ip, now);

  return res.status(201).json({
    id: donationId,
    receiptNumber,
    amount: Number(amount),
    status: 'completed',
  });
}));

function nextReceiptNumber() {
  const row = db.prepare("SELECT COUNT(*) AS n FROM donations").get();
  return `HCC-2026-${String(row.n + 1).padStart(6, '0')}`;
}

publicRouter.get('/campaigns/:slug/units', (req, res) => {
  const campaign = campaignBySlug(req.params.slug);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const rows = db
    .prepare('SELECT code, price, status, held_until FROM units WHERE campaign_id = ? ORDER BY code')
    .all(campaign.id);

  res.json({
    data: rows.map((u) => ({
      code: u.code,
      price: u.price,
      status: u.status,
      heldUntil: u.held_until,
    })),
  });
});

const HOLD_MINUTES = 10;
const MAX_UNITS_PER_HOLD = 5;

publicRouter.post('/campaigns/:slug/units/hold', asyncRoute(async (req, res) => {
  const campaign = campaignBySlug(req.params.slug);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const { codes, sessionId } = req.body ?? {};
  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(422).json({ error: 'Select at least one unit' });
  }
  if (codes.length > MAX_UNITS_PER_HOLD) {
    return res.status(422).json({ error: `You may hold at most ${MAX_UNITS_PER_HOLD} units` });
  }

  const unavailable = [];
  for (const code of codes) {
    const unit = db
      .prepare('SELECT * FROM units WHERE campaign_id = ? AND code = ?')
      .get(campaign.id, code);
    if (!unit || unit.status === 'dedicated') {
      unavailable.push(code);
      continue;
    }
    if (unit.status === 'held' && unit.held_until && new Date(unit.held_until) > new Date()) {
      unavailable.push(code);
    }
  }

  if (unavailable.length > 0) {
    return res.status(409).json({ error: 'Some units are no longer available', unavailable });
  }

  // The pricing service is consulted before a hold is written, so that a unit whose
  // price changed mid-session cannot be held at the old price.
  await confirmPricing(campaign.id, codes);

  const heldUntil = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();
  for (const code of codes) {
    db.prepare('UPDATE units SET status = ?, held_by = ?, held_until = ? WHERE campaign_id = ? AND code = ?')
      .run('held', sessionId ?? 'anonymous', heldUntil, campaign.id, code);
  }

  return res.status(201).json({ codes, heldUntil });
}));

function confirmPricing(campaignId, codes) {
  const latency = Number(process.env.PRICING_LATENCY_MS ?? 60);
  return new Promise((resolve) => setTimeout(() => resolve(codes.length), latency));
}
