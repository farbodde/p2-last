// Bespoke Games CREATE/EDIT form.
//
// Write serializer (GameCreateUpdateSerializer) shape:
//   { title, cover(image), platform_ids:[int], categories:[{category, item_limit, items:[int]}] }
//
// Encoding note (important): this endpoint mixes an ImageField (cover, needs
// multipart) with a NESTED list (categories, natural as JSON). We therefore:
//   • send a JSON body when no new cover file is chosen (works for edit and
//     for create-without-new-image), and
//   • send multipart with DRF bracket-notation (categories[0][category]=…,
//     categories[0][items][0]=…) when a cover file IS chosen, which DRF's
//     html list/dict parsing understands.
// Flagged UNVERIFIED against the live backend in VERIFICATION notes — validate
// the multipart+nested path once a real instance is available.
import { h, mount, clear } from '../ui/dom.js';
import { breadcrumb, button, field as fieldWrap, input, spinner } from '../ui/components.js';
import { multiSelect } from '../ui/multiselect.js';
import { toast } from '../ui/toast.js';
import { absUrl } from '../ui/format.js';
import { ApiError } from '../api/errors.js';
import { api } from '../api/client.js';
import { retrieveResource } from '../data/api.js';
import { loadRelation } from '../data/relations.js';

export async function renderGameForm(outletEl, resource, { router, id }) {
  const isEdit = id !== undefined && id !== null;
  const root = h('div.page');
  mount(outletEl, root);
  root.append(
    breadcrumb([{ label: 'Overview', href: '/' }, { label: 'Games', href: '/r/games' }, { label: isEdit ? 'Edit' : 'New' }]),
    h('div.page__head', [h('h1.page__title', `${isEdit ? 'Edit' : 'New'} Game`)]),
    h('div.card', h('div.form-loading', [spinner(), h('span', 'Loading…')]))
  );

  let platforms = [];
  let categories = [];
  let existing = null;
  try {
    [platforms, categories] = await Promise.all([loadRelation('platforms'), loadRelation('categories')]);
    if (isEdit) existing = await retrieveResource(resource, id);
  } catch (e) {
    clear(root).append(h('div.card', h('p', e?.message || 'Failed to load game form.')));
    return;
  }

  // ── Title ──
  const titleInput = input({ value: existing?.title || '' });
  const titleField = fieldWrap({ label: 'Title', input: titleInput, required: true });

  // ── Cover ──
  const coverInput = h('input.input.file', { type: 'file', accept: 'image/*' });
  const coverPreview = h('div.file__preview');
  if (existing?.cover) coverPreview.appendChild(h('img.thumb.thumb--lg', { src: absUrl(existing.cover), alt: '' }));
  coverInput.addEventListener('change', () => {
    clear(coverPreview);
    const f = coverInput.files && coverInput.files[0];
    if (f) coverPreview.appendChild(h('img.thumb.thumb--lg', { src: URL.createObjectURL(f), alt: '' }));
    else if (existing?.cover) coverPreview.appendChild(h('img.thumb.thumb--lg', { src: absUrl(existing.cover), alt: '' }));
  });
  const coverField = fieldWrap({ label: 'Cover', input: h('div.file-field', [coverInput, coverPreview]), required: !isEdit, hint: isEdit ? 'Leave empty to keep the current cover.' : null });

  // ── Platforms (M2M) ──
  const platformMulti = multiSelect({ options: platforms, value: (existing?.platforms || []).map((p) => p.id) });
  const platformField = fieldWrap({ label: 'Platforms', input: platformMulti.el, required: true });

  // ── Categories repeater ──
  const rowsWrap = h('div.gc-rows');
  const rows = [];

  function addRow(preset) {
    const row = buildCategoryRow(categories, preset, () => {
      const i = rows.indexOf(row);
      if (i >= 0) rows.splice(i, 1);
      row.el.remove();
    });
    rows.push(row);
    rowsWrap.appendChild(row.el);
  }

  (existing?.categories || []).forEach((c) =>
    addRow({ category: c.category, item_limit: c.item_limit, items: (c.items || []).map((i) => i.id) })
  );

  const addBtn = button('Add category', { kind: 'ghost', size: 'sm', type: 'button', onClick: () => addRow() });
  const categoriesField = fieldWrap({
    label: 'Categories & items',
    input: h('div', [rowsWrap, addBtn]),
    hint: 'item_limit of -1 means unlimited.',
  });

  // ── Assemble ──
  const submitBtn = button(isEdit ? 'Save changes' : 'Create game', { type: 'submit' });
  const cancelBtn = button('Cancel', { kind: 'ghost', type: 'button', onClick: () => router.navigate('/r/games') });
  const formEl = h('form.rform', { novalidate: true }, [
    titleField,
    coverField,
    platformField,
    categoriesField,
    h('div.rform__actions', [cancelBtn, submitBtn]),
  ]);

  let submitting = false;
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;

    const title = titleInput.value.trim();
    const platform_ids = platformMulti.getValue();
    const cats = rows.map((r) => r.get()).filter((c) => c.category !== '' && c.category != null);
    const coverFile = coverInput.files && coverInput.files[0];

    // Client validation mirroring the backend
    if (!title) return toast.error('Title is required.');
    if (!platform_ids.length) return toast.error('Select at least one platform.');
    if (!isEdit && !coverFile) return toast.error('A cover image is required.');
    for (const c of cats) {
      if (c.item_limit !== -1 && c.items.length > c.item_limit) {
        return toast.error(`A category has ${c.items.length} items but its limit is ${c.item_limit}.`);
      }
    }

    submitting = true;
    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const path = isEdit ? resource.endpoints.update(id) : resource.endpoints.create;
      if (coverFile) {
        const fd = buildGameFormData({ title, cover: coverFile, platform_ids, categories: cats });
        await api[method === 'POST' ? 'post' : 'patch'](path, { form: fd });
      } else {
        await api[method === 'POST' ? 'post' : 'patch'](path, { body: { title, platform_ids, categories: cats } });
      }
      toast.success(isEdit ? 'Game saved.' : 'Game created.');
      router.navigate('/r/games');
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const first = Object.entries(err.fieldErrors)[0];
        toast.error(`${first[0]}: ${Array.isArray(first[1]) ? first[1][0] : first[1]}`);
      } else {
        toast.error((err && err.message) || 'Save failed.');
      }
    } finally {
      submitting = false;
      submitBtn.classList.remove('btn--loading');
      submitBtn.disabled = false;
    }
  });

  clear(root).append(
    breadcrumb([{ label: 'Overview', href: '/' }, { label: 'Games', href: '/r/games' }, { label: isEdit ? 'Edit' : 'New' }]),
    h('div.page__head', [h('h1.page__title', `${isEdit ? 'Edit' : 'New'} Game`)]),
    h('div.card.card--form', formEl)
  );
}

