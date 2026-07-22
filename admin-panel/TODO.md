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

## Phase 2 — Pilot resources  ✅ (STOP for review)
- [x] Generic engine: data layer (api.js), OPTIONS metadata resolver (metadata.js), relation loader (relations.js)
- [x] Generic LIST view: table, search (where backend supports), filters, client-side sort, server pagination, row select + bulk delete, New button, row Edit/Delete
- [x] Generic FORM view: fields from metadata; string/email/text/choice/boolean/date/integer/list/json/image/pk-relation/m2m controls; validation-error mapping; multipart on file fields
- [x] Platforms (simple, image upload, style-G) — **OPTIONS enrichment verified** (form built ["Title *","Logo"] from live OPTIONS)
- [x] Users (APIView, username lookup, envelope B, PUT update, role + choices, image fields, search + role filter)
- [x] Games (M2M platforms + nested categories/items repeater + cover upload) — composite form verified end-to-end
- [x] Routes wired: /r/:resource (list), /r/:resource/new, /r/:resource/:id (edit)
- [x] Fixed real bug: index.html used relative asset paths → 404 on nested-route refresh/prod; added `<base href="/">` + root-relative paths
- [x] Verified headless (mocked API): users list/form, platforms list/form, game composite form — **zero console/page errors**
- [!] **STOP — awaiting review of the 3 pilots before generalising in Phase 3**

Phase 2 caveat to validate live: the Games write endpoint mixes an ImageField
(cover, multipart) with a nested `categories` list (natural as JSON). The panel
sends JSON when no new cover is chosen, and DRF bracket-notation multipart when a
cover file is attached. The multipart+nested path is UNVERIFIED against a live
backend (documented in views/game-form.js) — confirm during Phase 6.

## Phase 3 — Generalise  ✅ (all batches; verified headless, zero console/page errors)
- [x] Batch 3a — Categories, Items (generic engine; Items edit resolves category select from the read label via prefillLabelFrom)
- [x] Batch 3b — Filter Categories (ModelViewSet, envelope NONE / plain array)
- [x] Batch 3c — Feedback (list + delete + bulk-delete) & User Reports (list + delete, is_staff gate) + read-only record inspector dialog (screenshots / image_urls)
- [x] Batch 3d — Notifications action panel (test push, register/unregister device) as dedicated action UI, with honest note that push delivery is stubbed in the backend
- [x] Batch 3e — Per-user LFG lookup view (read-only; graceful handling of the known backend 500)
- [x] New view types: actions.js, lookup.js; detail-dialog.js; wired into router
- [x] Every registry resource now reachable and functional from the sidebar

## Phase 4 — Dashboard  _(not started)_
## Phase 5 — Docker (port 3005, extends compose)  _(not started)_
## Phase 6 — Verification + VERIFICATION_REPORT.md  _(not started)_

## Docs to also produce (per brief)
- [ ] RUNNING.md
- [ ] ARCHITECTURE.md (schema-discovery + token-storage rationale)
