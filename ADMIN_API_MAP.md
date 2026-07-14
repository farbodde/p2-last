# ADMIN_API_MAP.md

Every **administrative** endpoint in the P2 Player backend, documented for the
Nuxt admin panel. All paths are prefixed with `/api/v1/`. All admin endpoints
require `Authorization: Bearer <access>`.

**Permission legend**
- `IsAdmin` → user must be in Django group **`admin`**.
- `IsAdminUser` → user must have **`is_staff=True`** (DRF built-in).

---

## auth_app — Users, Roles, Reports (`/api/v1/auth/`)

### `GET admin/users/`
- **View**: `UserListView` (APIView) · **Serializer**: `UserDetailSerializer` · **Model**: User
- **Auth**: JWT · **Permission**: `IsAuthenticated + IsAdmin`
- **Query**: `search` (email/display_name/username icontains), `role` (group name),
  `page`, `page_size` (default 10)
- **Response** (custom pagination):
  `{ count, num_pages, current_page, has_next, has_previous, results: UserDetail[] }`
- **Frontend page**: `/admin/users` (list)

### `POST admin/users/create/`
- **View**: `UserCreateView` · **Serializer**: `UserCreateSerializer` (in) / `UserDetailSerializer` (out)
- **Permission**: `IsAdmin` · **Upload**: multipart (`profile_image`, `cover_image`)
- **Request**: `email*`, `password*`, `display_name`, `username`, `about_me`,
  `gender`, `date_of_birth`, `location`, `languages[]`, `is_active`, `role`,
  `profile_image`, `cover_image`
- **Validation**: password via Django validators; unknown `role` → 400
- **Response**: `201` UserDetail
- **Frontend page**: `/admin/users/new`

### `GET admin/users/<username>/`
- **View**: `UserDetailView` · **Serializer**: `UserDetailSerializer`
- **Permission**: `IsAdmin` · **404** if not found
- **Frontend page**: `/admin/users/[username]` (detail)

### `PUT admin/users/<username>/update/`
- **View**: `UserUpdateView` · **Serializer**: `UserUpdateSerializer` (partial=True)
- **Permission**: `IsAdmin` · **Upload**: multipart
- **Request**: any of `email, display_name, username, profile_image, cover_image,
  about_me, gender, date_of_birth, location, languages, is_active` + optional `role`
- **Response**: UserDetail · **Frontend**: `/admin/users/[username]/edit`

### `DELETE admin/users/<username>/delete/`
- **View**: `UserDeleteView` · **Permission**: `IsAdmin`
- **Response**: `204 { detail }` · **Frontend**: users list/detail delete action

### `POST admin/users/update-role/`
- **View**: `UpdateUserRoleView` · **Serializer**: `UserRoleUpdateSerializer`
- **Permission**: `IsAdmin`
- **Request**: `{ username, role }` where role ∈ player|youtuber|premium_user|admin
- **Validation**: user exists, role group exists
- **Response**: `{ message }` · **Frontend**: role dropdown on users list/detail

### `GET admin/users/reports/`
- **View**: `ReportListAPIView` · **Serializer**: `ReportListSerializer` · **Model**: UserReport
- **Permission**: **`IsAdminUser`** (is_staff) · **Pagination**: DRF (`page_size` 20, max 100)
- **Response**: `{ count, next, previous, results: Report[] }` where each report has
  `id, reporter_username, reporter_email, reported_user_username,
  reported_user_email, message, image_urls[], created_at`
- **Frontend page**: `/admin/reports`

### `DELETE admin/users/reports/<pk>/delete/`
- **View**: `ReportDeleteAPIView` · **Permission**: **`IsAdminUser`**
- **Response**: `204 { detail }` / `404` · **Frontend**: reports list delete action

---

## games — Catalog (`/api/v1/game/`)

Pagination: DRF `DefaultPagination` (`page_size` 10, `page_size` overridable, max 100).

### Platforms
- `GET  admin/platforms/` — `PlatformListCreateAPIView` · `PlatformSerializer` · `IsAdmin` · paginated
- `POST admin/platforms/` — create (`title*`, `logo*` multipart)
- `GET/PUT/PATCH/DELETE admin/platforms/<pk>/` — `PlatformRetrieveUpdateDestroyAPIView`
- **Fields**: `id, title, logo, created_at, updated_at`
- **Frontend page**: `/admin/games/platforms`

### Categories
- `GET/POST admin/categories/` — `CategoryListCreateAPIView` · `CategorySerializer` · `IsAdmin`
- `GET/PUT/PATCH/DELETE admin/categories/<pk>/`
- `GET admin/categories/<category_id>/items/` — `CategoryItemsAPIView` (`IsAuthenticated`) items of a category
- **Fields**: `id, title, limit` (number or `"unlimited"` → stored null), `created_at, updated_at`
- **Frontend page**: `/admin/games/categories`

### Items
- `GET/POST admin/items/` — `ItemListCreateAPIView` · `ItemSerializer` · `IsAdmin`
  - **Query**: `category_id` (filter)
