import { api, post } from './js/api.js';
import { session } from './js/session.js';
import { mountAccount, openSignIn } from './js/account.js';
import { createRouter } from './js/router.js';
import { $, el, toast, setNotice } from './js/ui.js';
import { money, shortDate, longDate, timeRange, stamp } from './js/format.js';

let page = 1;

/* ============================================================== the query */

function filters() {
  const params = new URLSearchParams();
  for (const id of ['q', 'status', 'space', 'from', 'to', 'sort', 'dir']) {
    const value = $(id).value;
    if (value && value !== 'all') params.set(id, value);
  }
  return params;
}

function pagedQuery() {
  const params = filters();
  params.set('page', String(page));
  params.set('pageSize', $('pageSize').value);
  return params.toString();
}

/* ================================================================ figures */

async function loadStats() {
  const stats = await api('/api/staff/stats');
  $('pendingCount').textContent = stats.pendingRequests ? String(stats.pendingRequests) : '';
  $('stats').innerHTML = `
    <div class="stat"><div class="n">${stats.hoursBooked}</div><div class="l">Hours booked</div></div>
    <div class="stat"><div class="n">${money(stats.hireFees)}</div><div class="l">Hire fees</div></div>
    <div class="stat"><div class="n">${stats.pendingRequests}</div><div class="l">Awaiting approval</div></div>
    <div class="stat"><div class="n">${money(stats.depositsHeld)}</div><div class="l">Deposits held</div></div>
    <div class="stat"><div class="n">${stats.utilisation}%</div><div class="l">Utilisation</div></div>`;
}

/* ========================================================= decision queue */

function decideButtons(reference) {
  const approve = el('button.small', { type: 'button' }, 'Approve');
  const reject = el('button.danger.small', { type: 'button' }, 'Reject');
  approve.addEventListener('click', () => decide(reference, 'approve'));
  reject.addEventListener('click', () => decide(reference, 'reject'));
  return el('div.decide', {}, approve, reject);
}

function fact(key, value) {
  return el('div', {}, el('div.k', {}, key), el('div.v', {}, value));
}

async function loadQueue() {
  const data = await api('/api/staff/bookings?status=pending&pageSize=100&sort=event_date&dir=asc');
  const wrap = $('queue');
  wrap.textContent = '';

  if (!data.bookings.length) {
    wrap.appendChild(el('div.card.empty', {}, 'Nothing is waiting. The desk is clear.'));
    return;
  }

  for (const b of data.bookings) {
    wrap.appendChild(
      el('div.card.flush.req', {},
        el('div.top', {},
          el('div', {},
            el('div.ref', {}, `${b.reference} · ${b.purpose ?? 'No purpose given'}`),
            el('div.who', {}, `${b.member.name} · ${b.member.email}`)),
          decideButtons(b.reference)),
        el('div.req-facts', {},
          fact('Space', b.space),
          fact('Date', longDate(b.date)),
          fact('Time', timeRange(b.start, b.end)),
          fact('Hours', String(b.hours)),
          fact('Attendees', String(b.attendees)),
          fact('Hire fee', money(b.hireFee)))),
    );
  }
}

/* =========================================================== the table */

function actions(booking) {
  if (booking.status !== 'pending') return '';
  return `<div class="btn-row">
            <button class="ghost small approve" data-ref="${booking.reference}">Approve</button>
            <button class="danger small reject" data-ref="${booking.reference}">Reject</button>
          </div>`;
}

function rowHtml(b) {
  return `<tr>
    <td class="nums">${b.reference}</td>
    <td>${b.member.name}<span class="sub">${b.member.email}</span></td>
    <td>${b.space}</td>
    <td class="nums">${shortDate(b.date)}<span class="sub">${b.start}–${b.end}</span></td>
    <td class="nums">${b.hours}</td>
    <td class="nums">${money(b.hireFee)}</td>
    <td><span class="pill ${b.status}">${b.status}</span></td>
    <td>${b.purpose ?? ''}${b.notes ? `<span class="sub">${b.notes}</span>` : ''}</td>
    <td>${actions(b)}</td>
  </tr>`;
}

function renderPager(total) {
  const size = Number($('pageSize').value);
  const first = total === 0 ? 0 : (page - 1) * size + 1;
  const last = Math.min(page * size, total);

  $('pageInfo').textContent = `${first}–${last} of ${total}`;
  $('resultCount').textContent = `${total} booking${total === 1 ? '' : 's'} match`;
  $('prev').disabled = page <= 1;
  $('next').disabled = last >= total;
}

