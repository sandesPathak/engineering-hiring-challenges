const $ = (id) => document.getElementById(id);
const money = (n) => `$${Number(n).toFixed(2)}`;

let token = sessionStorage.getItem('token') ?? null;
let spaces = [];
let addons = [];

async function api(path, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers ?? {}) };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

function spaceCard(s) {
  const el = document.createElement('div');
  el.className = `card${s.isActive ? '' : ' closed'}`;
  el.innerHTML = `
    <h3></h3>
    <p></p>
    <div class="meta"></div>`;
  el.querySelector('h3').textContent = s.name;
  el.querySelector('p').textContent = s.description;
  el.querySelector('.meta').textContent = s.isActive
    ? `Up to ${s.capacity} · ${money(s.hourlyRate)}/hour · ${money(s.deposit)} deposit`
    : 'Not currently bookable';
  return el;
}

async function loadSpaces() {
  const data = await api('/api/spaces');
  spaces = data.spaces;

  const wrap = $('spaces');
  wrap.textContent = '';
  for (const s of spaces) wrap.appendChild(spaceCard(s));

  for (const select of [$('availSpace'), $('fSpace')]) {
    select.textContent = '';
    for (const s of spaces.filter((x) => x.isActive)) {
      const opt = document.createElement('option');
      opt.value = s.slug;
      opt.textContent = s.name;
      select.appendChild(opt);
    }
  }
}

async function loadAddons(slug) {
  const data = await api(`/api/spaces/${slug}`);
  addons = data.addons;
  const row = $('addonRow');
  row.textContent = '';
  for (const a of addons) {
    const div = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = `${a.name} — ${money(a.unitPrice)}`;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = '0';
    input.dataset.code = a.code;
    input.className = 'addon';
    input.addEventListener('input', renderQuote);
    div.append(label, input);
    row.appendChild(div);
  }
  renderQuote();
}

function selectedAddons() {
  return [...document.querySelectorAll('.addon')]
    .map((i) => ({ code: i.dataset.code, quantity: Number(i.value) }))
    .filter((l) => l.quantity !== 0);
}

function hoursBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

function renderQuote() {
  const space = spaces.find((s) => s.slug === $('fSpace').value);
  if (!space) return;
  const hours = hoursBetween($('fStart').value, $('fEnd').value);
  let total = hours * space.hourlyRate;
  for (const line of selectedAddons()) {
    total += addons.find((a) => a.code === line.code).unitPrice * line.quantity;
  }
  $('quote').textContent = `${hours} hours · hire ${money(hours * space.hourlyRate)} · total ${money(total)} · deposit ${money(space.deposit)} held`;
}

async function loadAvailability() {
  const slug = $('availSpace').value;
  const date = $('availDate').value;
  if (!slug || !date) return;

  const data = await api(`/api/spaces/${slug}/availability?date=${date}`);
  $('availNote').textContent = data.closed ? `Closed: ${data.reason}` : '';

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

async function loadCalendar() {
  const data = await api('/api/calendar?from=2026-09-01&to=2026-12-31');
  const wrap = $('calendar');
  wrap.textContent = '';

  for (const e of data.events.slice(0, 25)) {
    const row = document.createElement('div');
    row.className = `event${e.visibility === 'private' ? ' private' : ''}`;
    row.innerHTML = `
      <span class="when"></span>
      <div class="what"></div>
      <div class="where"></div>
      <div class="who"></div>`;
    row.querySelector('.when').textContent = `${e.date} ${e.start}–${e.end}`;
    row.querySelector('.what').textContent = e.title;
    row.querySelector('.where').textContent = e.space;
    row.querySelector('.who').textContent = `Booked by ${e.bookedBy}`;
    wrap.appendChild(row);
  }
}

function showForm() {
  $('signinPrompt').classList.add('hidden');
  $('requestForm').classList.remove('hidden');
  loadAddons($('fSpace').value);
}

$('signin').addEventListener('click', async () => {
  $('signinErr').textContent = '';
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: $('email').value, password: $('password').value }),
    });
    token = data.token;
    sessionStorage.setItem('token', token);
    showForm();
  } catch (err) {
    $('signinErr').textContent = err.message;
  }
});

$('requestForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  $('formErr').textContent = '';

  const space = spaces.find((s) => s.slug === $('fSpace').value);
  const attendees = Number($('fAttendees').value);
  if (attendees > space.capacity) {
    $('formErr').textContent = `${space.name} holds ${space.capacity} people.`;
    return;
  }

  try {
    const data = await api('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        spaceSlug: $('fSpace').value,
        eventDate: $('fDate').value,
        startTime: $('fStart').value,
        endTime: $('fEnd').value,
        attendees,
        purpose: $('fPurpose').value,
        notes: $('fNotes').value,
        visibility: $('fVisibility').value,
        addons: selectedAddons(),
      }),
    });
    $('quote').textContent = `Request ${data.reference} sent — ${data.message} Total ${money(data.total)}.`;
    loadAvailability();
    loadCalendar();
  } catch (err) {
    $('formErr').textContent = err.message;
  }
});

for (const id of ['availSpace', 'availDate']) $(id).addEventListener('change', loadAvailability);
for (const id of ['fStart', 'fEnd', 'fSpace']) $(id).addEventListener('change', renderQuote);
$('fSpace').addEventListener('change', () => loadAddons($('fSpace').value));

(async function start() {
  await loadSpaces();
  await loadAvailability();
  await loadCalendar();
  if (token) showForm();
})();
