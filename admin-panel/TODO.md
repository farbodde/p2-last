# TODO.md — Living checklist

_Updated every phase. `[x]` done · `[~]` in progress · `[ ]` todo · `[!]` blocked/needs decision._

## Phase 0 — Discovery
- [x] Read `core/` (urls, settings, views, middleware, schema, serializers)
- [x] Read every app (auth_app, feed_back, notification, games, filter, posts, chat): models/urls/views/serializers/admin/permissions/pagination
- [x] Determine auth scheme (JWT header-based + Session; issue/refresh endpoints)
- [x] Determine machine-readable schema availability (drf-spectacular present but **excludes /admin/**)
- [x] Empirically verify DRF OPTIONS metadata behaviour (generic vs APIView)
- [x] Map Django-admin (admin.py) exposure per model → parity matrix
- [x] Determine CORS state for localhost:3005 (dev already allowed)
- [x] Catalogue custom non-CRUD actions
- [x] Write PROJECT_ANALYSIS.md / ADMIN_API_MAP.md / SCHEMA_STRATEGY.md / IMPLEMENTATION_PLAN.md / TODO.md
- [!] **AWAITING USER**: confirm schema strategy (Hybrid vs additive endpoint)
- [!] **AWAITING USER**: parity scope (existing endpoints vs full parity)
- [!] **AWAITING USER**: RTL/Persian vs LTR-English
- [!] **AWAITING USER**: confirm test admin account is is_staff **and** Group "admin"
- [ ] (optional) run §6 manual curl checks against a live instance

## Phase 1 — Core framework  ✅ (decisions taken as recommended defaults; STOP for review)
- [x] Project skeleton (index.html, env.js, ESM entry, zero-dep dev server on 3005)
- [x] API client (verbs, multipart upload, blob download, query builder, retry/timeout, Bearer inject, single-flight refresh-on-401, envelope normaliser A/B/C/D)
- [x] Auth flow (login/logout, memory access + localStorage refresh, bootstrap, protected routes, 401 refresh, 403 view, admin-only login gate)
- [x] App shell (responsive layout, registry-driven sidebar grouped by Django app, dark/light + system, History-API router, breadcrumbs, user menu)
- [x] Base UI kit (button/input/select/textarea/checkbox/table[sort+select]/dialog[focus-trap]/toast/skeleton/spinner/pagination/badge/breadcrumb/empty)
- [x] Resource registry manifest (all resources, gates, envelopes, actions, field fallbacks)
- [x] Verified: node syntax check (21 modules), pure-module smoke test, dev server (MIME + SPA fallback), headless render — zero console/page errors, both themes
- [x] RUNNING.md + ARCHITECTURE.md
- [!] **STOP — awaiting review of running shell + auth flow before Phase 2**

Decisions applied (changeable): schema=Hybrid (no backend change) · scope=existing endpoints · lang=LTR-English (RTL-ready via logical CSS) · panel handles is_staff 403 gracefully.

## Phase 2 — Pilot resources  _(not started)_
- [ ] Platforms (simple, image, style-G)
- [ ] Users (APIView, username lookup, envelope B, role action)
- [ ] Games (M2M + nested categories/items, cover upload)
- [ ] STOP — review

## Phase 3 — Generalise  _(not started)_
- [ ] Categories, Items
- [ ] Filter Categories
- [ ] Feedback (list/delete/bulk-delete) + User Reports (list/delete)
- [ ] Notifications action panel
- [ ] Per-user LFG viewer (graceful 500 handling)

## Phase 4 — Dashboard  _(not started)_
## Phase 5 — Docker (port 3005, extends compose)  _(not started)_
## Phase 6 — Verification + VERIFICATION_REPORT.md  _(not started)_

## Docs to also produce (per brief)
- [ ] RUNNING.md
- [ ] ARCHITECTURE.md (schema-discovery + token-storage rationale)
