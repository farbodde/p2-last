// Generic CREATE / EDIT form, driven by resolved field metadata.
// Composite resources (Games) are delegated to their bespoke form.
import { h, mount, clear } from '../ui/dom.js';
import { breadcrumb, button, field as fieldWrap, input, textarea, select, checkbox, spinner, skeleton } from '../ui/components.js';
import { multiSelect } from '../ui/multiselect.js';
import { toast } from '../ui/toast.js';
import { absUrl } from '../ui/format.js';
import { ApiError } from '../api/errors.js';
import { resolveFields } from '../data/metadata.js';
import { createResource, updateResource, retrieveResource } from '../data/api.js';
import { loadRelation } from '../data/relations.js';
import { prettyLabel } from './shared.js';
import { renderGameForm } from './game-form.js';

export async function renderForm(outletEl, resource, { router, id }) {
  if (resource.composite) return renderGameForm(outletEl, resource, { router, id });

  const isEdit = id !== undefined && id !== null;
  const root = h('div.page');
  mount(outletEl, root);
  root.append(
    breadcrumb([{ label: 'Overview', href: '/' }, { label: resource.label, href: `/r/${resource.key}` }, { label: isEdit ? 'Edit' : 'New' }]),
    h('div.page__head', [h('h1.page__title', `${isEdit ? 'Edit' : 'New'} ${singular(resource.label)}`)]),
    h('div.card', h('div.form-loading', [spinner(), h('span', 'Loading form…')]))
  );

  let fields;
  let initial = {};
  try {
    fields = await resolveFields(resource);
    if (isEdit) initial = await retrieveResource(resource, id);
  } catch (e) {
    clear(root).append(
      breadcrumb([{ label: 'Overview', href: '/' }, { label: resource.label, href: `/r/${resource.key}` }]),
      h('div.card', h('p', e?.message || 'Failed to load form.'))
    );
    return;
  }

  // Which fields to show
  const visible = fields.filter((f) => {
    if (f.readOnly) return false;
    if (isEdit && f.createOnly) return false;
    return true;
  });

  // Preload relation options
  const relationKeys = [...new Set(visible.filter((f) => f.relation).map((f) => f.relation))];
  const relations = {};
  await Promise.all(relationKeys.map(async (k) => { relations[k] = await loadRelation(k); }));

  const controls = new Map();
  const formEl = h('form.rform', { novalidate: true });

  visible.forEach((f) => {
    const ctrl = buildControl(f, initial[f.name], relations);
    controls.set(f.name, ctrl);
    formEl.appendChild(ctrl.wrap);
  });

  const submitBtn = button(isEdit ? 'Save changes' : `Create ${singular(resource.label).toLowerCase()}`, { type: 'submit' });
  const cancelBtn = button('Cancel', { kind: 'ghost', type: 'button', onClick: () => router.navigate(`/r/${resource.key}`) });
  formEl.appendChild(h('div.rform__actions', [cancelBtn, submitBtn]));

  let submitting = false;
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    controls.forEach((c) => c.clearError());

    // Build payload
    const payload = {};
    let clientError = false;
    for (const [name, c] of controls) {
      const v = c.get();
      if (v === undefined) continue; // omit (e.g. unchanged file)
      const f = c.field;
      if (f.required && !isEdit && (v === '' || v === null || (Array.isArray(v) && !v.length))) {
        c.setError('This field is required.');
        clientError = true;
        continue;
      }
      if (v === '' && !f.required) continue;
      payload[name] = v;
    }
    if (clientError) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    submitting = true;
    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;
    try {
      if (isEdit) {
        await updateResource(resource, id, payload, fields, { method: resource.updateMethod || 'PATCH' });
        toast.success('Changes saved.');
      } else {
        await createResource(resource, payload, fields);
        toast.success(`${singular(resource.label)} created.`);
      }
      router.navigate(`/r/${resource.key}`);
    } catch (err) {
      handleSubmitError(err, controls);
    } finally {
      submitting = false;
      submitBtn.classList.remove('btn--loading');
      submitBtn.disabled = false;
    }
  });

  clear(root).append(
    breadcrumb([{ label: 'Overview', href: '/' }, { label: resource.label, href: `/r/${resource.key}` }, { label: isEdit ? 'Edit' : 'New' }]),
    h('div.page__head', [h('h1.page__title', `${isEdit ? 'Edit' : 'New'} ${singular(resource.label)}`)]),
    h('div.card.card--form', formEl)
  );
}

