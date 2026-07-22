# PROJECT_ANALYSIS.md — Player2 Backend Architecture (Phase 0 Discovery)

> Single source of truth for the admin panel. Everything here was derived by
> reading the backend source under `backend/`. Nothing was invented. Points
> that could not be verified by booting the live stack are explicitly flagged
> **(UNVERIFIED — manual test required)**.

## 1. Stack overview

| Concern | Finding | Source |
|---|---|---|
| Framework | Django 4.2.7 (settings docstring says 5.2.9 — mismatch, harmless) | `requirements.txt`, `core/settings.py` |
| API layer | Django REST Framework 3.15.2 | `settings.INSTALLED_APPS`, `REST_FRAMEWORK` |
| Auth | **SimpleJWT (header-based Bearer) + SessionAuthentication** | `core/settings.py` `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES` |
| Default permission | `IsAuthenticated` (global) | `REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES` |
| Schema generator | drf-spectacular 0.27.2 (`/api/schema/`, `/api/swagger/`, `/api/redoc/`) | `core/urls.py` |
| DB | PostgreSQL (`db` service) | `core/settings.py`, `docker-compose.yml` |
| Async | Channels (WebSocket chat) + Celery + Redis + django-celery-beat | `settings`, `chat/`, `notification/tasks.py` |
| Push | Firebase Admin SDK (initialised in `notification.apps.ready()`) | `notification/apps.py` |
| ASGI server | Daphne (`daphne core.asgi:application`) | `docker-compose.yml` |
| Media/Static | `/media/` and `/static/` served by Django in DEBUG | `core/urls.py` |

## 2. URL surface (from `core/urls.py`, followed recursively)

```
/home_ad/                      Django admin (renamed from /admin/)
/api/v1/meta/languages/        AllowAny  -> [{code,name}]
/api/v1/meta/countries/        AllowAny  -> [{code,name}]
/api/v1/auth/     -> auth_app/urls.py
/api/v1/feedback/ -> feed_back/urls.py
/api/v1/notify/   -> notification/urls.py
/api/v1/lfg/      -> posts/urls.py
/api/v1/game/     -> games/urls.py
/api/v1/filter/   -> filter/urls.py
/api/v1/chats/    -> chat/urls.py
/api/schema/  /api/swagger/  /api/redoc/   (drf-spectacular)
```

Full per-resource detail is in **ADMIN_API_MAP.md**.

## 3. Authentication & authorization (critical)

### 3.1 Token issuance / refresh
- **Login:** `POST /api/v1/auth/login/` — `EmailTokenObtainPairSerializer`
  (`auth_app/jwt.py`). Body `{email, password}`. Returns:
  ```json
  { "access": "...", "refresh": "...",
    "user": { "id", "email", "display_name", "username", "role",
              "is_staff", "is_superuser" } }
  ```
  Rejects inactive users with 401 "Account is not active."
- **Refresh:** `POST /api/v1/auth/token/refresh/` (SimpleJWT `TokenRefreshView`)
  — body `{refresh}` → `{access}`.
- **Google OAuth:** `POST /api/v1/auth/google/` (not needed by the panel).
- Lifetimes: **access 15 min, refresh 7 days** (`SIMPLE_JWT`). Header type `Bearer`.
- **Cookie-based auth: NO.** Tokens are returned in the JSON body only; the
  backend never sets an `httpOnly` auth cookie. → the panel is forced into
  header-based token storage. See SCHEMA_STRATEGY.md / ARCHITECTURE.md for the
  storage tradeoff and how we mitigate it. SessionAuthentication also exists
  (so the browsable API works when logged into Django admin), but the panel
  will use JWT.

### 3.2 Two different "admin" gates (do not conflate)
| Gate | Definition | Where |
|---|---|---|
| `IsAdmin` (custom) | user is a member of Django **Group named `"admin"`** | `auth_app/permissions.py` |
| `IsAdminUser` (DRF) | `user.is_staff is True` | used by report endpoints |

- Most admin endpoints (users, games, filter, feedback, notifications, per-user
  LFG) use **`IsAdmin`** → **Group "admin"**.
- The **User Reports** endpoints use **`IsAdminUser`** → **`is_staff`**.
- **Consequence:** to exercise the whole panel, the logged-in account must be
  **both** in Group `"admin"` **and** `is_staff=True`. This is documented as an
  operational requirement, not a code change. The panel will gate its UI on
  `role === "admin"` (from the login payload) and surface a clear message if a
  `403` is returned by the `is_staff`-gated report endpoints.

### 3.3 Roles
Roles are Django Groups. Known role names (from `UserRoleUpdateSerializer`
choices): `player`, `youtuber`, `premium_user`, `admin`. A user's "role" in API
payloads is `user.groups.first().name` (single primary group).

## 4. CORS (dev vs prod)

`core/settings.py`:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "https://yourdomain.com"]
CORS_ALLOW_ALL_ORIGINS = True   # DEV ONLY
```
- **Dev:** `CORS_ALLOW_ALL_ORIGINS = True` already allows
  `http://localhost:3005`. **No backend change needed for local dev.**
- Auth is header-based (no cookies) → `CORS_ALLOW_CREDENTIALS` is **not**
  required.
- **Prod recommendation (for the user, not applied automatically):** turn
  `CORS_ALLOW_ALL_ORIGINS` off and add the panel's real origin to
  `CORS_ALLOWED_ORIGINS`. This is a config note; the panel does not require it.

