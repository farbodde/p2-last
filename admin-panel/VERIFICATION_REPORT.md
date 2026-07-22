# VERIFICATION_REPORT.md — Player2 Admin Panel

Phase 6 verification. Every "Verified" row below was exercised by an **automated
headless browser suite** (Chromium via Playwright) driving the real app against
a mocked backend, asserting on actual behaviour (HTTP method/path/body, DOM
state, ARIA attributes, storage). Result: **24 / 24 checks passed.** The suite
lives at `scratchpad/verify.mjs` and is reproducible.

Where the real Django stack was needed (it could not boot in this sandbox — no
Postgres/Redis/Firebase/FERNET), the item is marked **Manual** with exact steps.

---

## 1. Automated results (24/24)

| ID | Check | Result |
|---|---|---|
| AUTH-1 | Invalid login shows an inline error | ✅ |
| AUTH-2 | Non-admin (role ≠ admin) is refused at login | ✅ |
| AUTH-3 | Admin login lands in the app shell | ✅ |
| AUTH-3b | Refresh token persisted; **access token never in localStorage** | ✅ |
| AUTH-4 | Visiting a protected route while logged out → `/login?next=…` | ✅ |
| AUTH-5 | A `401` triggers a single refresh + retries the original request; data loads | ✅ |
| AUTH-6 | Logout clears session and returns to `/login` | ✅ |
| CRUD-1 | Create sends `POST` with the form body | ✅ |
| CRUD-2 | User update uses `PUT` to `/admin/users/<username>/update/` | ✅ |
| CRUD-3 | Row delete confirms, then sends `DELETE` | ✅ |
| CRUD-4 | Bulk delete without a bulk endpoint = N sequential `DELETE`s | ✅ |
| CRUD-5 | Feedback bulk delete uses the bulk endpoint with `feedback_ids` | ✅ |
| FORM-1 | Backend `400` field errors map onto the right inputs | ✅ |
| FORM-2 | Client-side required validation blocks submit (no request sent) | ✅ |
| PAGE-1 | Pagination sends the `page` query param | ✅ |
| FILTER-1 | Filter dropdown sends its param (`role=admin`) | ✅ |
| SEARCH-1 | Search box sends `search=` (debounced) | ✅ |
| SORT-1 | Sortable header toggles `aria-sort` | ✅ |
| RESP-1 | Mobile (390px): hamburger visible, toggles the off-canvas sidebar | ✅ |
| A11Y-1 | Dialog is `aria-modal` and moves focus inside (focus trap) | ✅ |
| A11Y-2 | `Escape` closes the dialog | ✅ |
| A11Y-3 | Toast container is an `aria-live="polite"` region | ✅ |
| A11Y-4 | Sortable header is operable via keyboard (`Enter`) | ✅ |
| PERF-1 | App reaches DOMContentLoaded < 2s | ✅ (145 ms) |

---

## 2. Verified features (by area)

### Authentication & authorization
- JWT login against `/api/v1/auth/login/`; **admin-only** entry (login refused
  unless `role === "admin"` / superuser). ✅ AUTH-1/2/3
- **Token storage:** access token in memory only; refresh token in
  localStorage. Confirmed the access token is never persisted. ✅ AUTH-3b
- Protected routing with `next=` redirect. ✅ AUTH-4
- Transparent **single-flight refresh-on-401** + retry. ✅ AUTH-5
- Two backend permission gates handled: Group `admin` (most endpoints) and
  `is_staff` (User Reports). A `403` renders a clear "access denied" state
  rather than a crash (see list `errorPanel`, dashboard "No access").

### CRUD, forms, uploads
- Create / edit / delete verified end-to-end with correct **method, path and
  body** per resource, including the username-lookup + `PUT` quirk for Users.
  ✅ CRUD-1/2/3
- Bulk delete: sequential when no bulk endpoint exists (Users/Platforms), and
  the dedicated bulk endpoint with `feedback_ids` for Feedback. ✅ CRUD-4/5
- Backend validation errors surface on the exact field; client required-checks
  block premature submits. ✅ FORM-1/2
- **Uploads:** image fields switch the request to `multipart/form-data`
  automatically (verified by design + pilot forms). Live upload round-trip is a
  Manual step (needs the real media backend).
- **Downloads:** the API client has a blob download path (`api.download`) for
  future export actions; no admin endpoint currently returns a file, so nothing
  in-app triggers it yet.

### List experience
- Server pagination, page-size, filters and search all send the correct query
  params; client-side column sort toggles `aria-sort`. ✅ PAGE-1/FILTER-1/
  SEARCH-1/SORT-1
- Four backend pagination envelopes are normalised centrally (A/B/C/D).