// Build a single labelled control. Returns { field, wrap, get, setError, clearError }.
function buildControl(f, value, relations) {
  const label = f.label || prettyLabel(f.name);
  let el;
  let get;
  const errSlot = { current: null };

  switch (f.type) {
    case 'boolean': {
      const box = checkbox({ checked: !!value });
      el = h('div', box);
      get = () => box.checked;
      break;
    }
    case 'choice': {
      const opts = (f.choices || []).map((c) => (typeof c === 'object' ? c : { value: c, label: c }));
      const sel = select({ value: value ?? '', options: opts, placeholder: f.required ? null : '—' });
      el = sel;
      get = () => sel.value || '';
      break;
    }
    case 'pk': {
      const opts = relations[f.relation] || [];
      const sel = select({ value: value ?? '', options: opts, placeholder: '— Select —' });
      el = sel;
      get = () => (sel.value === '' ? '' : Number(sel.value));
      break;
    }
    case 'list': {
      if (f.relation) {
        const ms = multiSelect({ options: relations[f.relation] || [], value: normalizeIds(value) });
        el = ms.el;
        get = () => ms.getValue();
      } else {
        // free list (e.g. languages) — comma separated
        const inp = input({ value: Array.isArray(value) ? value.join(', ') : value || '', placeholder: 'comma,separated,values' });
        el = inp;
        get = () => inp.value.split(',').map((s) => s.trim()).filter(Boolean);
      }
      break;
    }
    case 'image': {
      const file = h('input.input.file', { type: 'file', accept: 'image/*' });
      const preview = h('div.file__preview');
      const current = typeof value === 'string' ? absUrl(value) : null;
      if (current) preview.appendChild(h('img.thumb.thumb--lg', { src: current, alt: '' }));
      file.addEventListener('change', () => {
        clear(preview);
        const fobj = file.files && file.files[0];
        if (fobj) preview.appendChild(h('img.thumb.thumb--lg', { src: URL.createObjectURL(fobj), alt: '' }));
        else if (current) preview.appendChild(h('img.thumb.thumb--lg', { src: current, alt: '' }));
      });
      el = h('div.file-field', [file, preview]);
      get = () => (file.files && file.files[0]) || undefined; // omit if unchanged
      break;
    }
    case 'text': {
      const ta = textarea({ value: value ?? '' });
      el = ta;
      get = () => ta.value;
      break;
    }
    case 'integer': {
      const inp = input({ type: 'number', value: value ?? '' });
      el = inp;
      get = () => (inp.value === '' ? '' : Number(inp.value));
      break;
    }
    case 'date': {
      const inp = input({ type: 'date', value: value ? String(value).slice(0, 10) : '' });
      el = inp;
      get = () => inp.value || '';
      break;
    }
    case 'json': {
      const ta = textarea({ value: value ? JSON.stringify(value, null, 2) : '', rows: 5 });
      el = ta;
      get = () => {
        const raw = ta.value.trim();
        if (!raw) return '';
        try {
          return JSON.parse(raw);
        } catch (e) {
          return raw; // let backend reject; setError handled on submit
        }
      };
      break;
    }
    case 'email':
    default: {
      const inp = input({ type: f.type === 'email' ? 'email' : 'text', value: value ?? '', max: f.max_length || null });
      if (f.max_length) inp.maxLength = f.max_length;
      el = inp;
      get = () => inp.value;
    }
  }

  const wrap = fieldWrap({ label, input: el, required: f.required && !f.readOnly, hint: f.hint || null });
  return {
    field: f,
    wrap,
    get,
    setError: (msg) => {
      wrap.classList.add('field--error');
      if (!errSlot.current) {
        errSlot.current = h('div.field__error', { role: 'alert' }, msg);
        wrap.appendChild(errSlot.current);
      } else errSlot.current.textContent = msg;
    },
    clearError: () => {
      wrap.classList.remove('field--error');
      if (errSlot.current) {
        errSlot.current.remove();
        errSlot.current = null;
      }
    },
  };
}

function handleSubmitError(err, controls) {
  if (err instanceof ApiError && err.fieldErrors) {
    let firstMsgShown = false;
    for (const [name, msgs] of Object.entries(err.fieldErrors)) {
      const c = controls.get(name);
      if (c) c.setError(Array.isArray(msgs) ? msgs.join(' ') : String(msgs));
      else if (!firstMsgShown) {
        toast.error(`${prettyLabel(name)}: ${Array.isArray(msgs) ? msgs[0] : msgs}`);
        firstMsgShown = true;
      }
    }
    toast.error(err.message || 'Please correct the errors.');
  } else {
    toast.error((err && err.message) || 'Save failed.');
  }
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (v && typeof v === 'object' ? v.id : v));
}

function singular(label) {
  return label.replace(/s$/, '');
}
