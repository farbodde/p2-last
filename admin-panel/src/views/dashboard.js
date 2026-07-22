// Overview (Phase 1 placeholder — real dashboard is Phase 4).
import { h, mount } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { breadcrumb, badge } from '../ui/components.js';
import { resourcesByGroup } from '../resources/registry.js';
import { getUser } from '../auth/auth.js';

export function renderDashboard(outletEl) {
  const user = getUser() || {};
  const groups = resourcesByGroup();

  const cards = [];
  groups.forEach((g) => {
    g.items.forEach((res) => {
      cards.push(
        h('a.rescard', { href: `/r/${res.key}`, 'data-link': '' }, [
          h('span.rescard__icon', icon(res.icon || 'grid', { size: 20 })),
          h('div.rescard__body', [
            h('div.rescard__title', res.label),
            h('div.rescard__meta', g.label),
          ]),
          res.capabilities && res.capabilities.list === false ? badge('actions', { kind: 'info' }) : null,
        ])
      );
    });
  });

  const view = h('div.page', [
    breadcrumb([{ label: 'Overview' }]),
    h('div.page__head', [
      h('div', [
        h('h1.page__title', `Welcome, ${user.display_name || user.username || 'admin'}`),
        h('p.page__sub', 'Manage your Player2 backend. Pick a resource to begin.'),
      ]),
    ]),
    h('section.overview', [
      h('div.banner', [
        icon('alert', { size: 18 }),
        h('div', [
          h('strong', 'Phase 1 — core framework. '),
          'Auth, shell, routing, theming and the UI kit are in place. Resource CRUD lands in Phase 2.',
        ]),
      ]),
      h('div.rescard-grid', cards),
    ]),
  ]);

  mount(outletEl, view);
}
