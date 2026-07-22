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

## Phase 1 — Core framework  _(not started — gated on Phase 0 sign-off)_
- [ ] Project skeleton (index.html, ESM entry, dev server on 3005)
- [ ] API client (verbs, upload/download, query builder, retry/timeout, auth inject, refresh-on-401, envelope normaliser)
- [ ] Auth flow (login/logout, token storage, protected routes, 401/403)
- [ ] App shell (layout, registry-driven grouped sidebar, dark/light, router, breadcrumbs)
- [ ] Base UI kit (button/input/select/table/dialog/toast/skeleton/pagination/badge/breadcrumb/empty)
- [ ] Resource registry manifest
- [ ] STOP — demo shell + auth

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
