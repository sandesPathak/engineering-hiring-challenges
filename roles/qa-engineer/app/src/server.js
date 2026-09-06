import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, migrate, seed, isSeeded } from './db.js';
import { login } from './auth.js';
import { publicRouter } from './routes/public.js';
import { memberRouter } from './routes/members.js';
import { staffRouter } from './routes/staff.js';

const here = dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(express.static(join(here, '..', 'public')));

app.get('/api/health', (req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS n FROM bookings').get();
  res.json({ status: 'ok', version: process.env.npm_package_version ?? '2.3.1', bookings: row.n });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(422).json({ error: 'Email and password are required' });

  const result = login(email, password);
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.json({ token: result.token, member: result.member });
});

app.use('/api', publicRouter);
app.use('/api', memberRouter);
app.use('/api/staff', staffRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

migrate();
if (!isSeeded()) {
  seed();
  console.log('Seeded the reference database');
}

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Sabhaghar Booking reference build listening on http://localhost:${port}`);
});
