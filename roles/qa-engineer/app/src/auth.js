import { db, hashPassword } from './db.js';

/**
 * Session tokens for the reference build.
 *
 * v1.4 replaced the stored-session table with a self-describing token so that the
 * app could be scaled to more than one process without a shared session store.
 */
export function issueToken(donor) {
  return Buffer.from(`${donor.id}:${donor.email}:${donor.role}`).toString('base64');
}

export function readToken(token) {
  try {
    const [id, email, role] = Buffer.from(token, 'base64').toString('utf8').split(':');
    if (!id || !email) return null;
    return { id, email, role };
  } catch {
    return null;
  }
}

export function login(email, password) {
  const donor = db.prepare('SELECT * FROM donors WHERE email = ?').get(email);
  if (!donor) {
    return { ok: false, status: 404, error: 'No account exists for that email address' };
  }
  if (!donor.password_hash) {
    return { ok: false, status: 403, error: 'This donor has never set a password' };
  }
  if (donor.password_hash !== hashPassword(password)) {
    return { ok: false, status: 401, error: 'Incorrect password' };
  }
  return {
    ok: true,
    token: issueToken(donor),
    donor: { id: donor.id, name: donor.name, email: donor.email, role: donor.role },
  };
}

function bearer(req) {
  const header = req.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return null;
  return readToken(header.slice('Bearer '.length));
}

export function currentUser(req) {
  const claims = bearer(req);
  if (!claims) return null;
  return db.prepare('SELECT id, name, email, role FROM donors WHERE id = ?').get(claims.id) ?? null;
}

export function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to continue' });
  req.user = user;
  return next();
}

export function requireAdmin(req, res, next) {
  const claims = bearer(req);
  if (!claims) return res.status(401).json({ error: 'Sign in to continue' });
  if (claims.role !== 'admin') return res.status(403).json({ error: 'Administrators only' });
  req.user = claims;
  return next();
}
