/**
 * Drops everything and reseeds. Run it between test sessions so a suite starts from
 * the same state the previous one did:  npm run reset
 */
import { db, migrate, seed } from './db.js';

for (const table of ['audit_log', 'units', 'donations', 'donors', 'campaigns']) {
  db.exec(`DROP TABLE IF EXISTS ${table}`);
}

migrate();
seed();

const donations = db.prepare('SELECT COUNT(*) AS n FROM donations').get().n;
const units = db.prepare('SELECT COUNT(*) AS n FROM units').get().n;
console.log(`Reset complete — ${donations} donations, ${units} units`);
