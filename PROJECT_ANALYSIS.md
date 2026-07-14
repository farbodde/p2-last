# PROJECT_ANALYSIS.md

Analysis of the **P2 Player** backend and the plan for building its
Administration Dashboard inside the purchased Nuxt (Vuexy / Vuetify + TS)
admin template located in `panel/nuxt-version/typescript-version/full-version`.

> The Django backend is the single source of truth. This document records
> exactly what exists — no invented models, endpoints, or business rules.

---

## 1. High-level architecture

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2 + Django REST Framework 3.15 |
| Auth | `djangorestframework-simplejwt` (JWT, Bearer) + Session auth (for DRF browsable API) |
| Realtime | Django Channels 4 + Redis (chat) |
| Async | Celery + Redis (push notifications) |
| Push | Firebase Admin SDK (FCM) |
| DB | PostgreSQL |
| API docs | drf-spectacular (Swagger/Redoc) — **admin endpoints are excluded from the schema** |
| Admin panel (this project) | Nuxt 3 + Vuetify (Vuexy TS full-version) |

Root URL config: `backend/core/urls.py`. All API routes are mounted under
`/api/v1/`. The Django admin site is at `/home_ad/`.

### API namespaces (`core/urls.py`)

| Prefix | App | Include |
|--------|-----|---------|
| `/api/v1/meta/languages/` | core | `LanguageListView` |
| `/api/v1/meta/countries/` | core | `CountryistView` |
| `/api/v1/auth/` | auth_app | `auth_app.urls` |
| `/api/v1/feedback/` | feed_back | `feed_back.urls` |
| `/api/v1/notify/` | notification | `notification.urls` |
| `/api/v1/lfg/` | posts | `posts.urls` |
| `/api/v1/game/` | games | `games.urls` |
| `/api/v1/filter/` | filter | `filter.urls` |
| `/api/v1/chats/` | chat | `chat.urls` |

---

## 2. Django apps

| App | Domain | Has admin endpoints |
|-----|--------|---------------------|
| `auth_app` | Custom user, roles, reports, blocks, account-IDs, Google OAuth | ✅ users, roles, reports |
| `games` | Games catalog: Platforms, Categories, Items, Games, GameModes | ✅ platforms/categories/items/games |
| `filter` | LFG filter config + filtering service | ✅ filter-categories |
| `feed_back` | User feedback (bug/complaint/suggestion/technical) | ✅ list/delete/bulk-delete |
| `notification` | FCM devices + notifications + test push | ✅ device + test push |
| `posts` | LFG ("Looking For Group") posts, bookmarks | ✅ list a user's LFGs |
| `chat` | 1:1 chat (Channels websockets) | ❌ (user-facing only) |
| `core` | settings, meta endpoints, middleware, constants | meta (public) |

---

## 3. Authentication & authorization

### Authentication
- JWT via SimpleJWT. `ACCESS_TOKEN_LIFETIME = 15 min`, `REFRESH_TOKEN_LIFETIME = 7 days`.
- Header type: `Authorization: Bearer <access>`.
- Login: `POST /api/v1/auth/login/` → `EmailTokenObtainPairSerializer`
  (username field is **email**). Response:
  ```json
  {
    "access": "...",
    "refresh": "...",
    "user": {
      "id": 1, "email": "...", "display_name": "...", "username": "...",
      "role": "admin", "is_staff": true, "is_superuser": true
    }
  }
  ```
  Inactive accounts are rejected (`AuthenticationFailed`).
- Refresh: `POST /api/v1/auth/token/refresh/` (SimpleJWT `TokenRefreshView`) → `{ "access": "..." }`.
- Google OAuth: `POST /api/v1/auth/google/` → same `{ access, refresh, user }` shape.
- `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]` — every endpoint is protected unless it overrides.

### Authorization (two distinct admin gates!)
- **`auth_app.permissions.IsAdmin`** — custom. True when the user belongs to the
  Django group named **`"admin"`**. Used by: games (all), filter, feed_back,
  notification (device/test), posts (user LFG list), auth_app user CRUD & roles.
- **DRF `IsAdminUser`** — built-in. True when `user.is_staff`. Used **only** by
  `ReportListAPIView` and `ReportDeleteAPIView`.

> ⚠️ Implication for the panel: an admin user should be **both** in the `admin`
> group **and** `is_staff=True` to reach every admin endpoint. The seed command
> creates `admin@demo.player2.local` with `is_staff=is_superuser=True`.

### Roles
Group-based. Known role names (from `UserRoleUpdateSerializer`):
`player`, `youtuber`, `premium_user`, `admin`. A user's "primary role" in
serializers is `groups.first().name`.

---

## 4. Domain models & relationships

### auth_app
- **User** (`AUTH_USER_MODEL`, `USERNAME_FIELD = email`): `email` (unique),
  `display_name`, `username` (unique, nullable, changeable every 10 days),
  `profile_image`, `cover_image`, `about_me`, `gender` (male/female/none),
  `date_of_birth`, `location`, `languages` (JSON list), `is_active`, `is_staff`,
  `last_activity`, `auth_provider` (email/google). Property `is_online`
  (active within last 5 min). Groups = roles (M2M via PermissionsMixin).
- **UserReport**: `reporter` FK → User, `reported_user` FK → User, `message`,
  `created_at`; **UserReportImage**: FK → report, `image`.
- **UserBlock**: `user` + `blocked_user` (unique_together).
- **AccountID**: `owner` FK → User, `platform` FK → games.Platform, `username`
  (unique_together owner+platform+username).
- **DefaultProfileImage / DefaultCoverImage**: fallbacks applied on profile update.

