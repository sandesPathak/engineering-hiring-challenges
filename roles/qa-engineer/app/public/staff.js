const $ = (id) => document.getElementById(id);
const money = (n) => `$${Number(n).toFixed(2)}`;

let token = sessionStorage.getItem('staffToken') ?? null;

async function api(path, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers ?? {}) };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

function query() {
  const params = new URLSearchParams();
  for (const id of ['q', 'status', 'space', 'from', 'to']) {
    if ($(id).value) params.set(id === 'q' ? 'q' : id, $(id).value);
  }
  return params.toString();
}

async function loadStats() {
  const s = await api('/api/staff/stats');
  $('stats').innerHTML = `
    <div class="stat"><div class="n">${s.hoursBooked}</div><div class="l">Hours booked</div></div>
    <div class="stat"><div class="n">${money(s.hireFees)}</div><div class="l">Hire fees</div></div>
    <div class="stat"><div class="n">${s.pendingRequests}</div><div class="l">Awaiting approval</div></div>
    <div class="stat"><div class="n">${money(s.depositsHeld)}</div><div class="l">Deposits held</div></div>
    <div class="stat"><div class="n">${s.utilisation}%</div><div class="l">Utilisation</div></div>`;
}

function actions(b) {
  if (b.status === 'pending') {
    return `<button class="ghost approve" data-ref="${b.reference}">Approve</button>
            <button class="ghost reject" data-ref="${b.reference}">Reject</button>`;
  }
  return '';
}

async function loadRows() {
  $('tableErr').textContent = '';
  try {
    const data = await api(`/api/staff/bookings?${query()}`);
    $('rows').innerHTML = data.bookings
      .map(
        (b) => `<tr>
          <td>${b.reference}</td>
          <td>${b.member.name}<br /><span class="l">${b.member.email}</span></td>
          <td>${b.space}</td>
          <td>${b.date}<br />${b.start}–${b.end}</td>
          <td>${b.hours}</td>
          <td>${money(b.hireFee)}</td>
          <td><span class="pill ${b.status}">${b.status}</span></td>
          <td>${b.purpose ?? ''}${b.notes ? `<br /><span class="l">${b.notes}</span>` : ''}</td>
          <td>${actions(b)}</td>
        </tr>`,
      )
      .join('');
  } catch (err) {
    $('tableErr').textContent = err.message;
  }
}

async function loadSpaces() {
  const data = await api('/api/spaces');
  for (const s of data.spaces) {
    const opt = document.createElement('option');
    opt.value = s.slug;
    opt.textContent = s.name;
    $('space').appendChild(opt);
  }
}

async function decide(reference, decision) {
  await api(`/api/staff/bookings/${reference}/${decision}`, { method: 'POST', body: JSON.stringify({}) });
  await loadRows();
  await loadStats();
}

$('rows').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.classList.contains('approve')) decide(button.dataset.ref, 'approve');
  if (button.classList.contains('reject')) decide(button.dataset.ref, 'reject');
});

$('signin').addEventListener('click', async () => {
  $('loginErr').textContent = '';
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: $('email').value, password: $('password').value }),
    });
    token = data.token;
    sessionStorage.setItem('staffToken', token);
    await start();
  } catch (err) {
    $('loginErr').textContent = err.message;
  }
});

$('signout').addEventListener('click', () => {
  sessionStorage.removeItem('staffToken');
  location.reload();
});

$('apply').addEventListener('click', loadRows);
$('csv').addEventListener('click', () => {
  window.location = `/api/staff/bookings.csv?${query()}&token=${token}`;
});

async function start() {
  if (!token) return;
  $('loginView').classList.add('hidden');
  $('consoleView').classList.remove('hidden');
  await loadSpaces();
  await loadStats();
  await loadRows();
}

start();
