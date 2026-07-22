// Action-panel view for non-CRUD resources (e.g. Notifications: register/
// unregister device, send test push). Each action renders its own small form.
import { h, mount } from '../ui/dom.js';
import { breadcrumb, button, field as fieldWrap, input, textarea, select } from '../ui/components.js';
import { toast } from '../ui/toast.js';
import { ApiError } from '../api/errors.js';
import { runAction } from '../data/api.js';

export function renderActions(outletEl, resource, { router }) {
  const cards = (resource.actions || []).map((action) => actionCard(action));
  mount(
    outletEl,
    h('div.page', [
      breadcrumb([{ label: 'Overview', href: '/' }, { label: resource.label }]),
      h('div.page__head', [h('div', [h('h1.page__title', resource.label), h('p.page__sub', 'Run backend actions for this resource.')])]),
      h('div.actions-grid', cards),
    ])
  );
}

function actionCard(action) {
  const controls = new Map();
  const form = h('form.rform', { novalidate: true });

  (action.inputs || []).map((f) => f.name ? f : { name: f, type: 'string' }).forEach((f) => {
    const ctrl = buildInput(f);
    controls.set(f.name, ctrl);
    form.appendChild(ctrl.wrap);
  });

  const runBtn = button(action.label, { type: 'submit' });
  form.appendChild(h('div.rform__actions', [runBtn]));

  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const body = {};
    let err = false;
    for (const [name, c] of controls) {
      const v = c.get();
      const f = c.field;
      if (f.required && (v === '' || v == null)) {
        c.setError('Required');
        err = true;
        continue;
      }
      if (v !== '' && v != null) body[name] = v;
    }
    if (err) return toast.error('Please complete the required fields.');

    busy = true;
    runBtn.classList.add('btn--loading');
    runBtn.disabled = true;
    try {
      const res = await runAction(action, body);
      toast.success((res && (res.detail || res.message)) || `${action.label}: done.`);
    } catch (ex) {
      if (ex instanceof ApiError && ex.fieldErrors) {
        for (const [name, msgs] of Object.entries(ex.fieldErrors)) {
          const c = controls.get(name);
          if (c) c.setError(Array.isArray(msgs) ? msgs.join(' ') : String(msgs));
        }
      }
      toast.error((ex && ex.message) || 'Action failed.');
    } finally {
      busy = false;
      runBtn.classList.remove('btn--loading');
      runBtn.disabled = false;
    }
  });

  return h('div.card.action-card', [
    h('h3.action-card__title', action.label),
    action.description ? h('p.action-card__desc', action.description) : null,
    form,
  ]);
}

function buildInput(f) {
  let el;
  let get;
  const label = f.label || pretty(f.name);
  if (f.type === 'choice') {
    const sel = select({ options: (f.choices || []).map((c) => ({ value: c, label: c })), placeholder: '— Select —' });
    el = sel;
    get = () => sel.value || '';
  } else if (f.type === 'text') {
    const ta = textarea({});
    el = ta;
    get = () => ta.value;
  } else if (f.type === 'json') {
    const ta = textarea({ placeholder: '{ }' });
    el = ta;
    get = () => {
      const raw = ta.value.trim();
      if (!raw) return '';
      try {
        return JSON.parse(raw);
      } catch (e) {
        return raw;
      }
    };
  } else {
    const inp = input({});
    el = inp;
    get = () => inp.value;
  }
  const errSlot = { cur: null };
  const wrap = fieldWrap({ label, input: el, required: !!f.required, hint: f.hint || null });
  return {
    field: f,
    wrap,
    get,
    setError: (m) => {
      wrap.classList.add('field--error');
      if (!errSlot.cur) {
        errSlot.cur = h('div.field__error', { role: 'alert' }, m);
        wrap.appendChild(errSlot.cur);
      } else errSlot.cur.textContent = m;
    },
    clearError: () => {
      wrap.classList.remove('field--error');
      if (errSlot.cur) {
        errSlot.cur.remove();
        errSlot.cur = null;
      }
    },
  };
}

function pretty(k) {
  return String(k).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
