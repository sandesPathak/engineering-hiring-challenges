/** Display helpers. Everything the pages render goes through one of these. */

export const money = (n) => `$${Number(n).toFixed(2)}`;

export function hoursBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

/** "2026-11-07" -> "Sat 7 Nov 2026". Parsed as a plain date, not a UTC instant. */
export function longDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** "2026-11-07" -> "7 Nov 2026". The console needs the date to stay on one line. */
export function shortDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export const timeRange = (start, end) => `${start} – ${end}`;

export const initial = (name) => (String(name ?? '?').trim()[0] ?? '?').toUpperCase();
