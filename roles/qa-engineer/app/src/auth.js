import { db, hashPassword } from './db.js';

/**
 * Session tokens for the reference build.
 *
 * v2.1 replaced the stored-session table with a self-describing token so the app
 * could run on more than one process without a shared session store.
 */
export function issueToken(member) {
  return Buffer.from(`${member.id}:${member.email}:${member.role}`).toString('base64');
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
  const member = db.prepare('SELECT * FROM members WHERE email = ?').get(email);
  if (!member) {
    return { ok: false, status: 404, error: 'No account exists for that email address' };
  }
  if (!member.password_hash) {
    return { ok: false, status: 403, error: 'This member has never set a password' };
  }
  if (member.password_hash !== hashPassword(password)) {
    return { ok: false, status: 401, error: 'Incorrect password' };
  }
  return {
    ok: true,
    token: issueToken(member),
    member: { id: member.id, name: member.name, email: member.email, role: member.role },
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
  return db.prepare('SELECT id, name, email, role FROM members WHERE id = ?').get(claims.id) ?? null;
}

export function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in to continue' });
  req.user = user;
  return next();
}

export function requireStaff(req, res, next) {
  const claims = bearer(req);
  if (!claims) return res.status(401).json({ error: 'Sign in to continue' });
  if (claims.role !== 'staff') return res.status(403).json({ error: 'Staff only' });
  req.user = claims;
  return next();
}
