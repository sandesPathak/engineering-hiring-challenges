import { api, post } from './js/api.js';
import { session } from './js/session.js';
import { mountAccount, openSignIn } from './js/account.js';
import { $, el, toast, setNotice, whileBusy } from './js/ui.js';
import { money, hoursBetween, longDate, timeRange } from './js/format.js';

let spaces = [];
let addons = [];

/* ------------------------------------------------------------------ spaces */

function spaceCard(space) {
  const card = el('div', { className: `card${space.isActive ? '' : ' closed'}` });
  card.append(
    el('h3', {}, space.name),
    el('p', {}, space.description),
    el('div.meta', {},
      space.isActive
        ? el('span', {},
            el('span.rate', {}, `${money(space.hourlyRate)}/hour`),
            ` · up to ${space.capacity} · ${money(space.deposit)} deposit`)
        : 'Not currently bookable'),
  );
  return card;
}

async function loadSpaces() {
  const data = await api('/api/spaces');
  spaces = data.spaces;

  const wrap = $('spaces');
  wrap.textContent = '';
  for (const space of spaces) wrap.appendChild(spaceCard(space));

  for (const select of [$('availSpace'), $('fSpace')]) {
    select.textContent = '';
    for (const space of spaces.filter((s) => s.isActive)) {
      select.appendChild(el('option', { value: space.slug }, space.name));
    }
  }
}

/* ------------------------------------------------------------------ add-ons */

async function loadAddons(slug) {
  const data = await api(`/api/spaces/${slug}`);
  addons = data.addons;

  const row = $('addonRow');
  row.textContent = '';
  for (const addon of addons) {
    const label = document.createElement('label');
    label.textContent = `${addon.name} — ${money(addon.unitPrice)}`;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = '0';
    input.dataset.code = addon.code;
    input.className = 'addon';
    input.addEventListener('input', renderQuote);

    const cell = document.createElement('div');
    cell.append(label, input);
    row.appendChild(cell);
  }
  renderQuote();
}

function selectedAddons() {
  return [...document.querySelectorAll('.addon')]
    .map((input) => ({ code: input.dataset.code, quantity: Number(input.value) }))
    .filter((line) => line.quantity !== 0);
}

/* -------------------------------------------------------------------- quote */

function renderQuote() {
  const space = spaces.find((s) => s.slug === $('fSpace').value);
  if (!space) return;

  const hours = hoursBetween($('fStart').value, $('fEnd').value);
  const hire = hours * space.hourlyRate;
  let total = hire;
  for (const line of selectedAddons()) {
    total += addons.find((a) => a.code === line.code).unitPrice * line.quantity;
  }

  const figure = (label, value) => el('div', {}, el('div.k', {}, label), el('div.v', {}, value));
  const quote = $('quote');
  quote.textContent = '';
  quote.append(
    figure('Hours', String(hours)),
    figure('Hire', money(hire)),
    figure('Total', money(total)),
    figure('Deposit held', money(space.deposit)),
  );
}

/* ------------------------------------------------------------- availability */

async function loadAvailability() {
  const slug = $('availSpace').value;
  const date = $('availDate').value;
  if (!slug || !date) return;

  const data = await api(`/api/spaces/${slug}/availability?date=${date}`);
  setNotice($('availNote'), data.closed ? `Closed: ${data.reason}` : '', 'info');

  const slots = $('slots');
  slots.textContent = '';
  for (let hour = 9; hour < 23; hour += 1) {
    const label = `${String(hour).padStart(2, '0')}:00`;
    const busy = data.taken.some((t) => label >= t.start && label < t.end);
    const cell = document.createElement('div');
    cell.className = busy ? 'taken' : '';
    cell.textContent = label;
    slots.appendChild(cell);
  }
}

/* ---------------------------------------------------------------- calendar */

