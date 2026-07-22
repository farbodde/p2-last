// Runtime environment configuration.
//
// This file is intentionally NOT a module and is loaded before the app. In
// production the Docker/nginx entrypoint rewrites window.__ENV__ from container
// env vars (see Phase 5), so the same static build works across environments
// without a rebuild.
//
// API_BASE: origin of the Django backend API (no trailing slash).
//   - Local dev (backend via docker-compose): http://localhost:8001
//   - Local dev (manage.py runserver):        http://localhost:8000
window.__ENV__ = Object.assign(
  {
    API_BASE: 'http://localhost:8001',
    APP_NAME: 'Player2 Admin',
  },
  window.__ENV__ || {}
);
