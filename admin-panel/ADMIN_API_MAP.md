# ADMIN_API_MAP.md — Every admin resource, endpoint, field & action

> Derived entirely from backend source. "Envelope" letters refer to
> PROJECT_ANALYSIS.md §5. Base API URL in dev: `http://localhost:8001` (compose
> maps host `8001` → container `8000`) or `http://localhost:8000` if run
> directly. All admin calls require `Authorization: Bearer <access>`.

Legend for view style: **G** = DRF generic (OPTIONS metadata available) ·
**A** = plain APIView (no OPTIONS metadata; fields are declared in the registry).

---

## 0. AUTH (panel bootstrap — not a managed resource)

| Endpoint | Method | Body / params | Returns |
|---|---|---|---|
| `/api/v1/auth/login/` | POST | `{email, password}` | `{access, refresh, user{id,email,display_name,username,role,is_staff,is_superuser}}` |
| `/api/v1/auth/token/refresh/` | POST | `{refresh}` | `{access}` |
| `/api/v1/auth/profile/` | GET/PATCH | profile fields | current user's profile |

---

## 1. USERS  ·  app `auth_app`  ·  style **A**  ·  gate `IsAdmin` (Group "admin")

Base: `/api/v1/auth/admin/users/` · **lookup key = `username` (string), not pk.**

| Op | Method + path | Envelope / body |
|---|---|---|
| List | `GET admin/users/?search=&role=&page=&page_size=` | **B** `{count,num_pages,current_page,has_next,has_previous,results:[User]}` |
| Create | `POST admin/users/create/` | body = UserCreate; → 201 UserDetail |
| Retrieve | `GET admin/users/<username>/` | UserDetail |
| Update | `PUT admin/users/<username>/update/` | partial UserUpdate (+optional `role`); → UserDetail |
| Delete | `DELETE admin/users/<username>/delete/` | → 204 |
| **Change role** | `POST admin/users/update-role/` `{username, role}` | custom action |

**UserDetail (read) fields** — `UserDetailSerializer`:
`id, email, display_name, username, profile_image, cover_image, about_me,
gender(choice: male/female/none), date_of_birth, location, languages(list),
is_active, is_staff, is_superuser, last_login, last_activity, is_online, role`.
Read-only: `id, last_login, last_activity, is_online, role`.

**UserCreate (write) fields** — `UserCreateSerializer`:
`email*, display_name*, username, password* (write-only), profile_image,
cover_image, about_me, gender, date_of_birth, location, languages, is_active,
role`. Password validated by Django validators.

**UserUpdate (write) fields** — `UserUpdateSerializer`:
`email, display_name, username, profile_image, cover_image, about_me, gender,
date_of_birth, location, languages, is_active` (+ `role` handled by the view).

Notes: users with `username = null` cannot be addressed by the string-lookup
routes. `role` on create/update is applied by clearing groups and adding the
named group; invalid role → 400.

---

## 2. USER REPORTS  ·  `auth_app`  ·  style **A**  ·  gate `IsAdminUser` (**is_staff**)

| Op | Method + path | Envelope |
|---|---|---|
| List | `GET /api/v1/auth/admin/users/reports/?page=&page_size=` | **A** (page_size 20, max 100) |
| Delete | `DELETE /api/v1/auth/admin/users/reports/<pk>/delete/` | → 204 |

**ReportList fields** — `ReportListSerializer` (all read-only):
`id, reporter_username, reporter_email, reported_user_username,
reported_user_email, message, image_urls[], created_at`. Read-only resource
(list + delete only). ⚠ Different gate (`is_staff`) than the rest of the panel.

---

## 3. GAMES DOMAIN  ·  app `games`  ·  base `/api/v1/game/`  ·  gate `IsAdmin`

### 3a. Platforms — style **G**
`GET|POST admin/platforms/` · `GET|PUT|PATCH|DELETE admin/platforms/<pk>/` ·
Envelope **A** (page_size 10).
`PlatformSerializer`: `id(ro), title*, logo(image), created_at(ro), updated_at(ro)`.

### 3b. Categories — style **G**
`GET|POST admin/categories/` · `GET|PUT|PATCH|DELETE admin/categories/<pk>/`.
`CategorySerializer`: `id(ro), title*, limit(char, nullable — accepts int or
"unlimited"/null), created_at(ro), updated_at(ro)`.
Aux: `GET admin/categories/<category_id>/items/` (IsAuthenticated) → items list.

### 3c. Items — style **G**
`GET|POST admin/items/?category_id=` · `GET|PUT|PATCH|DELETE admin/items/<pk>/`.
`ItemSerializer`: `id(ro), title*, icon(image), category(string, ro),
category_id(pk, write-only, required), created_at(ro), updated_at(ro)`.

### 3d. Games — style **G**, **asymmetric read vs write serializer**
`GET|POST admin/games/` · `GET|PUT|PATCH|DELETE admin/games/<pk>/`.
- **Read** (`GameSerializer`): `id, title, cover(image), platforms[nested
  Platform], is_cross_platform(bool), categories[nested GameCategory
  {id,category,category_title,item_limit,items[]}], created_at`.
- **Write** (`GameCreateUpdateSerializer`): `title*, cover(image),
  platform_ids:[int]*, categories:[{category:int, item_limit:int(-1=unlimited),
  items:[int]}]*`.
- → **Custom composite form** in the panel (Phase 2 pilot "relations" model):
  platform multi-select + repeatable category rows each with an item
  multi-select. Server enforces `len(items) <= item_limit`.

### 3e. Read-only helpers (for FK/lookup dropdowns, not managed screens)
- `GET /api/v1/game/list/` (AllowAny) — all games.
- `GET /api/v1/game/<game_id>/modes/` (AllowAny) — game modes.
- `GET /api/v1/game/<game_id>/categories/` (IsAuthenticated).

