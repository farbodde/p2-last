// Accessible modal dialog with focus trap + Escape + backdrop click.
import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { button } from './components.js';

function root() {
  return document.getElementById('dialog-root');
}

/**
 * openDialog({ title, body, actions:[{label, kind, onClick}], onClose })
 * body: Node or string. Returns { close }.
 */
export function openDialog({ title = '', body = null, actions = [], onClose = null, size = 'md' } = {}) {
  const r = root();
  const prevFocus = document.activeElement;

  const dialog = h('div.dialog', { class: `dialog--${size}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Dialog' });
  const header = h('div.dialog__head', [
    h('h2.dialog__title', title),
    h('button.dialog__close', { type: 'button', 'aria-label': 'Close', onclick: () => close() }, icon('x', { size: 18 })),
  ]);
  const content = h('div.dialog__body');
  if (body instanceof Node) content.appendChild(body);
  else if (body != null) content.appendChild(h('p', String(body)));

  const footer = h('div.dialog__foot');
  actions.forEach((a) => {
    footer.appendChild(
      button(a.label, {
        kind: a.kind || 'ghost',
        onClick: () => a.onClick && a.onClick({ close }),
        type: 'button',
        disabled: a.disabled,
      })
    );
  });

  dialog.append(header, content, actions.length ? footer : '');
  const backdrop = h('div.dialog-backdrop', { onclick: (e) => e.target === backdrop && close() }, dialog);

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'Tab') trapFocus(e, dialog);
  }

  function close() {
    document.removeEventListener('keydown', onKey);
    backdrop.classList.remove('dialog-backdrop--in');
    setTimeout(() => {
      if (backdrop.isConnected) backdrop.remove();
    }, 200);
    if (onClose) onClose();
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }

  clear(r).appendChild(backdrop);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => {
    backdrop.classList.add('dialog-backdrop--in');
    const first = dialog.querySelector('input, button, select, textarea, [tabindex]');
    (first || dialog).focus();
  });

  return { close };
}

/** Confirm helper -> Promise<boolean>. */
export function confirmDialog({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', kind = 'danger' } = {}) {
  return new Promise((resolve) => {
    let decided = false;
    const { close } = openDialog({
      title,
      body: message,
      onClose: () => {
        if (!decided) resolve(false);
      },
      actions: [
        { label: 'Cancel', kind: 'ghost', onClick: ({ close }) => { decided = true; close(); resolve(false); } },
        { label: confirmLabel, kind, onClick: ({ close }) => { decided = true; close(); resolve(true); } },
      ],
    });
  });
}

function trapFocus(e, container) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