### Navigation & shell
- Sidebar is generated from the resource registry, grouped by Django app; every
  registered resource is reachable and renders (all Phase 2/3 screens verified
  headless with zero console/page errors).
- Dark/light theming (system default + persisted toggle), History-API routing
  with SPA fallback, breadcrumbs, user menu.

### Responsive & accessibility
- Mobile layout collapses the sidebar to an off-canvas drawer with a hamburger
  toggle. ✅ RESP-1
- Dialogs: `aria-modal`, focus trap, `Escape` to close. Toasts: `aria-live`.
  Tables: `aria-sort` and keyboard-operable sort headers. ✅ A11Y-1/2/3/4
- Also present (by construction): focus-visible rings, logical CSS properties
  for future RTL, `prefers-reduced-motion` handling.

### Performance / footprint
- Unminified footprint: **~35 KB JS across 35 ES modules + ~26 KB CSS**;
  DOMContentLoaded **~145 ms** in headless Chromium. No runtime dependencies,
  no framework. ✅ PERF-1

---

## 3. Limitations & things to validate against a live backend

1. **Live stack not bootable here** — Postgres, Redis, a Firebase credentials
   file (loaded at startup) and `FERNET_KEY` are required and not provisioned in
   this sandbox. All backend interaction was therefore verified against a
   faithful mock; the items below need one real end-to-end pass.
2. **Games create/edit under multipart** — the write serializer mixes a required
   `cover` ImageField (multipart) with a nested `categories` list. The panel
   sends JSON when no new cover is chosen and DRF bracket-notation multipart when
   a cover file is attached. The multipart+nested path is **UNVERIFIED** live
   (documented in `views/game-form.js`).
3. **User Reports gate** — these endpoints require `is_staff`, not the `admin`
   group. If your admin account lacks `is_staff`, the panel shows a graceful
   403; confirm the account has both.
4. **Per-user LFG endpoint** — the backend route has a known
   `select_related("platforms")` bug on a singular FK and will likely `500`; the
   panel surfaces this cleanly and does not attempt to fix backend logic.
5. **Notifications test-push** — the backend currently stubs delivery (the Celery
   dispatch is commented out); the panel says so explicitly.
6. **Docker build** — no Docker daemon here, so `docker build`/`compose up` is a
   Manual step. The image contents, nginx template substitution, env.js writer
   and compose file were validated without a daemon.
7. **Sorting is client-side** (current page only) because the admin list
   endpoints expose no ordering param; this is intentional and labelled.

---

## 4. Manual test steps (against a live instance)

Prereqs: backend running (`cd backend && docker compose up`), an account that is
in Group `admin` **and** `is_staff=True`.

```bash
# Run the panel
cd admin-panel && npm run dev        # http://localhost:3005
# (or the Docker path in RUNNING.md)
```

1. **Auth:** sign in; confirm you land on the dashboard. Sign in with a
   non-admin — you should be refused. Reload the page — session should persist
   (refresh token). Wait for the 15-min access token to expire, then act — the
   panel should refresh silently.
2. **Schema discovery:** open a Platforms/Games form and confirm fields match
   the live serializer (these are OPTIONS-enriched). Run the OPTIONS curls in
   `SCHEMA_STRATEGY.md §6`.
3. **CRUD + upload:** create a Platform with a logo image; edit it; delete it.
   Create a Game with a cover, platforms and one category with items — **this
   exercises the multipart+nested path flagged in §3.2**; confirm it saves.
4. **Users:** create a user (with password + role), edit (PUT), change role,
   delete; verify search and the role filter hit the server.
5. **Bulk:** select several Feedback rows → bulk delete (single request); select
   several Users → bulk delete (sequential).
6. **Permissions:** open User Reports; if you see a 403 notice, your account
   lacks `is_staff`.
7. **Dashboard:** confirm counts match reality and the "needs attention" banner
   reflects open feedback/reports.
8. **Responsive/a11y:** shrink to mobile; tab through a form and the table;
   operate sort headers and dialogs with the keyboard only.

---

## 5. Technical notes

- **No fabricated data anywhere** — dashboard numbers derive from real list
  `count`s; failures are shown as "No access"/"Unavailable", never as 0.
- **Backend untouched** — no business logic, endpoint, serializer or permission
  was modified. The only backend change ever proposed is the optional,
  additive, read-only `/api/v1/admin/schema/` endpoint (SCHEMA_STRATEGY.md),
  which was **not** implemented pending approval.
- **Reproduce the suite:** `node scratchpad/verify.mjs` (Playwright + a small
  in-process static server + mocked API). It prints a PASS/FAIL line per check
  and a summary.
- Zero third-party runtime code ships in the panel; a strict CSP is recommended
  in production (see ARCHITECTURE.md §5) to keep the localStorage refresh-token
  tradeoff low-risk.
