# ARCHITECTURE.md — Player2 Admin Panel

## 1. Goals & constraints
- Replace Django Admin with a modern, fast, accessible panel — **without**
  touching backend business logic.
- **Backend defines everything.** The frontend hardcodes only what the backend
  cannot expose at runtime, and documents every such fallback (ADMIN_API_MAP.md
  §11, SCHEMA_STRATEGY.md).
- Tech: **HTML5 + modern CSS + vanilla JS (ES2022 modules) + Fetch + History
  API**. No React/Vue/Angular, no CSS admin template.

## 2. Why no framework / no build step (for now)
Native ES modules load directly in every modern browser. For an internal admin
tool this removes an entire build/toolchain surface and keeps the code
inspectable. A bundler (esbuild) may later be added **only** as a prod minifier
(IMPLEMENTATION_PLAN.md Phase 5) — never as a UI framework. The dev server
(`serve.mjs`) is ~60 lines with zero dependencies and exists only to provide
HTTP + correct MIME + SPA fallback.

## 3. Folder structure & responsibilities
```
src/
  config.js        Runtime config (reads window.__ENV__) + constants.
  api/
    client.js      request() core: verbs, query builder, multipart upload,
                   blob download, timeout(AbortController), network retry,
                   Bearer injection, single-flight refresh-on-401, verb helpers.
    envelopes.js   normalizeList(envelope, payload) → {items,count,pageCount,…}
                   for the FOUR backend pagination shapes (A/B/C/D).
    errors.js      ApiError + parseDrfError() → {message, fieldErrors}.
  auth/
    session.js     Token/user state. Access token in MEMORY; refresh token +
                   user in localStorage. No network here.
    auth.js        login/logout/refresh/bootstrapSession; registers the refresh
                   handler with the API client.
  app/
    router.js      History-API router; ':param' patterns; link interception;
                   beforeEach guard hook.
    shell.js       Persistent app shell: registry-driven sidebar grouped by
                   Django app, topbar, theme toggle, user menu, content outlet.
    theme.js       Light/dark: system default + explicit toggle, persisted.
  ui/
    dom.js         h()/mount()/clear() hyperscript helpers.
    components.js  button, field, input, select, textarea, checkbox, badge,
                   table (sort/select), pagination, skeleton, spinner,
                   emptyState, breadcrumb. All keyboard/ARIA aware.
    dialog.js      Accessible modal (focus trap, Esc, backdrop) + confirmDialog.
    toast.js       Transient notifications.
    icons.js       Inline SVG icon set (CSP-friendly, no external assets).
  resources/
    registry.js    THE manifest: resources, groups, endpoints, lookup keys,
                   envelopes, permission gates, custom actions, field fallbacks.
  views/
    login / dashboard / resource / errors.
  styles/
    theme.css      Design tokens (spacing, radius, color) + light/dark palettes
                   + reset.
    app.css        Component styles.
```

## 4. Schema-discovery strategy (the key decision)
Full rationale + empirical evidence: **SCHEMA_STRATEGY.md**. Summary:

- The backend's OpenAPI schema (drf-spectacular) **excludes every `/admin/`
  endpoint** (`core/schema.py`), so it can't drive the panel.
- DRF `OPTIONS` returns rich field metadata only for the **generic** endpoints
  (games/\*, filter ViewSet); the **plain `APIView`** endpoints (users, reports,
  feedback, notifications) return none. (Verified empirically.)
- Pagination has **four** different envelopes; lookup keys differ (users use
  `username`, others `pk`); games use asymmetric read/write serializers.

→ **Hybrid**: a declarative **resource registry** encodes what the backend
can't tell us (endpoints, envelopes, lookup keys, gates, actions, and a
fallback field list). At runtime, **style-G** resources are **enriched via an
authenticated `OPTIONS`** overlaid on the registry defaults (Phase 2), so their
forms stay backend-driven; **style-A** resources use the registry field list
(the documented fallback). An optional additive read-only `/api/v1/admin/schema/`
endpoint is offered for a fully backend-driven variant, **pending approval** —
not implemented.

## 5. Auth & token storage (the second key decision)
The backend issues JWTs **in the response body only** and never sets an
`httpOnly` auth cookie (PROJECT_ANALYSIS.md §3.1). An httpOnly-cookie design —
normally the most XSS-resistant option — is therefore **not available without a
backend change**, which is out of scope.

Given that constraint, the chosen scheme minimises blast radius:
- **Access token → memory only** (a module variable). Never persisted, so it
  can't be read from storage by injected script and disappears when the tab
  closes.
- **Refresh token → localStorage**, so sessions survive reloads. This is the
  documented tradeoff: a refresh token in web storage is reachable by XSS, but
  the app ships **no third-party runtime scripts** and a strict CSP is
  recommended for production to shrink that risk. `sessionStorage` (tighter, but
  lost on tab close) is a one-line change if you prefer stricter over
  persistent.
- **Refresh flow:** any `401` triggers a **single-flight** refresh
  (concurrent 401s share one refresh call) then retries the original request
  once; a failed refresh clears the session and routes to `/login`.
- **Admin gating in the UI:** login is refused unless the returned `role` is
  `admin` (or `is_superuser`). The two backend gates (Group `admin` vs
  `is_staff`) are surfaced as graceful `403` handling per resource.

**If you later want the more secure design**, I can add an additive backend auth
layer that sets httpOnly cookies and a CSRF token — but that is a backend change
requiring your approval, so it is not done here.

## 6. Error handling
All failures normalise to `ApiError { status, message, fieldErrors, isNetwork,
isTimeout }`. Forms map `fieldErrors` to inputs; everything else raises a toast.
`401` is handled transparently by refresh; `403` renders a permission view.

## 7. Accessibility & theming
- Keyboard-navigable controls, focus-visible rings, ARIA on dialogs (modal +
  focus trap), tables (`aria-sort`), toasts (`aria-live`), and menus.
- Light/dark via CSS custom properties; respects `prefers-color-scheme` until
  the user makes an explicit choice (persisted). `prefers-reduced-motion` honored.
- Logical CSS properties (`inset-inline`, `margin-inline`, `text-align:start`)
  are used throughout so **RTL/Persian can be enabled later** by setting
  `dir="rtl"` — pending your language decision (SCHEMA_STRATEGY.md §7).

## 8. What Phase 1 delivered
API client · auth flow (login/logout/refresh/guards) · app shell (dynamic
grouped sidebar, dark/light, History-API routing, breadcrumbs) · full base UI
kit · resource registry. Verified: all modules load with zero console/page
errors; login + authenticated shell render in both themes; routing + SPA
fallback work. CRUD arrives in Phase 2.
