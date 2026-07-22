// Lookup view: a resource that requires an identifier before it can show data.
// Used by "User LFGs" (GET /api/v1/lfg/user/<user_id>/), which is read-only and
// may 500 on the backend (known select_related bug) — handled gracefully.
import { h, mount, clear } from '../ui/dom.js';
import { breadcrumb, button, input, field as fieldWrap, table, skeletonTable, emptyState, badge } from '../ui/components.js';
import { normalizeList, ENVELOPE } from '../api/envelopes.js';
import { renderCell } from '../ui/format.js';
import { api } from '../api/client.js';

export function renderLookup(outletEl, resource, { router }) {
  const root = h('div.page');
  mount(outletEl, root);

  const idInput = input({ type: 'number', placeholder: 'Enter a user ID…' });
  const resultsEl = h('div.lookup__results');

  const form = h('form.lookup__form', { novalidate: true }, [
    fieldWrap({ label: 'User ID', input: idInput, required: true }),
    button('Load', { type: 'submit' }),
  ]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const uid = idInput.value.trim();
    if (!uid) return;
    load(uid);
  });

  async function load(uid) {
    mount(resultsEl, h('div.table-wrap', skeletonTable(5, 4)));
    try {
      const raw = await api.get(resource.endpoints.byUser(uid));
      const data = normalizeList(resource.envelope || ENVELOPE.DRF, raw, { page: 1 });
      if (!data.items.length) {
        mount(resultsEl, emptyState({ title: 'No LFGs', message: `User ${uid} has no active LFG posts.`, iconName: 'inbox' }));
        return;
      }
      const cols = Object.keys(data.items[0])
        .filter((k) => typeof data.items[0][k] !== 'object')
        .slice(0, 6)
        .map((k) => ({ key: k, label: k.replace(/_/g, ' '), render: (r) => renderCell(r, k) }));
      mount(resultsEl, [table({ columns: cols, rows: data.items, rowKey: (r) => r.id }), h('p.page__sub', `${data.count} result(s).`)]);
    } catch (err) {
      const is500 = err && err.status >= 500;
      mount(
        resultsEl,
        emptyState({
          title: is500 ? 'Backend error' : 'Could not load',
          message: is500
            ? 'This endpoint returned a server error. Note: the backend has a known bug on this route (select_related("platforms") on a singular FK). Nothing to fix here in the panel.'
            : err?.message || 'Request failed.',
          iconName: 'alert',
        })
      );
    }
  }

  mount(root, [
    breadcrumb([{ label: 'Overview', href: '/' }, { label: resource.label }]),
    h('div.page__head', [h('div', [h('h1.page__title', resource.label), h('p.page__sub', resource.note || 'Look up a user\'s LFG posts (read-only).')])]),
    h('div.card', form),
    resultsEl,
  ]);
}