## 5. Pagination — INCONSISTENT (important design constraint)

There is **no global `DEFAULT_PAGINATION_CLASS`**. Each endpoint paginates
differently, producing **four distinct response envelopes**. The panel's API
client must normalise these per resource (see ADMIN_API_MAP.md → "envelope").

| Envelope | Shape | Used by |
|---|---|---|
| **A – DRF default** | `{count, next, previous, results:[...]}` | games/* , filter/* , feedback list, reports list |
| **B – User list custom** | `{count, num_pages, current_page, has_next, has_previous, results:[...]}` | `auth_app` UserListView |
| **C – "data" custom** | `{data:[...], count, totalPage}` | `auth_app.pagination.CustomPagination` (blocked users — not an admin screen) |
| **D – none** | plain array (ViewSet with no pagination configured) | `filter` FilterCategory ViewSet **(UNVERIFIED — no global page class, so ModelViewSet returns an unpaginated list)** |

Query params: DRF-default endpoints accept `?page=` and `?page_size=`
(`page_size_query_param="page_size"`, `max_page_size` 100 in games/feedback,
20 in posts). UserListView accepts `?page=`, `?page_size=`, `?search=`, `?role=`.

## 6. View styles — determines runtime introspectability

| Style | Endpoints | OPTIONS field metadata? |
|---|---|---|
| `generics.*` (GenericAPIView + `serializer_class`) | **games/\*** , **filter/\*** (ModelViewSet) | **YES** — full field types/required/choices/max_length (empirically verified, see SCHEMA_STRATEGY.md §4) |
| plain `APIView` (manual `get/post/...`) | **auth_app admin users**, **reports**, **feedback**, **notification** | **NO** — OPTIONS returns only name/renders/parses |

This split is the core reason the schema-discovery strategy is a **hybrid**
(registry + OPTIONS enrichment) rather than pure runtime discovery. Details in
SCHEMA_STRATEGY.md.

## 7. drf-spectacular schema — DOES NOT COVER ADMIN ENDPOINTS

`core/schema.py`:
```python
def exclude_admin_endpoints(endpoints):
    return [e for e in endpoints if "/admin/" not in e[0]]
```
Registered as a `PREPROCESSING_HOOKS` entry. **Every URL containing `/admin/`
is stripped from the OpenAPI schema.** That is exactly the set of endpoints the
panel needs (`auth_app/admin/users`, `games/admin/*`, `filter/admin/*`).
→ **The existing OpenAPI schema is not a usable discovery source for the panel.**
(It remains useful only for the handful of non-`/admin/` endpoints like feedback
list and reports list.)

## 8. Custom / non-CRUD actions discovered (feed Phase 3 dedicated UI)

| Action | Endpoint | Method | Gate |
|---|---|---|---|
| Change user role | `/api/v1/auth/admin/users/update-role/` | POST `{username, role}` | IsAdmin |
| Delete user (by username) | `/api/v1/auth/admin/users/<username>/delete/` | DELETE | IsAdmin |
| Delete report | `/api/v1/auth/admin/users/reports/<pk>/delete/` | DELETE | IsAdminUser |
| Bulk delete feedback | `/api/v1/feedback/bulk-delete/` | DELETE `{feedback_ids:[]}` | IsAdmin |
| Register device | `/api/v1/notify/devices/` | POST | IsAdmin |
| Unregister device | `/api/v1/notify/devices/remove/` | DELETE | IsAdmin |
| Test push (stub) | `/api/v1/notify/test/` | POST `{title,body,data}` | IsAdmin |
| List one user's LFGs | `/api/v1/lfg/user/<user_id>/` | GET | IsAdmin |
| Bump LFG | `/api/v1/lfg/<id>/bump/` | POST | IsAuthenticated (owner) — not admin |

## 9. Known backend issues (documented, NOT to be fixed — backend is frozen)

1. **`posts` `UserLFGListAPIView` / `LFGDetailAPIView`** use
   `select_related("platforms")`, but `LFG.platform` is a singular FK. This
   raises `FieldError` at query time → the admin "user's LFGs" endpoint is
   **likely broken**. Flagged; the panel will handle the resulting 500 gracefully.
2. **`LFGListSerializer`** references `owner.language`, `owner.age` — the `User`
   model has neither (`languages` list, `date_of_birth`). These fields will
   error/serialise as null depending on path.
3. **`notification.apps.ready()`** hard-fails if the Firebase credentials file
   is absent → the whole backend won't boot without it. (Explains why the live
   stack could not be booted in this sandbox.)
4. Several serializers use redundant `source="id"` on an `id` field (harmless).

These are recorded for the user's awareness only. The panel will not modify
backend logic.

## 10. Environment / sandbox limitation (transparency)

The live backend could **not** be booted inside this analysis sandbox: Django
was not preinstalled, and the app requires PostgreSQL, Redis, a `FERNET_KEY`,
and a Firebase service-account JSON (loaded at startup) that are not
provisioned here. Therefore:
- All facts above come from **reading source** (authoritative).
- DRF OPTIONS/`SimpleMetadata` behaviour was **empirically verified** with an
  isolated harness that runs the real DRF metadata engine against
  field definitions mirroring the real serializers (see SCHEMA_STRATEGY.md §4).
- Items marked **(UNVERIFIED — manual test required)** should be confirmed by
  running the provided `curl` commands (SCHEMA_STRATEGY.md §6) against a live
  instance before we finalise Phase 1.
