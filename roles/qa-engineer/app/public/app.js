import { api, post } from './js/api.js';
import { session } from './js/session.js';
import { mountAccount, openSignIn } from './js/account.js';
import { createRouter } from './js/router.js';
import { $, el, toast, setNotice, whileBusy } from './js/ui.js';
import { money, hoursBetween, longDate, dayHeading, timeRange } from './js/format.js';

let spaces = [];
let addons = [];
let selected = null;

/* ============================================================ space picker */

function spaceOption(space) {
  const input = el('input', {
    type: 'radio', name: 'space', value: space.slug,
    checked: space.slug === selected?.slug, disabled: !space.isActive,
  });
  input.addEventListener('change', () => selectSpace(space.slug));

  const box = el('div.box', {},
    el('div.name', {}, space.name),
    el('div.desc', {}, space.description),
    el('div.meta', {},
      space.isActive
        ? el('span', {}, el('b', {}, `${money(space.hourlyRate)}/hour`), ` · holds ${space.capacity}`)
        : 'Closed for renovation'),
  );

  return el('label', { className: `space-card${space.isActive ? '' : ' closed'}` }, input, box);
}

function selectSpace(slug) {
  selected = spaces.find((s) => s.slug === slug) ?? null;
  if (!selected) return;
  $('panelSpace').textContent = selected.name;
  $('panelCapacity').textContent = `Holds ${selected.capacity} · ${money(selected.deposit)} deposit`;
  loadAddons(slug);
  loadAvailability();
  renderQuote();
}

async function loadSpaces() {
  const data = await api('/api/spaces');
  spaces = data.spaces;
  selected = spaces.find((s) => s.isActive) ?? null;

  const picker = $('spaces');
  picker.textContent = '';
  for (const space of spaces) picker.appendChild(spaceOption(space));

  const rows = $('spaceRows');
  rows.textContent = '';
  for (const space of spaces) {
    rows.appendChild(
      el('tr', {},
        el('td', {}, el('div', { style: 'font-weight:600' }, space.name),
          el('span.sub', {}, space.description)),
        el('td.nums', {}, String(space.capacity)),
        el('td.nums', {}, money(space.hourlyRate)),
        el('td.nums', {}, money(space.deposit)),
        el('td', {}, el('span', { className: `pill ${space.isActive ? 'confirmed' : 'cancelled'}` },
          space.isActive ? 'Bookable' : 'Closed'))),
    );
  }

  if (selected) selectSpace(selected.slug);
}

/* ================================================================ add-ons */

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

/* ================================================================== quote */

function renderQuote() {
  if (!selected) return;

  const hours = hoursBetween($('fStart').value, $('fEnd').value);
  const hire = hours * selected.hourlyRate;
  let total = hire;
  for (const line of selectedAddons()) {
    total += addons.find((a) => a.code === line.code).unitPrice * line.quantity;
  }

  const chosen = selectedAddons().length;
  $('addonSummary').textContent = chosen ? `· ${chosen} selected` : '· none';

  const figure = (label, value) => el('div', {}, el('div.k', {}, label), el('div.v', {}, value));
  const quote = $('quote');
  quote.textContent = '';
  quote.append(
    figure('Hours', String(hours)),
    figure('Hire', money(hire)),
    figure('Total', money(total)),
    figure('Deposit held', money(selected.deposit)),
  );
}

/* =========================================================== availability */

async function loadAvailability() {
  if (!selected) return;
  const date = $('fDate').value;
  if (!date) return;

  const data = await api(`/api/spaces/${selected.slug}/availability?date=${date}`);
  setNotice($('availNote'), data.closed ? `The building is closed that day: ${data.reason}` : '', 'info');

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

/* ============================================================== what's on */

async function loadCalendar() {
  const data = await api('/api/calendar?from=2026-09-01&to=2026-12-31');
  const wrap = $('calendar');
  wrap.textContent = '';

  if (!data.events.length) {
    wrap.appendChild(el('div.card.empty', {}, 'Nothing on the calendar for this period.'));
    return;
  }

  const byDay = new Map();
  for (const event of data.events.slice(0, 60)) {
    if (!byDay.has(event.date)) byDay.set(event.date, []);
    byDay.get(event.date).push(event);
  }

  for (const [date, events] of byDay) {
    const list = el('div.card.flush');
    for (const event of events) {
      list.appendChild(
        el('div', { className: `event${event.visibility === 'private' ? ' private' : ''}` },
          el('div.when', {}, timeRange(event.start, event.end)),
          el('div', {},
            el('div.what', {}, event.title),
            el('div.where', {}, event.space),
            el('div.who', {}, `Booked by ${event.bookedBy}`))),
      );
    }
    wrap.appendChild(el('div.day', {}, el('h2', {}, dayHeading(date)), list));
  }
}

/* =========================================================== my bookings */

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
  $('mineCount').textContent = data.bookings.length ? String(data.bookings.length) : '';

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
          el('div.detail', {}, `${booking.space} · ${longDate(booking.date)} · ${timeRange(booking.start, booking.end)} · ${booking.attendees} people`)),
        el('div.right', {},
          el('span.deposit', {}, `${money(booking.deposit.amount)} ${booking.deposit.status}`),
          el('span', { className: `pill ${booking.status}` }, booking.status),
          cancelButton(booking))),
    );
  }
}

/* ============================================================== requests */

$('requestForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setNotice($('formErr'), '');

  const attendees = Number($('fAttendees').value);
  if (attendees > selected.capacity) {
    setNotice($('formErr'), `${selected.name} holds ${selected.capacity} people.`);
    return;
  }

  const button = event.submitter ?? $('requestForm').querySelector('button[type=submit]');
  try {
    await whileBusy(button, 'Sending…', async () => {
      const data = await post('/api/bookings', {
        spaceSlug: selected.slug,
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
    router.go('my-bookings');
  } catch (err) {
    setNotice($('formErr'), err.message);
  }
});

/* ============================================================ page wiring */

$('lockSignin').addEventListener('click', (event) => openSignIn(event.currentTarget));
$('goBook').addEventListener('click', () => router.go('book'));
$('fDate').addEventListener('change', loadAvailability);
for (const id of ['fStart', 'fEnd']) $(id).addEventListener('change', renderQuote);

const router = createRouter({
  views: { book: 1, 'my-bookings': 1, 'whats-on': 1, spaces: 1 },
  onEnter(name) {
    if (name === 'whats-on') loadCalendar();
    if (name === 'my-bookings') loadMyBookings();
  },
});

session.subscribe((state) => {
  const member = state?.member ?? null;
  $('lockPanel').classList.toggle('hidden', Boolean(member));
  $('requestForm').classList.toggle('hidden', !member);
  if (member) loadMyBookings();
  else $('mineCount').textContent = '';
});

(async function start() {
  mountAccount();
  await loadSpaces();
  router.start();
})();
