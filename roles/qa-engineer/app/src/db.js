import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? join(here, '..', 'data', 'aangan.sqlite');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS campaigns (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  story       TEXT,
  goal        REAL NOT NULL,
  min_amount  REAL NOT NULL DEFAULT 1,
  max_amount  REAL NOT NULL DEFAULT 25000,
  presets     TEXT NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS donors (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  address       TEXT,
  password_hash TEXT,
  role          TEXT NOT NULL DEFAULT 'donor'
);

CREATE TABLE IF NOT EXISTS donations (
  id                 TEXT PRIMARY KEY,
  campaign_id        TEXT NOT NULL REFERENCES campaigns(id),
  donor_id           TEXT NOT NULL REFERENCES donors(id),
  amount             REAL NOT NULL,
  status             TEXT NOT NULL,
  privacy_mode       TEXT NOT NULL DEFAULT 'public',
  dedication_type    TEXT,
  dedication_name    TEXT,
  dedication_message TEXT,
  is_recurring       INTEGER NOT NULL DEFAULT 0,
  receipt_number     TEXT NOT NULL,
  created_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
  id          TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  code        TEXT NOT NULL,
  price       REAL NOT NULL,
  status      TEXT NOT NULL DEFAULT 'available',
  held_by     TEXT,
  held_until  TEXT,
  donation_id TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,
  donation_id TEXT,
  actor_id    TEXT,
  action      TEXT NOT NULL,
  reason      TEXT,
  created_at  TEXT NOT NULL
);
`;

export function migrate() {
  db.exec(SCHEMA);
}

export function isSeeded() {
  const row = db.prepare('SELECT COUNT(*) AS n FROM campaigns').get();
  return row.n > 0;
}

/** Unsalted SHA-256. Matches what the reference build shipped with. */
export function hashPassword(plain) {
  return createHash('sha256').update(plain).digest('hex');
}

function insertCampaign(c) {
  db.prepare(
    `INSERT INTO campaigns (id, slug, title, story, goal, min_amount, max_amount, presets, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(randomUUID(), c.slug, c.title, c.story, c.goal, c.min, c.max, JSON.stringify(c.presets), c.active ? 1 : 0);
}

function campaignIdBySlug(slug) {
  return db.prepare('SELECT id FROM campaigns WHERE slug = ?').get(slug).id;
}

function upsertDonor({ name, email, phone, address, password, role }) {
  const existing = db.prepare('SELECT id FROM donors WHERE email = ?').get(email);
  if (existing) return existing.id;
  const id = randomUUID();
  db.prepare(
    'INSERT INTO donors (id, name, email, phone, address, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(id, name, email, phone ?? null, address ?? null, password ? hashPassword(password) : null, role ?? 'donor');
  return id;
}

const PHONES = ['+1 817 555 0142', '+1 972 555 0188', '+977 9801 234567', '+1 469 555 0117'];
const STREETS = ['1212 Royal Pkwy', '84 Bluebonnet Ln', '9 Harwood Rd', '2201 Cheek Sparger Rd'];

function seedDonorsAndDonations() {
  const csvPath = join(here, 'seed', 'donations.csv');
  const rows = parseCsv(readFileSync(csvPath, 'utf8'));

  const accounts = [
    { name: 'Front Desk Admin', email: 'admin@himalayacc.example', password: 'admin12345', role: 'admin' },
    { name: 'Test Donor', email: 'donor@himalayacc.example', password: 'donor12345', role: 'donor' },
    { name: 'Other Donor', email: 'other@himalayacc.example', password: 'other12345', role: 'donor' },
  ];
  for (const a of accounts) upsertDonor(a);

  rows.forEach((r, i) => {
    const donorId = upsertDonor({
      name: r.donor_name,
      email: r.donor_email,
      phone: PHONES[i % PHONES.length],
      address: `${STREETS[i % STREETS.length]}, Euless, TX 76040`,
    });
    db.prepare(
      `INSERT INTO donations (id, campaign_id, donor_id, amount, status, privacy_mode,
                              dedication_type, dedication_name, dedication_message,
                              is_recurring, receipt_number, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      randomUUID(),
      campaignIdBySlug(r.campaign_slug),
      donorId,
      Number(r.amount_dollars),
      r.status,
      r.privacy_mode,
      r.dedication_type || null,
      r.dedication_name || null,
      r.dedication_message || null,
      r.is_recurring === 'true' ? 1 : 0,
      r.receipt_number,
      r.created_at,
    );
  });
}

function seedUnits() {
  const campaignId = campaignIdBySlug('aangan-courtyard');
  const rows = 'ABCDEFGH'.split('');
  const insert = db.prepare(
    'INSERT INTO units (id, campaign_id, code, price, status) VALUES (?, ?, ?, ?, ?)',
  );
  for (const row of rows) {
    for (let col = 1; col <= 12; col += 1) {
      insert.run(randomUUID(), campaignId, `${row}${String(col).padStart(2, '0')}`, 1008, 'available');
    }
  }
  // A handful already dedicated, so the grid is not uniformly empty.
  for (const code of ['A01', 'A02', 'B05', 'C11', 'D03']) {
    db.prepare('UPDATE units SET status = ? WHERE code = ? AND campaign_id = ?').run('dedicated', code, campaignId);
  }
}

export function seed() {
  insertCampaign({
    slug: 'aangan-courtyard',
    title: 'Aangan — Courtyard Restoration',
    story:
      'The courtyard is where the community actually happens. This campaign repaves the stone, rebuilds the drainage, and adds shaded seating for the elders who spend their mornings here.',
    goal: 150000,
    min: 1,
    max: 25000,
    presets: [21, 51, 101, 501, 1001],
    active: true,
  });
  insertCampaign({
    slug: 'annadaan-kitchen',
    title: 'Annadaan — Community Kitchen',
    story: 'Meals served every Saturday, and the equipment that makes them possible.',
    goal: 40000,
    min: 1,
    max: 5000,
    presets: [11, 21, 51],
    active: true,
  });
  insertCampaign({
    slug: 'roof-repair-2025',
    title: 'Roof Repair',
    story: 'Completed in 2025. Kept visible so donors can see what their giving finished.',
    goal: 20000,
    min: 1,
    max: 5000,
    presets: [21, 51],
    active: false,
  });

  seedDonorsAndDonations();
  seedUnits();
}

/** Minimal RFC 4180 reader — enough for the seed file, which is generated by us. */
export function parseCsv(text) {
  const lines = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); lines.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field !== '' || row.length) { row.push(field); lines.push(row); }

  const [header, ...rest] = lines;
  return rest
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}
