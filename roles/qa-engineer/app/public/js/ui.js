export const $ = (id) => document.getElementById(id);

/** el('button.ghost.small', { type: 'button' }, 'Cancel') */
export function el(spec, attrs = {}, ...children) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key in node && key !== 'list') node[key] = value;
    else node.setAttribute(key, value);
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
}

function toastHost() {
  let host = document.querySelector('.toasts');
  if (!host) {
    host = el('div.toasts', { role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(host);
  }
  return host;
}

export function toast(message, tone = 'good') {
  const node = el(`div.toast${tone === 'bad' ? '.bad' : ''}`, {}, message);
  toastHost().appendChild(node);
  setTimeout(() => node.remove(), 4000);
}

/** Disables a button and swaps its label while an async action is in flight. */
export async function whileBusy(button, label, work) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = label;
  try {
    return await work();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

export function setNotice(node, message, tone = 'error') {
  node.textContent = message ?? '';
  node.className = `notice${tone === 'error' ? '' : ` ${tone}`}`;
}