async function loadRows() {
  setNotice($('tableErr'), '');
  try {
    const data = await api(`/api/staff/bookings?${pagedQuery()}`);
    $('rows').innerHTML = data.bookings.map(rowHtml).join('');
    $('emptyState').classList.toggle('hidden', data.bookings.length > 0);
    renderPager(data.total);
  } catch (err) {
    setNotice($('tableErr'), err.message);
  }
}

/* ================================================================= audit */

async function loadAudit() {
  const data = await api('/api/staff/audit');
  const rows = $('auditRows');
  rows.textContent = '';
  $('auditEmpty').classList.toggle('hidden', data.entries.length > 0);

  for (const entry of data.entries) {
    rows.appendChild(
      el('tr', {},
        el('td', {}, stamp(entry.created_at)),
        el('td', {}, el('span', { className: `pill ${entry.action}` }, entry.action)),
        el('td.nums', {}, entry.reference ?? '—'),
        el('td', { className: entry.actor_id ? '' : 'actor-missing' }, entry.actor_id ?? '—'),
        el('td', {}, entry.reason ?? '')),
    );
  }
}

/* ============================================================= decisions */

async function decide(reference, decision) {
  try {
    await post(`/api/staff/bookings/${reference}/${decision}`);
    toast(`${reference} ${decision === 'approve' ? 'approved' : 'rejected'}`);
    await Promise.all([loadQueue(), loadStats()]);
    if (router.current() === 'bookings') await loadRows();
  } catch (err) {
    toast(err.message, 'bad');
  }
}

$('rows').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.classList.contains('approve')) decide(button.dataset.ref, 'approve');
  if (button.classList.contains('reject')) decide(button.dataset.ref, 'reject');
});

/* =========================================================== page wiring */

let spacesLoaded = false;

async function loadSpaceOptions() {
  if (spacesLoaded) return;
  const data = await api('/api/spaces');
  for (const space of data.spaces) {
    $('space').appendChild(el('option', { value: space.slug }, space.name));
  }
  spacesLoaded = true;
}

function goToPage(next) {
  page = Math.max(1, next);
  loadRows();
}

$('apply').addEventListener('click', () => goToPage(1));
$('q').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') goToPage(1);
});
for (const id of ['status', 'space', 'from', 'to', 'sort', 'dir', 'pageSize']) {
  $(id).addEventListener('change', () => goToPage(1));
}
$('prev').addEventListener('click', () => goToPage(page - 1));
$('next').addEventListener('click', () => goToPage(page + 1));

$('reset').addEventListener('click', () => {
  for (const id of ['q', 'from', 'to']) $(id).value = '';
  $('status').value = 'all';
  $('space').value = '';
  $('sort').value = 'event_date';
  $('dir').value = 'desc';
  goToPage(1);
});

/**
 * The export is opened with window.location, which cannot set a request header,
 * so the session token travels as a query parameter.
 */
$('csv').addEventListener('click', () => {
  window.location = `/api/staff/bookings.csv?${filters().toString()}&token=${session.token()}`;
});

$('lockSignin').addEventListener('click', (event) => openSignIn(event.currentTarget));

const router = createRouter({
  views: { today: 1, bookings: 1, figures: 1, audit: 1 },
  async onEnter(name) {
    if (!session.isStaff()) return;
    try {
      if (name === 'today') await loadQueue();
      if (name === 'bookings') { await loadSpaceOptions(); await loadRows(); }
      if (name === 'figures') await loadStats();
      if (name === 'audit') await loadAudit();
    } catch (err) {
      toast(err.message, 'bad');
    }
  },
});

function showLocked(title, body) {
  $('lockTitle').textContent = title;
  $('lockBody').textContent = body;
  $('lockPanel').classList.remove('hidden');
  $('consoleView').classList.add('hidden');
}

mountAccount();
session.subscribe((state) => {
  const member = state?.member ?? null;

  if (!member) {
    showLocked('Staff sign-in required', 'The office console is limited to front desk accounts.');
    return;
  }
  if (member.role !== 'staff') {
    showLocked('Staff only', `${member.name} is signed in as a member. Sign in with a front desk account to see the console.`);
    return;
  }

  $('lockPanel').classList.add('hidden');
  $('consoleView').classList.remove('hidden');
  page = 1;
  loadStats().catch(() => {});
  router.start();
});