async function loadCalendar() {
  const data = await api('/api/calendar?from=2026-09-01&to=2026-12-31');
  const wrap = $('calendar');
  wrap.textContent = '';

  if (!data.events.length) {
    wrap.appendChild(el('p.empty', {}, 'Nothing on the calendar for this period.'));
    return;
  }

  for (const event of data.events.slice(0, 25)) {
    const row = el('div', { className: `event${event.visibility === 'private' ? ' private' : ''}` });
    row.append(
      el('span.when', {}, `${longDate(event.date)} · ${timeRange(event.start, event.end)}`),
      el('div.what', {}, event.title),
      el('div.where', {}, event.space),
      el('div.who', {}, `Booked by ${event.bookedBy}`),
    );
    wrap.appendChild(row);
  }
}

/* ------------------------------------------------------------ own bookings */

function cancelButton(booking) {
  const button = el('button.danger.small', { type: 'button' }, 'Cancel');
  button.addEventListener('click', () =>
    whileBusy(button, 'Cancelling…', async () => {
      try {
        await post(`/api/my/bookings/${booking.reference}/cancel`);
        toast(`${booking.reference} cancelled`);
        await Promise.all([loadMyBookings(), loadAvailability(), loadCalendar()]);
      } catch (err) {
        toast(err.message, 'bad');
      }
    }));
  return button;
}

async function loadMyBookings() {
  if (!session.token()) return;

  const data = await api('/api/my/bookings');
  const wrap = $('mine');
  wrap.textContent = '';

  if (!data.bookings.length) {
    wrap.appendChild(el('div.card.empty', {}, 'You have not requested a space yet.'));
    return;
  }

  for (const booking of data.bookings) {
    wrap.appendChild(
      el('div.card.item', {},
        el('div', {},
          el('div.ref', {}, booking.reference),
          el('div.detail', {}, `${booking.space} · ${longDate(booking.date)} · ${timeRange(booking.start, booking.end)}`)),
        el('div.right', {},
          el('span', { className: `pill ${booking.status}` }, booking.status),
          cancelButton(booking))),
    );
  }
}

/* ------------------------------------------------------------- the request */

$('requestForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setNotice($('formErr'), '');

  const space = spaces.find((s) => s.slug === $('fSpace').value);
  const attendees = Number($('fAttendees').value);
  if (attendees > space.capacity) {
    setNotice($('formErr'), `${space.name} holds ${space.capacity} people.`);
    return;
  }

  const button = event.submitter ?? $('requestForm').querySelector('button[type=submit]');
  try {
    await whileBusy(button, 'Sending…', async () => {
      const data = await post('/api/bookings', {
        spaceSlug: $('fSpace').value,
        eventDate: $('fDate').value,
        startTime: $('fStart').value,
        endTime: $('fEnd').value,
        attendees,
        purpose: $('fPurpose').value,
        notes: $('fNotes').value,
        visibility: $('fVisibility').value,
        addons: selectedAddons(),
      });
      toast(`Request ${data.reference} sent — ${money(data.total)}`);
    });
    await Promise.all([loadMyBookings(), loadAvailability(), loadCalendar()]);
  } catch (err) {
    setNotice($('formErr'), err.message);
  }
});

/* -------------------------------------------------------------- page wiring */

$('lockSignin').addEventListener('click', (event) => openSignIn(event.currentTarget));

for (const id of ['availSpace', 'availDate']) $(id).addEventListener('change', loadAvailability);
for (const id of ['fStart', 'fEnd']) $(id).addEventListener('change', renderQuote);
$('fSpace').addEventListener('change', () => {
  renderQuote();
  loadAddons($('fSpace').value);
});

function reflectSession(member) {
  $('lockPanel').classList.toggle('hidden', Boolean(member));
  $('requestForm').classList.toggle('hidden', !member);
  $('mineBlock').classList.toggle('hidden', !member);
  if (!member) return;
  loadAddons($('fSpace').value);
  loadMyBookings();
}

(async function start() {
  mountAccount();
  await loadSpaces();
  session.subscribe((state) => reflectSession(state?.member ?? null));
  await loadAvailability();
  await loadCalendar();
})();
