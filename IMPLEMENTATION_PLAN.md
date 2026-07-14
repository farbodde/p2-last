# IMPLEMENTATION_PLAN.md

Building the P2 Player admin panel inside
`panel/nuxt-version/typescript-version/full-version` (Nuxt 3 + Vuetify / Vuexy TS).

## Guiding principles
- Extend the purchased template; never replace it.
- Adapt the frontend to the backend; never change backend contracts.
- Reuse the template's `$api`, `useApi`, cookies, CASL, layouts, VDataTable.
- Every page reflects real serializers/permissions/validation, not generic CRUD.

## Directory conventions (added under the panel root)
```
constants/adminEndpoints.ts   # single source of API paths
constants/adminOptions.ts     # roles, genders, feedback types, device types
types/admin/*.ts              # TS interfaces mirroring serializers
utils/adminApi.ts             # normalizePaginated, buildFormData, error helpers
services/admin/*.ts           # typed API service per resource (uses $api)
composables/useAdminAuth.ts   # login/logout/refresh via Django JWT + cookies
pages/admin/**                # admin pages (file-based routing)
navigation/vertical/admin.ts  # sidebar section
```

## Milestones

### M0 — Discovery & docs ✅
Inspect backend end-to-end; produce PROJECT_ANALYSIS, ADMIN_API_MAP, this plan, TODO.

### M1 — Foundation
- `constants/adminEndpoints.ts`, `constants/adminOptions.ts`
- `types/admin/*` (User, Report, Platform, Category, Item, Game, FilterCategory,
  Feedback, Notification, LFG, pagination)
- `utils/adminApi.ts` — normalize the two pagination shapes; `buildFormData`
  (multipart w/ arrays + files); DRF error → field-error map.
- `services/admin/*` — one typed service per resource.

### M2 — Authentication
- `composables/useAdminAuth.ts`: `login(email,password)` → Django `/auth/login/`,
  store `accessToken`, `refreshToken`, `userData`, `userAbilityRules` cookies.
  `logout()`, `refresh()`.
- Ability rules from role: `admin` → `[{action:'manage', subject:'all'}]`.
- Wire `pages/login.vue` to `useAdminAuth`.
- `plugins/adminAuthRefresh.ts` / `$api` 401 → refresh → retry, else logout.
- Update `middleware/acl.global.ts` to a cookie-based check (accessToken + ability).

### M3 — Navigation & Dashboard
- `navigation/vertical/admin.ts` grouped: Dashboard, Users, Reports, Games,
  Filters, Feedback, Notifications.
- `pages/admin/dashboard.vue` — stat cards + recent reports/feedback/users using
  existing list endpoints (`count`s + latest rows).

### M4 — Users module (flagship)
- List (`/admin/users`): server table, search, role filter, pagination, status
  badges (active / online), row actions, inline role change, bulk delete.
- Create (`/admin/users/new`), Edit (`/admin/users/[username]/edit`) — forms from
  serializers, multipart image upload, backend validation surfaced per-field.
- Detail (`/admin/users/[username]`) — profile, role management, blocks/reports refs.

### M5 — Games catalog
- Platforms, Categories, Items, Games pages (list + create/edit dialogs).
- Game form: multi-select platforms + nested categories/items with `item_limit`.

### M6 — Filters, Feedback, Notifications, Reports
- Filter Categories CRUD (category OneToOne, is_active, order).
- Feedback moderation (type filter, screenshots preview, delete, bulk delete).
- Notifications composer (test push) + device register/unregister.
- Reports list (is_staff gate) + image previews + delete.

### M7 — Polish
- Global error handling, toasts, loading skeletons, empty states, responsive checks,
  permission-aware nav, i18n labels. Update docs + TODO.

## Testing / verification note
No `package.json` is vendored in this environment, so `pnpm install` / `nuxt build`
cannot run here. Code is written to the template's typed conventions. Verification
steps for a developer with the full template:
1. `pnpm i` in the panel root.
2. Set `NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`.
3. `python manage.py seed_demo_data` (creates `admin@demo.player2.local`).
4. `pnpm dev`, log in as the admin, exercise each module.
