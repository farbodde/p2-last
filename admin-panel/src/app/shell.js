// App shell: sidebar (registry-driven, grouped by Django app), top bar,
// theme toggle, user menu, and a content outlet. Rendered once for
// authenticated routes; views paint into the outlet.
import { h, mount, clear } from '../ui/dom.js';
import { icon } from '../ui/icons.js';
import { button } from '../ui/components.js';
import { resourcesByGroup } from '../resources/registry.js';
import { getUser, logout } from '../auth/auth.js';
import { getTheme, toggleTheme } from './theme.js';
import { APP_NAME } from '../config.js';

let shellEl = null;
let outletEl = null;
let sidebarEl = null;

export function ensureShell(appEl, router) {
  if (shellEl && shellEl.isConnected) return outletEl;

  outletEl = h('main.outlet', { id: 'outlet', tabindex: '-1' });
  sidebarEl = h('nav.sidebar', { 'aria-label': 'Primary' });
  const backdrop = h('div.sidebar-backdrop', { onclick: () => toggleSidebar(false) });

  buildSidebar(router);

  const topbar = h('header.topbar', [
    h('button.iconbtn.topbar__menu', { type: 'button', 'aria-label': 'Toggle menu', onclick: () => toggleSidebar() }, icon('menu')),
    h('div.topbar__spacer'),
    themeToggle(),
    userMenu(router),
  ]);

  shellEl = h('div.shell', [
    h('aside.shell__aside', [brand(router), sidebarEl]),
    backdrop,
    h('div.shell__main', [topbar, outletEl]),
  ]);

  mount(appEl, shellEl);
  appEl.setAttribute('aria-busy', 'false');
  return outletEl;
}

export function outlet() {
  return outletEl;
}

export function setActiveNav(path) {
  if (!sidebarEl) return;
  sidebarEl.querySelectorAll('a[data-link]').forEach((a) => {
    a.classList.toggle('is-active', a.getAttribute('href') === path);
  });
}

function brand(router) {
  return h('a.brand', { href: '/', 'data-link': '' }, [h('span.brand__logo', '🎮'), h('span.brand__name', APP_NAME)]);
}

function buildSidebar(router) {
  clear(sidebarEl);
  // Overview link
  sidebarEl.appendChild(
    h('a.navlink', { href: '/', 'data-link': '' }, [h('span.navlink__icon', icon('home', { size: 18 })), h('span', 'Overview')])
  );

  resourcesByGroup().forEach((group) => {
    sidebarEl.appendChild(h('div.nav-group__label', group.label));
    group.items.forEach((res) => {
      const href = `/r/${res.key}`;
      sidebarEl.appendChild(
        h('a.navlink', { href, 'data-link': '' }, [
          h('span.navlink__icon', icon(res.icon || group.icon || 'grid', { size: 18 })),
          h('span', res.label),
        ])
      );
    });
  });
}

function themeToggle() {
  const btn = h('button.iconbtn', { type: 'button', 'aria-label': 'Toggle theme', title: 'Toggle theme' });
  const paint = () => {
    clear(btn).appendChild(icon(getTheme() === 'dark' ? 'sun' : 'moon'));
  };
  btn.addEventListener('click', () => {
    toggleTheme();
    paint();
  });
  paint();
  return btn;
}

function userMenu(router) {
  const user = getUser() || {};
  const label = user.display_name || user.username || user.email || 'Admin';
  const initial = (label[0] || 'A').toUpperCase();

  const menu = h('div.usermenu__pop', { hidden: true, role: 'menu' }, [
    h('div.usermenu__head', [h('div.usermenu__name', label), h('div.usermenu__email', user.email || '')]),
    h('button.usermenu__item', { type: 'button', role: 'menuitem', onclick: () => doLogout(router) }, [icon('logout', { size: 16 }), h('span', 'Sign out')]),
  ]);

  const trigger = h('button.usermenu__trigger', { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, [
    h('span.avatar', initial),
    h('span.usermenu__label', label),
  ]);

  const wrap = h('div.usermenu', [trigger, menu]);

  function setOpen(open) {
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  }
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(menu.hidden);
  });
  document.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));

  return wrap;
}

function doLogout(router) {
  logout();
  // Force a full shell teardown on next auth route.
  shellEl = null;
  router.navigate('/login');
}

function toggleSidebar(force) {
  const open = force === undefined ? !shellEl.classList.contains('shell--nav-open') : force;
  shellEl.classList.toggle('shell--nav-open', open);
}
