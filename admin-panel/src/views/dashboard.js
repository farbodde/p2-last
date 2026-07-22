// Overview dashboard (Phase 4). All numbers derive from real list `count`s —
// the backend has no stats endpoint, so nothing here is fabricated.
import { h, mount, clear } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { breadcrumb, badge, skeleton, spinner } from '../ui/components.js';
import { fmtDate } from '../ui/format.js';
import { barChart } from '../ui/chart.js';
import { getUser } from '../auth/auth.js';
import { loadCounts, loadRecent } from '../data/dashboard.js';
import { API_BASE } from '../config.js';

export function renderDashboard(outletEl, { router } = {}) {
  const user = getUser() || {};
  const root = h('div.page');
  mount(outletEl, root);

  const statsRow = h('div.stat-grid');
  const attentionEl = h('div.attention');
  const chartCard = h('div.card.dash-card', [h('h3.dash-card__title', 'Records by resource'), h('div.dash-chart', skeleton({ height: '260px' }))]);
  const recentEl = h('div.dash-recent');
  const statusEl = h('div.card.dash-card.dash-status');

  root.append(
    breadcrumb([{ label: 'Overview' }]),
    h('div.page__head', [h('div', [h('h1.page__title', `Welcome, ${user.display_name || user.username || 'admin'}`), h('p.page__sub', 'A live snapshot of your Player2 backend.')])]),
    statsRow,
    attentionEl,
    h('div.dash-2col', [chartCard, statusEl]),
    recentEl
  );

  // Loading placeholders
  for (let i = 0; i < 6; i++) statsRow.appendChild(h('div.stat-card', [skeleton({ width: '44px', height: '44px', radius: '10px' }), h('div', [skeleton({ width: '60px', height: '22px' }), h('div', { style: { height: '6px' } }), skeleton({ width: '90px', height: '12px' })])]));

  renderStatus(statusEl, { reachable: null });

  load();

  async function load() {
    const counts = await loadCounts();

    // Stat cards
    clear(statsRow);
    counts.forEach((c) => {
      statsRow.appendChild(
        h('a.stat-card', { href: `/r/${c.key}`, 'data-link': '' }, [
          h('span.stat-card__icon', icon(c.icon || 'grid', { size: 20 })),
          h('div.stat-card__body', [
            c.ok ? h('div.stat-card__num', (c.count ?? 0).toLocaleString()) : h('div.stat-card__num.stat-card__num--muted', c.status === 403 ? '—' : '!'),
            h('div.stat-card__label', c.label),
            !c.ok ? h('div.stat-card__err', c.status === 403 ? 'No access' : 'Unavailable') : null,
          ]),
        ])
      );
    });

    // Needs attention (feedback + reports)
    clear(attentionEl);
    const attn = counts.filter((c) => (c.key === 'feedback' || c.key === 'reports') && c.ok && (c.count || 0) > 0);
    if (attn.length) {
      attentionEl.appendChild(
        h('div.banner.banner--warn', [
          icon('alert', { size: 18 }),
          h('div', [
            'Needs attention: ',
            ...attn.map((c, i) => [i ? ', ' : '', h('a.attn-link', { href: `/r/${c.key}`, 'data-link': '' }, `${c.count} ${c.label.toLowerCase()}`)]).flat(),
            '.',
          ]),
        ])
      );
    }

    // Chart (real counts)
    const chartData = counts.filter((c) => c.ok).map((c) => ({ label: c.label, value: c.count || 0 }));
    clear(chartCard);
    chartCard.append(h('h3.dash-card__title', 'Records by resource'), h('div.dash-chart', chartData.length ? barChart(chartData) : h('p.muted', 'No data available.')));

    // System status
    const reachable = counts.some((c) => c.ok);
    renderStatus(statusEl, { reachable });

    // Recent activity
    loadRecentSection();
  }

  async function loadRecentSection() {
    clear(recentEl);
    recentEl.appendChild(h('div.dash-recent__loading', [spinner({ size: 16 }), h('span', 'Loading recent activity…')]));
    const [users, feedback, reports] = await Promise.all([loadRecent('users', 5), loadRecent('feedback', 5), loadRecent('reports', 5)]);
    clear(recentEl);
    recentEl.appendChild(
      h('div.dash-recent__grid', [
        recentCard('Recent users', 'users', users, (u) => ({ primary: u.display_name || u.username || u.email, secondary: u.email, meta: u.role ? badge(u.role, { kind: 'info' }) : null })),
        recentCard('Recent feedback', 'feedback', feedback, (f) => ({ primary: f.description, secondary: f.email, meta: f.type ? badge(f.type, { kind: 'info' }) : null })),
        recentCard('Recent reports', 'reports', reports, (r) => ({ primary: r.message, secondary: `${r.reporter_username} → ${r.reported_user_username}`, meta: r.created_at ? h('span.muted', fmtDate(r.created_at, { withTime: false })) : null })),
      ])
    );
  }

  function recentCard(title, key, result, mapper) {
    let body;
    if (!result.ok) {
      body = h('div.dash-recent__empty', result.status === 403 ? 'No access (requires is_staff).' : 'Unavailable.');
    } else if (!result.items.length) {
      body = h('div.dash-recent__empty', 'Nothing yet.');
    } else {
      body = h(
        'ul.recent-list',
        result.items.map((it) => {
          const m = mapper(it);
          return h('li.recent-item', [
            h('div.recent-item__main', [h('div.recent-item__primary', truncate(m.primary, 54)), m.secondary ? h('div.recent-item__secondary', truncate(m.secondary, 40)) : null]),
            m.meta ? h('div.recent-item__meta', m.meta) : null,
          ]);
        })
      );
    }
    return h('div.card.dash-card', [h('div.dash-card__head', [h('h3.dash-card__title', title), h('a.dash-card__link', { href: `/r/${key}`, 'data-link': '' }, 'View all')]), body]);
  }
}

function renderStatus(el, { reachable }) {
  clear(el);
  const dot = reachable === null ? 'status-dot--wait' : reachable ? 'status-dot--ok' : 'status-dot--bad';
  const text = reachable === null ? 'Checking…' : reachable ? 'Connected' : 'Unreachable';
  el.append(
    h('h3.dash-card__title', 'System status'),
    h('div.status-row', [h('span.status-dot', { class: dot }), h('span', text)]),
    h('div.status-kv', [h('span.status-kv__k', 'API base'), h('span.status-kv__v', API_BASE)]),
    h('div.status-kv', [h('span.status-kv__k', 'Signed in as'), h('span.status-kv__v', (getUser() || {}).email || '—')]),
    h('div.status-kv', [h('span.status-kv__k', 'Role'), h('span.status-kv__v', (getUser() || {}).role || '—')])
  );
}

function truncate(s, n) {
  s = String(s ?? '');
  return s.length > n ? s.slice(0, n) + '…' : s;
}