- `GET/PUT/PATCH/DELETE admin/items/<pk>/`
- **Fields**: `id, title, icon` (multipart), `category` (read str), `category_id` (write), timestamps
- **Frontend page**: `/admin/games/items`

### Games
- `GET/POST admin/games/` — `GameListCreateAPIView` · `IsAdmin`
  - list → `GameSerializer` (nested platforms + categories + `is_cross_platform`)
  - create → `GameCreateUpdateSerializer`
- `GET/PUT/PATCH/DELETE admin/games/<pk>/` — `GameRetrieveUpdateDestroyAPIView`
- **Create/Update request**: `title*`, `cover*` (multipart), `platform_ids[]`,
  `categories: [{ category, item_limit, items[] }]` (item count must not exceed limit unless -1)
- **Read fields**: `id, title, cover, platforms[], is_cross_platform, categories[], created_at`
- **Frontend page**: `/admin/games/games`

Supporting (non-admin but used to build game forms):
- `GET game/<game_id>/modes/` (public), `GET game/<game_id>/categories/` (auth),
  `GET game/list/` (public).

---

## filter — Filter Categories (`/api/v1/filter/`)

### `admin/filter-categories/` (DRF ModelViewSet, DefaultRouter)
- **View**: `FilterCategoryAdminViewSet` · **Serializer**: `FilterCategoryAdminSerializer`
- **Permission**: `IsAdmin`
- Routes: `GET/POST admin/filter-categories/`, `GET/PUT/PATCH/DELETE admin/filter-categories/<pk>/`
- **Fields**: `id, category` (Category PK, OneToOne), `is_active`, `order`
- **Frontend page**: `/admin/filter-categories`

### `GET config/` (context / helper)
- **View**: `FilterConfigAPIView` (`IsAuthenticated`) — returns games, platforms,
  dynamic categories, countries, languages, age range. Useful reference data.

---

## feed_back — Feedback moderation (`/api/v1/feedback/`)

### `GET list/`
- **View**: `FeedbackListView` · **Serializer**: `FeedbackListSerializer` · **Permission**: `IsAuthenticated + IsAdmin`
- **Pagination**: DRF (`page_size` 10, max 100) · **Query**: `type` (bug/complaint/suggestion/technical)
- **Fields**: `id, user (str), email, description, type, created_at, screenshots[]`
- **Frontend page**: `/admin/feedback`

### `DELETE delete/<feedback_id>/`
- **View**: `FeedbackDeleteView` · **Permission**: `IsAuthenticated + IsAdmin` · `204`

### `DELETE bulk-delete/`
- **View**: `FeedbackBulkDeleteView` · **Permission**: `IsAdmin`
- **Request**: `{ feedback_ids: number[] }` · **Response**: `{ message }`
- **Frontend**: bulk-select delete on feedback table

### `POST submit/` (public/user)
- `SubmitFeedbackView` (`IsAuthenticatedOrReadOnly`) — user submission (not admin).

---

## notification — Devices & Push (`/api/v1/notify/`)

### `POST devices/`
- **View**: `RegisterDeviceAPIView` · **Permission**: `IsAdmin`
- **Request**: `{ fcm_token, device_type }` (android/ios/web) · `201`

### `DELETE devices/remove/`
- **View**: `UnregisterDeviceAPIView` · **Permission**: `IsAdmin` · **Request**: `{ fcm_token }`

### `POST test/`
- **View**: `TestPushNotificationAPIView` · **Permission**: `IsAdmin`
- **Request**: `{ title*, body*, data? }` · **Response**: `{ detail: "Push notification queued" }`
- **Frontend page**: `/admin/notifications` (compose/test push)

> Other notification routes (`""`, `<pk>/read/`, `read-all/`, `unread-count/`)
> are `AllowAny`/user-scoped, not part of the admin surface.

---

## posts — User LFG inspection (`/api/v1/lfg/`)

### `GET user/<user_id>/`
- **View**: `UserLFGListAPIView` · **Serializer**: `LFGListSerializer` · **Permission**: `IsAdmin`
- **Pagination**: `LFGPagination`
- **Frontend**: surfaced from the user detail page ("LFG posts by this user")
- ⚠️ Backend `select_related("platforms")` bug (see PROJECT_ANALYSIS §7) — panel
  handles the resulting error gracefully.

---

## meta (public reference data, `/api/v1/meta/`)

- `GET languages/` → `[{ code, name }]` (used by user forms language picker)
- `GET countries/` → `[{ code, name }]`
- These are `AllowAny`. The panel uses them to render language/country selects.

---

## Auth endpoints used by the panel (`/api/v1/auth/`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `login/` | Obtain `{ access, refresh, user }` (email + password) |
| POST | `token/refresh/` | Refresh access token `{ refresh } → { access }` |
| POST | `google/` | Google OAuth login (optional) |
| GET/PATCH | `profile/` | Current user's own profile |
| POST | `change-password/` | Change own password |
