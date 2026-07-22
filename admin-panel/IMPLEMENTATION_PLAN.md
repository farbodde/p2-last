# IMPLEMENTATION_PLAN.md — Phased build plan

Stack (per brief): **HTML5 + modern CSS (variables/Grid/Flexbox) + vanilla JS
(ES2022+, ES Modules) + Fetch + History API**. No framework.
**Build step:** start with **native ESM served directly** (no bundler). Revisit
only if a concrete need appears (e.g. many modules → HTTP overhead in prod); if
so, add **esbuild** purely as a bundler/minifier for the prod image — never as a
UI framework. Rationale recorded in ARCHITECTURE.md when decided.

Runs on **port 3005**. Talks to the backend API base via an env-injected
`API_BASE` (dev default `http://localhost:8001`).

---

## Phase 0 — Discovery ✅ (this deliverable)
PROJECT_ANALYSIS.md · ADMIN_API_MAP.md · SCHEMA_STRATEGY.md ·
IMPLEMENTATION_PLAN.md · TODO.md. **STOP → await your confirmation of the
schema strategy + the 4 open decisions (SCHEMA_STRATEGY.md §7).**

## Phase 1 — Core framework only  → then STOP for review
- **API client** (`api/client.js`): GET/POST/PUT/PATCH/DELETE, multipart
  upload, blob download, query builder (page/page_size/search/filters/ordering),
  timeout + abort, limited retry on network errors, **Bearer injection**,
  **automatic access-token refresh** on 401 (single-flight), centralised error
  normalisation, and **per-resource pagination-envelope normaliser** (A/B/C/D).
- **Auth** (`auth/`): login screen, logout, token storage (see ARCHITECTURE.md —
  access in memory, refresh in web storage; tradeoff documented because the
  backend offers no httpOnly-cookie flow), protected routes, 401→refresh→retry,
  403→"insufficient permission" screen. Gate UI on `role === "admin"`.
- **App shell** (`app/`): responsive layout, top bar, **sidebar generated from
  the resource registry, grouped by Django app**, **dark/light mode** (CSS vars
  + `prefers-color-scheme` + persisted toggle), **History-API router**,
  breadcrumbs.
- **Base UI kit** (`ui/`): button, input, select, textarea, file input, table,
  dialog/modal, toast, skeleton loader, pagination, badge, breadcrumb, empty
  state — all keyboard-accessible + ARIA.
- **Resource registry** (`resources/registry.js`): the manifest from
  SCHEMA_STRATEGY.md §2.
**Deliverable:** running shell + working login against the live API. **STOP.**

## Phase 2 — Pilot resources (3 representative)  → then STOP for review
Chosen to cover every hard case:
1. **Platforms** (games) — *simple*, style-G, image upload, envelope A, OPTIONS
   enrichment.
2. **Users** (auth_app) — *the APIView/username-lookup/custom-envelope-B case*,
   role action, registry-driven fields, image fields.
3. **Games** (games) — *FK/M2M + nested* — platform M2M + repeatable category
   rows with item multi-select + cover upload; asymmetric read/write serializers.
Each: list + detail + create + edit + delete, search/filter/sort/paginate,
client validation mirroring the backend, and **bulk delete** where the backend
supports it (Feedback bulk-delete is exercised in Phase 3). **STOP.**

## Phase 3 — Generalise (small batches, report in TODO.md after each)
- Batch 3a: **Categories, Items** (games, style-G).
- Batch 3b: **Filter Categories** (filter ViewSet, envelope D).
- Batch 3c: **Feedback** (list/delete/**bulk-delete**), **User Reports**
  (list/delete, is_staff gate + graceful 403).
- Batch 3d: **Notifications action panel** (register/unregister device, test
  push) — dedicated action UI, not CRUD.
- Batch 3e: **Per-user LFG viewer** (read-only; handle the known 500 gracefully).
Custom business actions (role change, bulk delete, test push, bump if in scope)
get **dedicated UI**, not generic CRUD.

## Phase 4 — Dashboard
Counts + recent items + pending (reports, feedback) + system status. Only from
data the backend actually returns (list `count`s, `/filter/config/`). Lightweight
inline **SVG** charts only if real numbers back them — otherwise stat cards.

## Phase 5 — Docker
`admin-panel/Dockerfile` (build static assets → serve via nginx on **3005**),
`.dockerignore`, and a compose entry that **extends** the existing
`backend/docker-compose.yml` (own file or documented override) using the Docker
**service name** for the API base, env var for `API_BASE`. Must not alter or
break existing services.

## Phase 6 — Verification
Exercise auth, permissions (both gates), CRUD, forms, uploads, downloads,
pagination (all 4 envelopes), filters, search, sort, sidebar, nav, responsive,
a11y (keyboard + ARIA), performance. Produce **VERIFICATION_REPORT.md**.

---

## Cross-cutting rules
- **Backend is frozen** — no edits to `backend/` business logic; the only
  possible backend change is the approved additive read-only schema endpoint.
- **`frontend/` is off-limits** — read for API understanding only; never modify.
- Atomic, descriptive commits per logical unit. No force-push.
- Update PROJECT_ANALYSIS / ADMIN_API_MAP / TODO continuously.
- Every hardcoded field-list fallback stays catalogued in ADMIN_API_MAP.md §11.