function buildCategoryRow(categories, preset = {}, onRemove) {
  const catSel = h('select.input.select');
  catSel.appendChild(h('option', { value: '' }, '— Category —'));
  categories.forEach((c) => {
    const o = h('option', { value: c.value }, c.label);
    if (String(c.value) === String(preset.category)) o.selected = true;
    catSel.appendChild(o);
  });

  const limitInput = input({ type: 'number', value: preset.item_limit ?? -1 });
  limitInput.style.maxWidth = '110px';

  const itemsHolder = h('div.gc-row__items');
  let itemsCtrl = { getValue: () => preset.items || [] };

  async function loadItemsFor(categoryId) {
    clear(itemsHolder);
    if (!categoryId) {
      itemsCtrl = { getValue: () => [] };
      itemsHolder.appendChild(h('span.muted', 'Select a category to choose items.'));
      return;
    }
    itemsHolder.appendChild(h('span.muted', 'Loading items…'));
    const opts = await fetchCategoryItems(categoryId);
    clear(itemsHolder);
    itemsCtrl = multiSelect({ options: opts, value: preset.category && String(preset.category) === String(categoryId) ? preset.items || [] : [] });
    itemsHolder.appendChild(itemsCtrl.el);
  }

  catSel.addEventListener('change', () => loadItemsFor(catSel.value));
  // initial
  if (preset.category) loadItemsFor(preset.category);
  else itemsHolder.appendChild(h('span.muted', 'Select a category to choose items.'));

  const el = h('div.gc-row', [
    h('div.gc-row__main', [
      h('div.gc-row__field', [h('label.gc-row__label', 'Category'), catSel]),
      h('div.gc-row__field', [h('label.gc-row__label', 'Item limit'), limitInput]),
      h('button.iconbtn.gc-row__remove', { type: 'button', 'aria-label': 'Remove category', onclick: onRemove }, '✕'),
    ]),
    h('div.gc-row__field', [h('label.gc-row__label', 'Items'), itemsHolder]),
  ]);

  return {
    el,
    get: () => ({
      category: catSel.value === '' ? '' : Number(catSel.value),
      item_limit: limitInput.value === '' ? -1 : Number(limitInput.value),
      items: (itemsCtrl.getValue() || []).map(Number),
    }),
  };
}

async function fetchCategoryItems(categoryId, { maxPages = 20 } = {}) {
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    let data;
    try {
      data = await api.get(`/api/v1/game/admin/categories/${categoryId}/items/`, { query: { page, page_size: 100 } });
    } catch (e) {
      break;
    }
    const items = data.results || (Array.isArray(data) ? data : []);
    items.forEach((it) => out.push({ value: it.id, label: it.title }));
    if (!data.next) break;
  }
  return out;
}

// DRF-compatible multipart encoding (bracket notation for nested lists/dicts).
function buildGameFormData({ title, cover, platform_ids, categories }) {
  const fd = new FormData();
  fd.append('title', title);
  if (cover) fd.append('cover', cover);
  platform_ids.forEach((pid, i) => fd.append(`platform_ids[${i}]`, pid));
  categories.forEach((c, i) => {
    fd.append(`categories[${i}][category]`, c.category);
    fd.append(`categories[${i}][item_limit]`, c.item_limit);
    (c.items || []).forEach((itemId, j) => fd.append(`categories[${i}][items][${j}]`, itemId));
  });
  return fd;
}