---

## 4. FILTER CATEGORIES  ·  app `filter`  ·  style **G** (ModelViewSet + router)  ·  gate `IsAdmin`

Base: `/api/v1/filter/admin/filter-categories/` — full REST (list/create/
retrieve/update/partial/destroy).
`FilterCategoryAdminSerializer`: `id(ro), category(FK pk to games.Category —
OneToOne), is_active(bool), order(int)`.
Envelope **D** (no pagination configured → returns full list). **(UNVERIFIED)**
Aux: `GET /api/v1/filter/config/` (IsAuthenticated) — aggregate config object
(games, platforms, dynamic_categories, countries, languages, age_range); useful
for the dashboard and dropdowns.

---

## 5. FEEDBACK  ·  app `feed_back`  ·  base `/api/v1/feedback/`  ·  style **A**  ·  gate `IsAdmin`

| Op | Method + path | Envelope / body |
|---|---|---|
| List | `GET list/?type=&page=&page_size=` | **A** (page_size 10) |
| Delete | `DELETE delete/<feedback_id>/` | → 204 |
| **Bulk delete** | `DELETE bulk-delete/` `{feedback_ids:[int]}` | → 200 `{message}` |

`FeedbackListSerializer` (read-only in panel):
`id, user(string), email, description, type(choice: bug/complaint/suggestion/
technical), created_at, screenshots:[{id,image}]`.
(`POST submit/` is the public end-user submit path — **not** an admin screen.)
→ Feedback is a **list + delete + bulk-delete** resource (no admin create/edit).

---

## 6. NOTIFICATIONS  ·  app `notification`  ·  base `/api/v1/notify/`  ·  style **A**

| Op | Method + path | Gate |
|---|---|---|
| Register device | `POST devices/` `{fcm_token, device_type}` | IsAdmin |
| Unregister device | `DELETE devices/remove/` `{fcm_token}` | IsAdmin |
| **Test push (stub)** | `POST test/` `{title, body, data}` | IsAdmin |
| (user) list / read / read-all / unread-count | per-user | AllowAny |

⚠ There is **no** admin endpoint to list or CRUD *all* `Notification` or
`Device` rows. Admin coverage here = "send a test push" + device
register/unregister only. `test/` currently returns success without actually
sending (the Celery dispatch is commented out). Modelled in Phase 3 as an
**action panel**, not a CRUD table.

---

## 7. LFG / POSTS  ·  app `posts`  ·  base `/api/v1/lfg/`

Admin-relevant:
- `GET /api/v1/lfg/user/<user_id>/` (IsAdmin) — one user's LFGs, envelope
  page_size 8. ⚠ **Likely broken** (`select_related("platforms")` FieldError —
  see PROJECT_ANALYSIS.md §9). Panel treats a 500 here gracefully.

Everything else in `posts` is end-user self-service (create/update/delete own
LFG, bookmarks, bump, filter) → **not** admin screens.

---

## 8. CHAT  ·  app `chat`  ·  base `/api/v1/chats/`
All endpoints are `IsAuthenticated` and scoped to the current user's own chats.
**No admin endpoints.** `Chat`/`Message` have no REST admin surface.

---

## 9. META (public — dropdown sources)
- `GET /api/v1/meta/languages/` → `[{code,name}]`
- `GET /api/v1/meta/countries/` → `[{code,name}]`

---

## 10. Django-Admin ↔ REST-Admin coverage matrix (what "parity" means)

`admin.py` registers these models; the column shows what the **REST** API
actually exposes for admin use.

| Model (registered in Django admin) | REST admin coverage |
|---|---|
| **User** | ✅ Full CRUD + role action |
| **UserReport** | 🟡 List + delete (is_staff gate) |
| UserReportImage | ❌ none (inline only) |
| DefaultProfileImage / DefaultCoverImage | ❌ none |
| UserBlock | ❌ none (user-facing block/unblock only) |
| AccountID | ❌ none (user-facing only) |
| **Platform / Category / Item / Game** | ✅ Full CRUD |
| GameCategory / GameCategoryItem | 🟡 only via nested Game write payload |
| GameMode | ❌ none (read-only helper list) |
| **FilterCategory** | ✅ Full CRUD |
| **Feedback** | 🟡 List + delete + bulk-delete |
| FeedbackScreenshot | ❌ none (nested read only) |
| **Notification / Device** | 🟡 register/test only, no list/CRUD |
| LFG | 🟡 read per-user (and likely broken) |
| LFGStatImage / LFGSelectedItem / LFGBookmark | ❌ none |
| Chat / Message | ❌ none |

**Full parity with Django admin is impossible without inventing new
endpoints, which the brief forbids.** The panel's managed scope is therefore
the ✅/🟡 rows. Whether to (a) ship partial parity or (b) approve an *additive*
generic admin API to reach full parity is an explicit decision for the user —
raised in SCHEMA_STRATEGY.md §7 and the Phase 0 summary.

## 11. Declared frontend fallbacks (per CORE PRINCIPLE)

Because OPTIONS yields no field metadata for style-**A** endpoints and the
OpenAPI schema excludes `/admin/`, the following field lists are **declared in
the frontend resource registry** (they mirror the serializers above and are the
documented fallback "when metadata is genuinely unavailable"):
- Users (create/update/detail field sets), User Reports (read-only columns),
  Feedback (read-only columns), Notifications (action inputs).
Style-**G** resources (Platforms, Categories, Items, Games write, Filter
Categories) will be **enriched at runtime via OPTIONS**, with the registry as a
fallback if a live OPTIONS call fails.
