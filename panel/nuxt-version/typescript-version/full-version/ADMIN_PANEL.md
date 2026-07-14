# P2 Player — Admin Panel

This Nuxt (Vuexy TS) template has been extended into the administration
dashboard for the P2 Player Django backend. See the repository-root docs
(`PROJECT_ANALYSIS.md`, `ADMIN_API_MAP.md`, `IMPLEMENTATION_PLAN.md`, `TODO.md`)
for the full backend analysis and API mapping.

## Setup

```bash
pnpm install
cp .env.example .env
# Point NUXT_PUBLIC_API_BASE_URL at the backend /api/v1 root, e.g.
#   NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
pnpm dev
```

Seed an admin on the backend (creates `admin@demo.player2.local`, is_staff +
is_superuser):

```bash
python manage.py seed_demo_data
```

> The admin panel requires the account to be in the Django `admin` group
> (`IsAdmin`) and/or `is_staff` (`IsAdminUser`, used by the Reports endpoints).
> Grant the seeded admin the `admin` group to reach every module.

## Architecture (added on top of the template)

| Path | Responsibility |
|------|----------------|
| `constants/adminEndpoints.ts` | Single source of API paths (mirrors ADMIN_API_MAP) |
| `constants/adminOptions.ts` | Choice sets (roles, genders, feedback/device types) + CASL rules |
| `types/admin/*` | TS interfaces mirroring backend serializers |
| `utils/adminApi.ts` | Pagination normalization, multipart builder, DRF error parser, mediaUrl |
| `utils/api.ts` | `$api` ofetch instance: bearer + 401 auto-refresh + retry |
| `services/admin/*` | Typed API services per resource |
| `composables/useAdminAuth.ts` | Django JWT login/logout/refresh → cookies + CASL |
| `composables/useSnackbar.ts` | Global toast |
| `components/admin/*` | `AdminSnackbar`, `AdminConfirmDialog` |
| `views/admin/*` | Complex forms (`UserForm`, `GameForm`) |
| `pages/admin/*` | Admin pages (file-based routing) |
| `navigation/vertical/admin.ts` | Sidebar (CASL-gated on `AdminPanel`) |

## Authentication

- Cookie-based JWT (matches the template's `accessToken` / `refreshToken` /
  `userData` / `userAbilityRules` cookies). The mock `@sidebase/nuxt-auth`
  provider is left installed but inert (`globalAppMiddleware: false`).
- `middleware/acl.global.ts` gates routes by login cookie + CASL ability.
- The `admin` role gets `manage all`; other roles are bounced to `not-authorized`.

## Pages

Dashboard · Users (list/create/edit/detail + roles + bulk delete) · Reports ·
Games catalog (Games / Platforms / Categories / Items) · Filter categories ·
Feedback · Notifications (test push + device tokens).
