# TODO.md — P2 Player Admin Panel

Living checklist. Update continuously. Panel root:
`panel/nuxt-version/typescript-version/full-version`.

## M0 — Discovery & documentation
- [x] Inspect backend (urls, models, serializers, views, permissions, pagination)
- [x] Map full admin surface (auth_app, games, filter, feed_back, notification, posts)
- [x] PROJECT_ANALYSIS.md
- [x] ADMIN_API_MAP.md
- [x] IMPLEMENTATION_PLAN.md
- [x] TODO.md

## M1 — Foundation
- [ ] `constants/adminEndpoints.ts`
- [ ] `constants/adminOptions.ts` (roles, genders, feedback types, device types)
- [ ] `types/admin/*.ts`
- [ ] `utils/adminApi.ts` (normalizePaginated, buildFormData, parseApiErrors)
- [ ] `services/admin/*.ts` (users, reports, games, filters, feedback, notifications, lfg)

## M2 — Authentication
- [ ] `composables/useAdminAuth.ts` (login/logout/refresh + cookies + abilities)
- [ ] Wire `pages/login.vue`
- [ ] Token refresh on 401
- [ ] Cookie-based `middleware/acl.global.ts`

## M3 — Navigation & Dashboard
- [ ] `navigation/vertical/admin.ts`
- [ ] `pages/admin/dashboard.vue`

## M4 — Users
- [ ] List + search + role filter + pagination + bulk delete
- [ ] Create
- [ ] Edit
- [ ] Detail
- [ ] Inline role change

## M5 — Games catalog
- [ ] Platforms
- [ ] Categories
- [ ] Items
- [ ] Games (nested form)

## M6 — Filters / Feedback / Notifications / Reports
- [ ] Filter categories CRUD
- [ ] Feedback moderation (+ bulk delete, type filter, screenshots)
- [ ] Notifications composer (test push)
- [ ] Reports list + delete

## M7 — Polish
- [ ] Global error handling / toasts
- [ ] Loading skeletons / empty states
- [ ] Responsive + permission-aware nav
- [ ] Final docs refresh

## Notes / blockers
- No `package.json` vendored → cannot `pnpm install` / build / run in this env.
- Backend bug: `posts.UserLFGListAPIView` `select_related("platforms")` (should be
  `platform`) raises FieldError — handled gracefully in UI, backend left unchanged.
- Admin needs BOTH group `admin` (IsAdmin) AND `is_staff` (reports use IsAdminUser).
