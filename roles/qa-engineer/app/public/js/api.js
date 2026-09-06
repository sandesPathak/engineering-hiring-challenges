import { session } from './session.js';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Every call to the reference build goes through here so the session token is
 * attached in one place and errors arrive as ApiError with the status intact.
 */
export async function api(path, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers ?? {}) };
  const token = session.token();
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  return body;
}

export const post = (path, payload) =>
  api(path, { method: 'POST', body: JSON.stringify(payload ?? {}) });
