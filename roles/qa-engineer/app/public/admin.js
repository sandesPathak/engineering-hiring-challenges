const $ = (id) => document.getElementById(id);
const money = (n) => `$${n.toFixed(2)}`;
let page = 1;

function token() {
  return localStorage.getItem('aangan_token');
}

function authHeaders() {
  return { authorization: `Bearer ${token()}` };
}

async function signIn() {
  $('loginError').textContent = '';
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: $('email').value, password: $('password').value }),
  });
  const payload = await res.json();
  if (!res.ok) {
    $('loginError').textContent = payload.error;
    return;
  }
  localStorage.setItem('aangan_token', payload.token);
  show();
}

function show() {
  if (!token()) return;
  $('loginPane').classList.add('hidden');
  $('adminPane').classList.remove('hidden');
  loadStats();
  loadRows();
}

async function loadStats() {
  const res = await fetch('/api/admin/stats', { headers: authHeaders() });
  if (!res.ok) return;
  const s = await res.json();
  const completed = s.byStatus.find((b) => b.status === 'completed') ?? { total: 0, count: 0 };
  $('stats').innerHTML = `
    <div class="stat"><div class="n">${money(s.today.total)}</div><div class="l">Raised today</div></div>
    <div class="stat"><div class="n">${money(completed.total)}</div><div class="l">Raised all time</div></div>
    <div class="stat"><div class="n">${completed.count}</div><div class="l">Completed gifts</div></div>
    <div class="stat"><div class="n">${s.recurringDonors}</div><div class="l">Recurring</div></div>`;
}

async function loadRows() {
  const params = new URLSearchParams({ page, pageSize: 25 });
  if ($('q').value) params.set('q', $('q').value);
  if ($('status').value) params.set('status', $('status').value);
  if ($('from').value) params.set('from', $('from').value);
  if ($('to').value) params.set('to', $('to').value);

  const res = await fetch(`/api/admin/donations?${params}`, { headers: authHeaders() });
  const payload = await res.json();

  $('rows').innerHTML = payload.data
    .map(
      (d) => `<tr>
        <td>${d.receipt_number}</td>
        <td>${d.donor_name}<br><span class="l">${d.donor_email}</span></td>
        <td>${d.campaign}</td>
        <td>${money(d.amount)}</td>
        <td><span class="pill ${d.status}">${d.status}</span></td>
        <td>${d.dedication_name ?? ''} ${d.dedication_message ?? ''}</td>
        <td>${new Date(d.created_at).toLocaleDateString()}</td>
        <td><button class="ghost" data-refund="${d.id}">Refund</button></td>
      </tr>`,
    )
    .join('');

  $('pageInfo').textContent = `Page ${payload.page} of ${payload.totalPages} — ${payload.total} donations`;

  document.querySelectorAll('[data-refund]').forEach((b) => {
    b.addEventListener('click', () => refund(b.dataset.refund));
  });
}

async function refund(id) {
  await fetch(`/api/admin/donations/${id}/refund`, {
    method: 'POST',
    headers: { ...authHeaders(), 'content-type': 'application/json' },
    body: JSON.stringify({ reason: 'Refunded from the staff console' }),
  });
  loadStats();
  loadRows();
}

$('signin').addEventListener('click', signIn);
$('apply').addEventListener('click', () => { page = 1; loadRows(); });
$('prev').addEventListener('click', () => { page = Math.max(1, page - 1); loadRows(); });
$('next').addEventListener('click', () => { page += 1; loadRows(); });
$('export').addEventListener('click', async () => {
  const res = await fetch('/api/admin/donations.csv', { headers: authHeaders() });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'donations.csv';
  a.click();
});
$('signout').addEventListener('click', () => {
  localStorage.removeItem('aangan_token');
  location.reload();
});

show();