### games
- **Platform**: `title`, `logo` (image), timestamps.
- **Category**: `title`, `limit` (nullable = unlimited), timestamps. `is_unlimited()`.
- **Item**: `category` FK → Category, `title`, `icon` (image), timestamps.
- **Game**: `title`, `cover` (image), `platforms` (M2M → Platform),
  `is_cross_platform` (property, >1 platform), `created_at`.
- **GameCategory**: `game` FK, `category` FK, `item_limit` (-1 = unlimited),
  unique_together (game, category).
- **GameCategoryItem**: `game_category` FK, `item` FK, unique_together.
- **GameMode**: `game` FK, `title`.

### filter
- **FilterCategory**: OneToOne → games.Category, `is_active`, `order`, `created_at`.
  Drives the dynamic filter UI in the mobile app.

### feed_back
- **Feedback**: `user` FK (nullable), `email`, `description`,
  `type` (bug/complaint/suggestion/technical), `created_at`.
- **FeedbackScreenshot**: FK → feedback, `image`.

### notification
- **Device**: `user` FK, `token` (unique), `device_type` (android/ios/web).
- **Notification**: `user` FK, `title`, `body`, `data` (JSON), `is_read`, `created_at`.

### posts
- **LFG**: `owner` OneToOne → User, `game` FK, `platform` FK, `allow_cross_play`,
  `mic_enabled`, `game_mode` FK (nullable), `description`, `bumped_at`
  (bump allowed every 3h), timestamps.
- **LFGStatImage**: FK → LFG, `image`.
- **LFGSelectedItem**: FK → LFG, FK → GameCategoryItem (unique_together).
- **LFGBookmark**: `user` + `lfg` (unique_together).

### chat
- **Chat** / **Message** (websocket-driven; not part of admin surface).

---

## 5. Serializers (admin-relevant)

- `auth_app.admin_serializers`:
  - `UserDetailSerializer` (read) — full user incl. `role`, `is_online`, staff flags.
  - `UserCreateSerializer` (write) — requires `email`, `password` (validated),
    optional `role`; accepts profile fields + `is_active`.
  - `UserUpdateSerializer` (write, partial) — profile fields + `is_active` (no password).
  - `UserRoleUpdateSerializer` — `username` + `role` (choice).
- `auth_app.serializers.ReportListSerializer` — reporter/reported username+email,
  `message`, `image_urls` (absolute), `created_at`.
- `games.serializers`: `PlatformSerializer`, `CategorySerializer`
  (`limit` accepts number or `"unlimited"` → null), `ItemSerializer`
  (`category_id` write / `category` read), `GameSerializer` (nested platforms +
  categories + `is_cross_platform`), `GameCreateUpdateSerializer`
  (`platform_ids` + nested `categories` [{category, item_limit, items[]}]).
- `filter.serializers.FilterCategoryAdminSerializer` — `category`, `is_active`, `order`.
- `feed_back.serializers.FeedbackListSerializer` — incl. nested `screenshots`, `user`.
- `notification.serializers.NotificationSerializer` — `__all__`.
- `posts.serializers.LFGListSerializer` — used by admin user-LFG list.

---

## 6. Pagination shapes (⚠️ two different shapes!)

1. **DRF `PageNumberPagination`** (games, reports, feedback, filter router):
   ```json
   { "count": N, "next": url|null, "previous": url|null, "results": [...] }
   ```
   Query params: `page`, `page_size` (games/reports/feedback allow override).
2. **Custom hand-rolled** (`auth_app.admin_views.UserListView`):
   ```json
   { "count", "num_pages", "current_page", "has_next", "has_previous", "results" }
   ```
   Query params: `page`, `page_size`, `search`, `role`.

The panel API layer normalizes both into a single `Paginated<T>` type.

---

## 7. Observations / technical notes

- **Identifier scheme is inconsistent**: user admin routes key on **`username`**
  (string); games/filter/feedback/reports key on **integer `pk`**. Games views
  contain a `_decrypt_pk` helper (Fernet) but the registered routes pass a plain
  `<int:pk>`, so integer ids are used in practice.
- **Known backend bug (documented, not fixed):** `posts.views.UserLFGListAPIView`
  uses `select_related("owner","game","platforms")` but the LFG field is
  `platform` (singular) → this endpoint raises `FieldError` at runtime. The panel
  includes the page but surfaces the backend error gracefully rather than
  patching the backend (per project constraints).
- `NotificationListAPIView`, mark-read, etc. use `AllowAny` yet reference
  `request.user` — they only work for authenticated users; not admin surface.
- `TestPushNotificationAPIView` currently only validates + returns "queued" (the
  actual `send_push_notification.delay` call is commented out).
- Media files served from `/media/` (DEBUG). Image fields return relative URLs
  except `ReportListSerializer.image_urls` which are absolutized.
- CORS is fully open in dev (`CORS_ALLOW_ALL_ORIGINS = True`).

---

## 8. Panel template notes (Vuexy Nuxt TS full-version)

- Vuetify 3 + Nuxt 3, file-based routing under `pages/`.
- API helpers already present: `utils/api.ts` (`$api` ofetch instance with
  `accessToken` cookie bearer) and `composables/useApi.ts` (`useFetch` wrapper).
- Auth cookies expected by the template: `accessToken`, `userData`,
  `userAbilityRules` (see `server/fake-db/auth/types.ts`). The template ships a
  mock nuxt-auth credentials provider; the admin panel wires these cookies to the
  **real Django JWT** login instead.
- Access control via CASL (`plugins/casl`, `middleware/acl.global.ts`,
  `canNavigate`). Admin pages declare `meta: { action, subject }`.
- No `package.json` is vendored in this environment, so the panel cannot be
  installed/built/run here; code is written to the template's established
  conventions and typed against the real API.
