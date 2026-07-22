// Toast notifications. toast.success('Saved'), toast.error(err.message).
import { h } from './dom.js';
import { icon } from './icons.js';

function root() {
  return document.getElementById('toast-root');
}

function show(kind, message, { title = null, timeout = 4500 } = {}) {
  const r = root();
  if (!r) return;
  const iconName = kind === 'success' ? 'check' : kind === 'error' ? 'alert' : 'inbox';
  const el = h('div.toast', { class: `toast--${kind}`, role: 'status' }, [
    h('span.toast__icon', icon(iconName, { size: 18 })),
    h('div.toast__body', [
      title ? h('div.toast__title', title) : null,
      h('div.toast__msg', String(message || '')),
    ]),
    h('button.toast__close', { type: 'button', 'aria-label': 'Dismiss', onclick: () => dismiss(el) }, icon('x', { size: 16 })),
  ]);
  r.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast--in'));
  if (timeout) setTimeout(() => dismiss(el), timeout);
  return el;
}

function dismiss(el) {
  if (!el || !el.isConnected) return;
  el.classList.remove('toast--in');
  el.classList.add('toast--out');
  setTimeout(() => el.remove(), 220);
}

export const toast = {
  success: (msg, opts) => show('success', msg, opts),
  error: (msg, opts) => show('error', msg, opts),
  info: (msg, opts) => show('info', msg, opts),
};
