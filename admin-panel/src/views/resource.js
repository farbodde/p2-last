// Resource route (Phase 1 placeholder). In Phase 2 this becomes the full
// list/detail/create/edit experience. For now it proves routing + shows the
// resource's discovered contract so the checkpoint is inspectable.
import { h, mount } from '../ui/dom.js';
import { breadcrumb, badge, emptyState, button } from '../ui/components.js';
import { getResource } from '../resources/registry.js';

export function renderResource(outletEl, key, { router }) {
  const res = getResource(key);
  if (!res) {
    mount(outletEl, h('div.page', emptyState({ title: 'Unknown resource', message: key, iconName: 'alert' })));
    return;
  }

  const caps = Object.entries(res.capabilities || {})
    .filter(([, v]) => v)
    .map(([k]) => badge(k, { kind: 'neutral' }));

  const gateLabel = res.gate === 'is_staff' ? 'is_staff' : 'group: admin';

  mount(
    outletEl,
    h('div.page', [
      breadcrumb([{ label: 'Overview', href: '/' }, { label: res.label }]),
      h('div.page__head', [
        h('div', [h('h1.page__title', res.label), h('p.page__sub', res.note || `Backend contract for “${res.label}”.`)]),
      ]),
      h('div.card', [
        h('div.kv', [h('span.kv__k', 'Permission gate'), h('span.kv__v', gateLabel)]),
        h('div.kv', [h('span.kv__k', 'View style'), h('span.kv__v', res.viewStyle)]),
        h('div.kv', [h('span.kv__k', 'Pagination envelope'), h('span.kv__v', res.envelope || '—')]),
        h('div.kv', [h('span.kv__k', 'Lookup key'), h('span.kv__v', res.lookup || res.idField || '—')]),
        h('div.kv', [h('span.kv__k', 'Capabilities'), h('span.kv__v.badge-row', caps.length ? caps : '—')]),
      ]),
      h('div.banner', [
        h('div', ['Full CRUD UI for this resource is implemented in ', h('strong', 'Phase 2/3'), '.']),
      ]),
    ])
  );
}
