// App entrypoint: bootstrap session, wire the router + shell, mount views.
import { Router } from './app/router.js';
import { ensureShell, outlet, setActiveNav } from './app/shell.js';
import { bootstrapSession, isAuthenticated, isAdmin } from './auth/auth.js';
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderResource } from './views/resource.js';
import { renderForbidden, renderNotFound } from './views/errors.js';

const appEl = document.getElementById('app');
const router = new Router();

// Auth guard.
router.beforeEach = (ctx) => {
  const authed = isAuthenticated();
  if (ctx.path === '/login') {
    if (authed) return '/'; // already signed in
    return null;
  }
  if (!authed) {
    const next = encodeURIComponent(ctx.path + location.search);
    return `/login?next=${next}`;
  }
  return null;
};

// Routes
router
  .add('/login', () => renderLogin(appEl, { router }))
  .add('/', () => {
    const out = ensureShell(appEl, router);
    setActiveNav('/');
    renderDashboard(out, { router });
  })
  .add('/r/:resource', (ctx) => {
    const out = ensureShell(appEl, router);
    setActiveNav('/r/' + ctx.params.resource);
    renderResource(out, ctx.params.resource, { router });
  })
  .add('/forbidden', () => {
    const out = ensureShell(appEl, router);
    renderForbidden(out, { router });
  })
  .setNotFound(() => {
    if (isAuthenticated()) {
      const out = ensureShell(appEl, router);
      renderNotFound(out, { router });
    } else {
      router.navigate('/login', { replace: true });
    }
  });

// Boot
(async function boot() {
  try {
    // If we hold a refresh token, exchange it for an access token before routing.
    if (isAuthenticated()) {
      await bootstrapSession();
    }
  } catch (e) {
    // ignore — guard will send to /login if needed
  } finally {
    router.start();
  }
})();
