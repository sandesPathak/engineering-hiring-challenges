/**
 * Drops everything and reseeds. Run it between test sessions so a suite starts from
 * the same state the previous one did:  npm run reset
 */
import { db, migrate, seed } from './db.js';

for (const table of ['audit_log', 'booking_addons', 'bookings', 'blackouts', 'addons', 'members', 'spaces']) {
  db.exec(`DROP TABLE IF EXISTS ${table}`);
}

migrate();
seed();

const bookings = db.prepare('SELECT COUNT(*) AS n FROM bookings').get().n;
const members = db.prepare('SELECT COUNT(*) AS n FROM members').get().n;
console.log(`Reset complete — ${bookings} bookings, ${members} members`);
