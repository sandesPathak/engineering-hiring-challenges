const KEY = 'sabhaghar.session';

function read() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}

const listeners = new Set();
let current = read();

function publish() {
  for (const listener of listeners) listener(current);
}

/**
 * The signed-in member, held for the life of the tab. One store for both pages so
 * the masthead, the request form and the office console never disagree about who
 * is signed in.
 */
export const session = {
  token: () => current?.token ?? null,
  member: () => current?.member ?? null,
  isStaff: () => current?.member?.role === 'staff',

  set(token, member) {
    current = { token, member };
    sessionStorage.setItem(KEY, JSON.stringify(current));
    publish();
  },

  clear() {
    current = null;
    sessionStorage.removeItem(KEY);
    publish();
  },

  /** Calls back immediately with the current state, then on every change. */
  subscribe(listener) {
    listeners.add(listener);
    listener(current);
    return () => listeners.delete(listener);
  },
};
