import { post } from './api.js';
import { session } from './session.js';
import { $, el, toast, setNotice, whileBusy } from './ui.js';
import { initial } from './format.js';

const DEMO_ACCOUNTS = [
  { label: 'Member', email: 'member@himalayacc.example', password: 'member12345' },
  { label: 'Second member', email: 'other@himalayacc.example', password: 'other12345' },
  { label: 'Front desk', email: 'staff@himalayacc.example', password: 'staff12345' },
];

let dialog = null;
let lastTrigger = null;

function buildDialog() {
  const email = el('input', {
    id: 'signinEmail', type: 'email', name: 'email', required: true,
    autocomplete: 'username', placeholder: 'you@example.com', spellcheck: false,
  });
  const password = el('input', {
    id: 'signinPassword', type: 'password', name: 'password', required: true,
    autocomplete: 'current-password', placeholder: 'Your password',
  });

  const peek = el('button.peek', { type: 'button', 'aria-label': 'Show password' }, 'Show');
  peek.addEventListener('click', () => {
    const shown = password.type === 'text';
    password.type = shown ? 'password' : 'text';
    peek.textContent = shown ? 'Show' : 'Hide';
    peek.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
    password.focus();
  });

  const notice = el('p.notice', { id: 'signinError', role: 'alert' });
  const submit = el('button', { type: 'submit' }, 'Sign in');

  const form = el(
    'form',
    { id: 'signinForm', novalidate: true },
    el('div.sheet-body', {},
      el('div.field', {}, el('label', { htmlFor: 'signinEmail' }, 'Email address'), email),
      el('div.field', {},
        el('label', { htmlFor: 'signinPassword' }, 'Password'),
        el('div.password-field', {}, password, peek)),
      notice,
      submit),
  );

  const chips = el('div.chips');
  for (const account of DEMO_ACCOUNTS) {
    const chip = el('button.small', { type: 'button' }, account.label);
    chip.addEventListener('click', () => {
      email.value = account.email;
      password.value = account.password;
      setNotice(notice, '');
      submit.focus();
    });
    chips.appendChild(chip);
  }

  const close = el('button.quiet.small', { type: 'button', 'aria-label': 'Close' }, 'Close');
  close.addEventListener('click', () => dialog.close());

  const node = el('dialog', { id: 'signinDialog', 'aria-labelledby': 'signinTitle' },
    el('div.sheet-head', {},
      el('div.row', {},
        el('div', { style: 'flex:1' },
          el('h2', { id: 'signinTitle' }, 'Sign in'),
          el('p', {}, 'Members request spaces. Staff open the office console.')),
        close)),
    form,
    el('div.sheet-foot', {},
      el('p.label', {}, 'Test accounts for this exercise'),
      chips));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setNotice(notice, '');
    if (!email.value || !password.value) {
      setNotice(notice, 'Enter your email address and password.');
      return;
    }
    try {
      await whileBusy(submit, 'Signing in…', async () => {
        const data = await post('/api/auth/login', { email: email.value, password: password.value });
        session.set(data.token, data.member);
      });
      password.value = '';
      dialog.close();
      toast(`Signed in as ${session.member().name}`);
    } catch (err) {
      setNotice(notice, err.message);
      password.select();
    }
  });

  // Returning focus to whatever opened the dialog keeps keyboard users where they were.
  node.addEventListener('close', () => lastTrigger?.focus());

  document.body.appendChild(node);
  return node;
}

export function openSignIn(trigger = null) {
  if (!dialog) dialog = buildDialog();
  lastTrigger = trigger ?? document.activeElement;
  setNotice($('signinError'), '');
  dialog.showModal();
  $('signinEmail').focus();
}

function renderChip(host, member) {
  host.textContent = '';
  if (!member) {
    const button = el('button.small', { type: 'button' }, 'Sign in');
    button.addEventListener('click', () => openSignIn(button));
    host.appendChild(button);
    return;
  }

  const out = el('button.ghost.small', { type: 'button' }, 'Sign out');
  out.addEventListener('click', () => {
    session.clear();
    toast('Signed out');
  });

  host.append(
    el('div.who', {},
      el('div.avatar', { 'aria-hidden': 'true' }, initial(member.name)),
      el('div', {},
        el('div.name', {}, member.name),
        el('div.role', {}, member.role))),
    out,
  );
}

/** Wires the masthead account area to the session. Safe to call on every page. */
export function mountAccount(hostId = 'account') {
  const host = $(hostId);
  if (!host) return;
  session.subscribe((state) => renderChip(host, state?.member ?? null));
}
