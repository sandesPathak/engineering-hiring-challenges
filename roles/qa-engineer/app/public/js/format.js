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

/** "2026-11-07" -> "Saturday, 7 November 2026". The heading over a day's events. */
export function dayHeading(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export const timeRange = (start, end) => `${start} – ${end}`;

/** ISO instant -> "7 Nov, 14:05" for the audit log. */
export function stamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const initial = (name) => (String(name ?? '?').trim()[0] ?? '?').toUpperCase();
