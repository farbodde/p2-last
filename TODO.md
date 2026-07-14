# TODO.md — P2 Player Admin Panel

Living checklist. Panel root:
`panel/nuxt-version/typescript-version/full-version`.

## M0 — Discovery & documentation
- [x] Inspect backend (urls, models, serializers, views, permissions, pagination)
- [x] Map full admin surface (auth_app, games, filter, feed_back, notification, posts)
- [x] PROJECT_ANALYSIS.md
- [x] ADMIN_API_MAP.md
- [x] IMPLEMENTATION_PLAN.md
- [x] TODO.md

## M1 — Foundation
- [x] `constants/adminEndpoints.ts`
- [x] `constants/adminOptions.ts` (roles, genders, feedback types, device types, abilities)
- [x] `types/admin/*.ts` (common, user, games, misc)
- [x] `utils/adminApi.ts` (normalizePaginated, buildFormData, parseApiError, mediaUrl, cleanParams, hasFile)
- [x] `services/admin/*.ts` (users, reports, games catalog, filters, feedback, notifications, lfg, meta)

## M2 — Authentication
- [x] `composables/useAdminAuth.ts` (login/logout/refresh + cookies + abilities)
- [x] Wire `pages/login.vue`
- [x] Token refresh on 401 (`utils/api.ts` $api interceptor)
- [x] Cookie-based `middleware/acl.global.ts`
- [x] Cookie-based `/` redirect (`app/router.options.ts`)
- [x] UserProfile logout via useAdminAuth

## M3 — Navigation & Dashboard
- [x] `navigation/vertical/admin.ts` (+ horizontal mirror, vertical index → admin only)
- [x] `pages/admin/dashboard.vue` (stat cards + latest users/feedback/reports)

## M4 — Users
- [x] List + search + role filter + pagination + bulk delete + status/online/staff badges
- [x] Create (`/admin/users/new`)
- [x] Edit (`/admin/users/[username]/edit`)
- [x] Detail (`/admin/users/[username]`) + LFG-by-user (graceful backend-bug handling)
- [x] Inline role change (list + detail)

## M5 — Games catalog
- [x] Platforms (CRUD + logo upload)
- [x] Categories (CRUD + limit/unlimited)
- [x] Items (CRUD + icon upload + category filter)
- [x] Games (CRUD + nested platforms/categories/items form)

## M6 — Filters / Feedback / Notifications / Reports
- [x] Filter categories CRUD (+ quick active toggle)
- [x] Feedback moderation (type filter, screenshots, single + bulk delete)
- [x] Notifications composer (test push + device register/unregister)
- [x] Reports list + image previews + delete

## M7 — Polish
- [x] Global snackbar (AdminSnackbar) + reusable confirm dialog
- [x] Loading states (progress/loaders) + empty states (no-data slots)
- [x] Permission-aware nav (CASL AdminPanel subject)
- [ ] Full responsive QA pass (needs a running build — see notes)
- [ ] i18n label extraction (optional; labels currently inline English)
- [ ] Wire remaining nested game-mode management (backend has GameMode list only;
      no admin write endpoint exists, so not applicable)

## Notes / blockers
- No `package.json` vendored → cannot `pnpm install` / build / run / typecheck in
  this env. Code follows the template's established conventions and is typed
  against the real API. Verification steps are in IMPLEMENTATION_PLAN.md.
- Backend bug: `posts.UserLFGListAPIView` `select_related("platforms")` (should be
  `platform`) raises FieldError — handled gracefully in UI; backend left unchanged.
- Admin needs BOTH group `admin` (IsAdmin) AND `is_staff` (reports use IsAdminUser).
  Login gate accepts either; the dashboard degrades gracefully if reports 403.
- GameMode has only a public list endpoint (no admin CRUD) → no dedicated page.
- Notification list/mark-read endpoints are user-scoped (AllowAny) → not admin.
