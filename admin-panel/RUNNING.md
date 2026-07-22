# RUNNING.md — Player2 Admin Panel

A standalone admin panel for the Player2 Django backend. **Vanilla JS (ES
modules), no framework, no build step required for development.**

## Prerequisites
- **Node.js ≥ 18** (used only for the tiny zero-dependency dev server; the app
  itself is plain ES modules served as static files).
- A running Player2 backend reachable over HTTP (see "Connecting to the backend").

## Project structure
```
admin-panel/
├── index.html            # app entry (loads env.js, styles, main.js)
├── env.js                # runtime config (API_BASE) — overridable at deploy time
├── serve.mjs             # zero-dependency static dev server (SPA fallback)
├── package.json          # dev/start scripts (node serve.mjs 3005)
├── src/
│   ├── main.js           # bootstrap: session → router → shell → views
│   ├── config.js         # typed config + constants
│   ├── api/              # client.js, envelopes.js, errors.js
│   ├── auth/             # auth.js, session.js
│   ├── app/              # router.js, shell.js, theme.js
│   ├── ui/               # dom.js, components.js, dialog.js, toast.js, icons.js
│   ├── resources/        # registry.js  ← the resource manifest
│   ├── views/            # login, dashboard, resource, errors
│   └── styles/           # theme.css (tokens), app.css (components)
└── docs: PROJECT_ANALYSIS / ADMIN_API_MAP / SCHEMA_STRATEGY /
        IMPLEMENTATION_PLAN / ARCHITECTURE / TODO / VERIFICATION_REPORT (later)
```

## Environment variables / config
Config is runtime, not baked into a build. `env.js` sets `window.__ENV__`:

| Key | Meaning | Dev default |
|---|---|---|
| `API_BASE` | Backend origin (no trailing slash) | `http://localhost:8001` |
| `APP_NAME` | Panel title | `Player2 Admin` |

- **Local dev, backend via docker-compose:** `http://localhost:8001`
  (compose maps host `8001` → container `8000`).
- **Local dev, backend via `manage.py runserver`:** set `API_BASE` to
  `http://localhost:8000` (edit `env.js`).
- In **production** the Docker/nginx entrypoint rewrites `env.js` from the
  container's env vars, so one static build works everywhere (Phase 5).

## Development
```bash
cd admin-panel
npm run dev            # → http://localhost:3005   (node serve.mjs 3005)
# or:  node serve.mjs 3005
```
Open http://localhost:3005. The dev server serves ES modules with correct MIME
types and falls back to `index.html` for client-side routes (e.g. `/r/users`).

There is **no bundler/transpile step**: the browser loads `src/**` modules
directly. Edit a file, refresh. (A production bundler may be added later purely
as a minifier — see IMPLEMENTATION_PLAN.md — but is not needed to run.)

## Connecting to the backend
1. Start the backend (from `backend/`): `docker compose up` (exposes the API on
   host port **8001**).
2. **CORS:** in dev the backend already allows all origins
   (`CORS_ALLOW_ALL_ORIGINS = True`), so `http://localhost:3005` works with no
   change. (For production, add the panel origin to `CORS_ALLOWED_ORIGINS` and
   turn all-origins off — see PROJECT_ANALYSIS.md §4.)
3. **Admin account:** sign in with a user that is a member of the Django Group
   **`admin`** (and, for the User-Reports screens, also `is_staff=True` — see
   PROJECT_ANALYSIS.md §3.2). Non-admins are refused at login.
4. Auth uses **JWT Bearer** tokens obtained from `/api/v1/auth/login/`; the
   panel stores the access token in memory and the refresh token in the
   browser's localStorage (rationale in ARCHITECTURE.md), and auto-refreshes on
   401.

## Production build & Docker
The panel is static, so the production image is just **nginx serving the app on
port 3005**. nginx also **reverse-proxies `/api`, `/media` and `/static` to the
backend by its Docker service name**, so in the compose setup there is **no CORS
to configure** and the browser only ever talks to the panel's own origin.
`env.js` is regenerated at container start from `$API_BASE`, so one image works
everywhere without a rebuild.

Files: `Dockerfile`, `.dockerignore`, `docker-compose.yml`,
`docker/default.conf.template` (nginx), `docker/40-write-env.sh` (env writer).

### Run with the backend (recommended)
`admin-panel/docker-compose.yml` **extends** the existing backend stack via
`include:` (Docker Compose **v2.20+**) — the backend compose is pulled in
unmodified, so the panel joins the same network and reaches the backend at
`web:8000`.
```bash
cd admin-panel
docker compose up -d --build
#  panel   → http://localhost:3005
#  backend → http://localhost:8001   (unchanged)
```
The backend still needs its `backend/.env` (as before). `API_BASE` is left empty
so the browser calls same-origin and nginx proxies to `web`.

### Build / run the panel image alone
```bash
cd admin-panel
docker build -t player2-admin-panel .
# Point the browser straight at a reachable API origin (no nginx proxy):
docker run --rm -p 3005:3005 -e API_BASE=http://localhost:8001 player2-admin-panel
```

### Environment variables (container)
| Var | Purpose | Default |
|---|---|---|
| `API_BASE` | Browser API origin. **Empty = same-origin** (nginx proxies to the backend). Set to a full URL to call the API directly. | `""` |
| `APP_NAME` | Panel title | `Player2 Admin` |
| `BACKEND_HOST` / `BACKEND_PORT` | Backend Docker service name/port that nginx proxies to | `web` / `8000` |

### Older Docker Compose (no `include`)
If your Compose predates v2.20, don't use the `include:` file. Instead run the
backend stack as usual, then start the panel attached to the backend's network:
```bash
docker build -t player2-admin-panel admin-panel
docker run --rm -p 3005:3005 \
  --network player2-backend_default \
  -e BACKEND_HOST=web -e BACKEND_PORT=8000 -e API_BASE= \
  player2-admin-panel
```
(Replace `player2-backend_default` with the backend project's actual network —
see `docker network ls`.)

## Troubleshooting
| Symptom | Likely cause / fix |
|---|---|
| Blank page, console shows module 404 | Serve via `node serve.mjs` (not `file://`); modules need HTTP + correct MIME. |
| Login says "does not have admin access" | The account isn't in Group `admin`. Add it, or use an admin account. |
| 403 only on **User Reports** | Those endpoints gate on `is_staff`, not the `admin` group. Set `is_staff=True`. |
| CORS error in console | Backend `API_BASE` wrong, or (prod) origin not in `CORS_ALLOWED_ORIGINS`. |
| Network error / timeouts | Backend not running or `API_BASE` points to the wrong host/port. |
| Session lost on refresh | Expected if only the in-memory access token existed; a valid refresh token in localStorage restores it. |

## Verification / preview
Running `node serve.mjs` and opening the app renders the login screen; after an
admin login you land on the Overview with a sidebar grouped by Django app,
light/dark theming, and keyboard-navigable UI. (Phase-1 preview screenshots were
generated headlessly and are git-ignored under `design-preview-*.png`.)
