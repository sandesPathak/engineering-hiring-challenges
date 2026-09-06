const SLUG = 'aangan-courtyard';
const sessionId = `s_${Math.random().toString(36).slice(2)}`;
let selectedUnits = [];

const $ = (id) => document.getElementById(id);
const money = (n) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

async function loadCampaign() {
  const res = await fetch(`/api/campaigns/${SLUG}`);
  const c = await res.json();

  $('title').textContent = c.title;
  $('story').textContent = c.story;
  $('raised').textContent = money(c.raised);
  $('goal').textContent = money(c.goal);
  $('donors').textContent = c.donorCount;
  $('percent').textContent = `${c.percent.toFixed(1)}%`;
  $('bar').style.width = `${Math.min(c.percent, 100)}%`;

  $('presets').innerHTML = '';
  for (const p of c.presets) {
    const b = document.createElement('button');
    b.textContent = money(p);
    b.onclick = () => {
      $('amount').value = p;
      document.querySelectorAll('.presets button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    };
    $('presets').appendChild(b);
  }
}

async function loadDonations() {
  const res = await fetch(`/api/campaigns/${SLUG}/donations?limit=25`);
  const { data } = await res.json();

  if (!data.length) {
    $('list').textContent = 'No donations yet. Be the first.';
    return;
  }

  $('list').innerHTML = data
    .map((d) => {
      const ded = d.dedication
        ? `<div class="ded">${d.dedication.type === 'in_memory_of' ? 'In memory of' : 'In honour of'} ${d.dedication.name}</div>`
        : '';
      const msg = d.message ? `<div class="msg">${d.message}</div>` : '';
      return `<div class="donation">
          <span class="amt">${money(d.amount)}</span>
          <div class="who">${d.displayName}</div>
          ${ded}${msg}
        </div>`;
    })
    .join('');
}

async function loadUnits() {
  const res = await fetch(`/api/campaigns/${SLUG}/units`);
  const { data } = await res.json();
  $('grid').innerHTML = '';
  for (const u of data) {
    const b = document.createElement('button');
    b.textContent = u.code;
    b.className = u.status === 'dedicated' ? 'dedicated' : u.status === 'held' ? 'held' : '';
    b.onclick = () => {
      if (u.status !== 'available') return;
      if (selectedUnits.includes(u.code)) {
        selectedUnits = selectedUnits.filter((c) => c !== u.code);
        b.classList.remove('on');
      } else {
        selectedUnits.push(u.code);
        b.classList.add('on');
      }
    };
    $('grid').appendChild(b);
  }
}

async function donate() {
  $('error').textContent = '';

  const body = {
    campaignSlug: SLUG,
    amount: $('amount').value,
    donor: { name: $('name').value, email: $('email').value },
    dedication: $('dedType').value
      ? { type: $('dedType').value, name: $('dedName').value, message: $('message').value }
      : null,
    privacyMode: $('privacy').value,
    isRecurring: $('recurring').checked,
    paymentToken: 'tok_ok',
  };

  const res = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await res.json();
  if (!res.ok) {
    $('error').textContent = payload.error ?? 'Something went wrong';
    return;
  }

  $('receipt').textContent = payload.receiptNumber;
  $('thanks').classList.remove('hidden');
  await loadCampaign();
  await loadDonations();
}

async function holdUnits() {
  $('holdError').textContent = '';
  const res = await fetch(`/api/campaigns/${SLUG}/units/hold`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ codes: selectedUnits, sessionId }),
  });
  const payload = await res.json();
  if (!res.ok) {
    $('holdError').textContent = payload.error ?? 'Could not hold those stones';
  }
  selectedUnits = [];
  await loadUnits();
}

$('give').addEventListener('click', donate);
$('hold').addEventListener('click', holdUnits);
$('close').addEventListener('click', () => $('thanks').classList.add('hidden'));

loadCampaign();
loadDonations();
loadUnits();
