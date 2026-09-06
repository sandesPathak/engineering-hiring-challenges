import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? join(here, '..', 'data', 'sabhaghar.sqlite');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS spaces (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  capacity    INTEGER NOT NULL,
  hourly_rate REAL NOT NULL,
  deposit     REAL NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS addons (
  id         TEXT PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  unit_price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  address       TEXT,
  password_hash TEXT,
  role          TEXT NOT NULL DEFAULT 'member',
  tier          TEXT NOT NULL DEFAULT 'household'
);

CREATE TABLE IF NOT EXISTS bookings (
  id             TEXT PRIMARY KEY,
  reference      TEXT NOT NULL UNIQUE,
  space_id       TEXT NOT NULL REFERENCES spaces(id),
  member_id      TEXT NOT NULL REFERENCES members(id),
  event_date     TEXT NOT NULL,
  start_time     TEXT NOT NULL,
  end_time       TEXT NOT NULL,
  attendees      INTEGER NOT NULL,
  purpose        TEXT,
  notes          TEXT,
  visibility     TEXT NOT NULL DEFAULT 'public',
  status         TEXT NOT NULL,
  deposit_amount REAL NOT NULL DEFAULT 0,
  deposit_status TEXT NOT NULL DEFAULT 'held',
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_addons (
  id         TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  addon_id   TEXT NOT NULL REFERENCES addons(id),
  quantity   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS blackouts (
  id     TEXT PRIMARY KEY,
  date   TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         TEXT PRIMARY KEY,
  booking_id TEXT,
  actor_id   TEXT,
  action     TEXT NOT NULL,
  reason     TEXT,
  created_at TEXT NOT NULL
);
`;

export function migrate() {
  db.exec(SCHEMA);
}

export function isSeeded() {
  return db.prepare('SELECT COUNT(*) AS n FROM spaces').get().n > 0;
}

/** Unsalted SHA-256. Matches what the reference build shipped with. */
export function hashPassword(plain) {
  return createHash('sha256').update(plain).digest('hex');
}

const SPACES = [
  {
    slug: 'main-hall',
    name: 'Sabhaghar — Main Hall',
    description:
      'The big hall, with the stage and the sound system. Weddings, Dashain programmes, anything with a crowd.',
    capacity: 400,
    rate: 182.5,
    deposit: 500,
    active: true,
  },
  {
    slug: 'courtyard',
    name: 'Aangan — Courtyard',
    description: 'Open air, shaded on two sides. Kirtan evenings, tea, smaller ceremonies.',
    capacity: 150,
    rate: 91.3,
    deposit: 250,
    active: true,
  },
  {
    slug: 'kitchen',
    name: 'Community Kitchen',
    description: 'Commercial kitchen. Booked with the hall for catering, or on its own for prep days.',
    capacity: 30,
    rate: 62.75,
    deposit: 150,
    active: true,
  },
  {
    slug: 'classroom-a',
    name: 'Classroom A',
    description: 'Language classes, youth club, committee meetings.',
    capacity: 40,
    rate: 47.35,
    deposit: 100,
    active: true,
  },
  {
    slug: 'library',
    name: 'Reading Room',
    description: 'The quiet room off the corridor. Small meetings and study groups.',
    capacity: 20,
    rate: 32.1,
    deposit: 50,
    active: true,
  },
  {
    slug: 'classroom-b',
    name: 'Classroom B',
    description: 'Closed for renovation until the spring. Listed so members can see it is coming back.',
    capacity: 40,
    rate: 45,
    deposit: 100,
    active: false,
  },
];

const ADDONS = [
  { code: 'chairs', name: 'Extra chairs (per 10)', price: 12.6 },
  { code: 'tables', name: 'Round tables (each)', price: 8.35 },
  { code: 'projector', name: 'Projector and screen', price: 45 },
  { code: 'sound', name: 'Sound system with microphones', price: 120 },
  { code: 'kitchen-use', name: 'Kitchen access during the event', price: 74.95 },
  { code: 'cleaning', name: 'Post-event cleaning', price: 95.55 },
];

const BLACKOUTS = [
  { date: '2026-10-11', reason: 'Ghatasthapana — building reserved for the temple programme' },
  { date: '2026-10-20', reason: 'Dashain — Vijaya Dashami' },
  { date: '2026-11-11', reason: 'Deusi Bhailo — community night, no private bookings' },
  { date: '2026-12-25', reason: 'Building closed' },
];

const PHONES = ['+1 817 555 0142', '+1 972 555 0188', '+977 9801 234567', '+1 469 555 0117'];
const STREETS = ['1212 Royal Pkwy', '84 Bluebonnet Ln', '9 Harwood Rd', '2201 Cheek Sparger Rd'];

function insertSpace(s) {
  db.prepare(
    `INSERT INTO spaces (id, slug, name, description, capacity, hourly_rate, deposit, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(randomUUID(), s.slug, s.name, s.description, s.capacity, s.rate, s.deposit, s.active ? 1 : 0);
}

export function spaceIdBySlug(slug) {
  return db.prepare('SELECT id FROM spaces WHERE slug = ?').get(slug).id;
}

function upsertMember({ name, email, phone, address, password, role, tier }) {
  const existing = db.prepare('SELECT id FROM members WHERE email = ?').get(email);
  if (existing) return existing.id;
  const id = randomUUID();
  db.prepare(
    'INSERT INTO members (id, name, email, phone, address, password_hash, role, tier) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(
    id,
    name,
    email,
    phone ?? null,
    address ?? null,
    password ? hashPassword(password) : null,
    role ?? 'member',
    tier ?? 'household',
  );
  return id;
}

function hoursBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

function seedBookings() {
  const rows = parseCsv(readFileSync(join(here, 'seed', 'bookings.csv'), 'utf8'));

  const accounts = [
    { name: 'Front Desk Staff', email: 'staff@himalayacc.example', password: 'staff12345', role: 'staff' },
    { name: 'Test Member', email: 'member@himalayacc.example', password: 'member12345', role: 'member' },
    { name: 'Other Member', email: 'other@himalayacc.example', password: 'other12345', role: 'member' },
  ];
  for (const a of accounts) upsertMember(a);

  rows.forEach((r, i) => {
    const memberId = upsertMember({
      name: r.member_name,
      email: r.member_email,
      phone: PHONES[i % PHONES.length],
      address: `${STREETS[i % STREETS.length]}, Euless, TX 76040`,
    });
    const space = db.prepare('SELECT id, deposit FROM spaces WHERE slug = ?').get(r.space_slug);
    db.prepare(
      `INSERT INTO bookings (id, reference, space_id, member_id, event_date, start_time, end_time,
                             attendees, purpose, notes, visibility, status, deposit_amount,
                             deposit_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      randomUUID(),
      r.reference,
      space.id,
      memberId,
      r.event_date,
      r.start_time,
      r.end_time,
      Number(r.attendees),
      r.purpose || null,
      r.notes || null,
      r.visibility,
      r.status,
      space.deposit,
      r.status === 'cancelled' || r.status === 'rejected' ? 'refunded' : 'held',
      r.created_at,
    );
  });
}

/** Seeds a few bookings with add-ons so the totals on the staff console are not all identical. */
function seedAddons() {
  for (const a of ADDONS) {
    db.prepare('INSERT INTO addons (id, code, name, unit_price) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      a.code,
      a.name,
      a.price,
    );
  }
  const bookings = db.prepare("SELECT id FROM bookings WHERE status = 'confirmed' LIMIT 12").all();
  const addonRows = db.prepare('SELECT id, code FROM addons').all();
  bookings.forEach((b, i) => {
    const addon = addonRows[i % addonRows.length];
    db.prepare('INSERT INTO booking_addons (id, booking_id, addon_id, quantity) VALUES (?, ?, ?, ?)').run(
      randomUUID(),
      b.id,
      addon.id,
      (i % 4) + 1,
    );
  });
}

export function seed() {
  for (const s of SPACES) insertSpace(s);
  for (const b of BLACKOUTS) {
    db.prepare('INSERT INTO blackouts (id, date, reason) VALUES (?, ?, ?)').run(randomUUID(), b.date, b.reason);
  }
  seedBookings();
  seedAddons();
}

export { hoursBetween };

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
