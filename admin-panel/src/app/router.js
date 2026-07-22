// History-API router. Pattern segments support ':param'. Link interception via
// clicks on [data-link] or router.navigate().
export class Router {
  constructor() {
    this.routes = [];
    this.notFound = null;
    this.beforeEach = null;
    this._onPop = () => this.resolve();
  }

  add(pattern, handler, meta = {}) {
    const { regex, keys } = compileFull(pattern);
    this.routes.push({ pattern, handler, meta, keys, regex });
    return this;
  }

  setNotFound(handler) {
    this.notFound = handler;
    return this;
  }

  start() {
    window.addEventListener('popstate', this._onPop);
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[data-link]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || a.target === '_blank') return;
      e.preventDefault();
      this.navigate(href);
    });
    this.resolve();
  }

  navigate(path, { replace = false } = {}) {
    if (location.pathname + location.search === path) return this.resolve();
    if (replace) history.replaceState({}, '', path);
    else history.pushState({}, '', path);
    this.resolve();
  }

  get path() {
    return location.pathname || '/';
  }

  async resolve() {
    const path = this.path;
    let matched = null;
    let params = {};
    for (const route of this.routes) {
      const m = route.regex.exec(path);
      if (m) {
        matched = route;
        route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        break;
      }
    }

    const ctx = { path, params, query: new URLSearchParams(location.search), route: matched, router: this };

    if (this.beforeEach) {
      const redirect = await this.beforeEach(ctx);
      if (redirect) return this.navigate(redirect, { replace: true });
    }

    if (matched) return matched.handler(ctx);
    if (this.notFound) return this.notFound(ctx);
  }
}

function compileFull(pattern) {
  const keys = [];
  const rx = pattern
    .replace(/\/+$/, '')
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:([A-Za-z0-9_]+)/g, (_, k) => {
      keys.push(k);
      return '([^/]+)';
    });
  return { regex: new RegExp('^' + (rx || '/') + '/?$'), keys };
}
