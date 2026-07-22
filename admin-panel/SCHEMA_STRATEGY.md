# SCHEMA_STRATEGY.md — How the panel discovers resources & fields

> **This is the decision the brief asks me to STOP and confirm before Phase 1.**

## 1. The three discovery sources evaluated

| Source | Verdict for this backend |
|---|---|
| **drf-spectacular OpenAPI** (`/api/schema/`) | ❌ **Unusable for admin.** `core/schema.py::exclude_admin_endpoints` strips every `/admin/` URL from the schema. The exact endpoints the panel needs are absent. |
| **DRF `OPTIONS` metadata** | 🟡 **Partial.** Rich field metadata for the **generic** endpoints (games/\*, filter ViewSet). **Nothing** for the **plain `APIView`** endpoints (users, reports, feedback, notifications). Requires an authenticated admin request. |
| **A new backend metadata endpoint** | ⚪ Possible but a backend change; must be strictly additive + read-only + approved first. |

No single source is complete. The response **envelopes** are also inconsistent
(4 shapes, PROJECT_ANALYSIS.md §5) and no metadata source can describe those
without changing the existing views.

## 2. DECISION (recommended) — Hybrid: Frontend Resource Registry + runtime OPTIONS enrichment

The panel ships a small, declarative **resource registry** (one JS module per
resource, or a single manifest) that encodes, per resource:
- endpoint paths + methods + lookup key (pk vs username),
- which **pagination envelope** (A/B/C/D) the list uses,
- the **field list** with types/required/read-only/choices **as a fallback**,
- permission gate (Group "admin" vs is_staff) and any custom actions.

At runtime, for **style-G** resources the client issues an authenticated
`OPTIONS` and **overlays** the live field metadata (types, required, choices,
max_length) on top of the registry defaults — so those forms stay
backend-driven and self-update if the serializers change. For **style-A**
resources (no OPTIONS metadata) the registry field list is authoritative — this
is exactly the "documented fallback when metadata is genuinely unavailable"
the brief anticipates, and every such fallback is listed in ADMIN_API_MAP.md §11.

### Why the registry is unavoidable here (not laziness)
1. The OpenAPI schema **excludes** the admin endpoints by design.
2. Half the endpoints are plain `APIView` → **zero** field introspection.
3. The **4 different pagination envelopes** must be mapped per endpoint no
   matter what; the backend exposes no machine-readable description of them.
4. Lookup keys differ (Users use **username**, others use **pk**).
5. Read vs write serializers differ (Games) — not expressible via one schema.

The registry keeps hardcoding to the **minimum** the backend genuinely can't
tell us, and defers to live OPTIONS wherever the backend *can*.

## 3. Optional additive backend endpoint (flagged for your approval — NOT implemented)

If you want the panel to be **fully** backend-driven (no frontend field
fallbacks), I can add **one** strictly-additive, read-only endpoint. Proposal:

```
GET /api/v1/admin/schema/            # IsAdmin, read-only
-> { "resources": [
       { "key":"users", "verbose_name":"User",
         "app":"auth_app", "list":"/api/v1/auth/admin/users/",
         "lookup":"username", "envelope":"B",
         "fields":[ {name,type,required,read_only,choices,max_length,...} ],
         "actions":[ {name:"update-role", method:"POST", path:"..."} ] },
       ... ] }
```

Guarantees I would hold to:
- **Additive only** — a brand-new URL under a new `admin_meta` module; no
  existing view, serializer, model, permission, or route is touched.
- **Read-only** — GET only; no writes; no side effects.
- **No behaviour change** — it introspects the existing serializers/registry
  and returns JSON; it changes nothing about how current endpoints behave.
- Gated by the same `IsAdmin` (Group "admin").

**Tradeoff:** it removes frontend field-duplication and makes the panel
truly metadata-driven, at the cost of a (small, isolated) backend addition.
Per the brief I will **not** add it unless you approve.

**My recommendation:** start with the **Hybrid (no backend change)** for
Phase 1–2 so we can validate the UX against the real API immediately; if you
then want zero frontend field fallbacks, I add the `/admin/schema/` endpoint in
a dedicated, reviewable commit. This keeps the backend untouched while we build
and de-risks the checkpoint.

## 4. Empirical verification of the OPTIONS mechanism (done)

Because the live stack can't boot here (PROJECT_ANALYSIS.md §10), I ran DRF's
real metadata engine (`rest_framework.metadata.SimpleMetadata`) against
serializers mirroring the real ones. Results (reproducible via
`scratchpad/options_probe.py`):

- **Generic view + serializer_class** → `actions.POST` contains every field with
  `type`, `required`, `read_only`, `label`, `max_length`, and full `choices`
  (e.g. gender → male/female/none; role → player/youtuber/premium_user/admin).
  ✅ Confirms style-G endpoints are richly introspectable.
- **Plain `APIView`** → response has only `name`/`description`/`renders`/
  `parses`; **no `actions`, no fields.** ✅ Confirms style-A endpoints yield
  nothing, so the registry fallback is required for them.

This is the empirical basis for the Hybrid decision.

## 5. Runtime flow the panel will implement

```
login -> store tokens -> load registry
for each resource screen:
   if style == G:  OPTIONS <detail-or-list> -> merge field metadata over registry
   else:           use registry field metadata
   GET list -> normalise via envelope[resource] -> render table
```
OPTIONS results are cached per session. If an OPTIONS call fails (network/403),
the panel silently falls back to the registry and logs a console warning.

## 6. Manual verification commands (run against a LIVE instance before Phase 1 sign-off)

Replace `$TOKEN` with an admin access token and `$BASE` with the API base.

```bash
# 1. Login and capture tokens
curl -s $BASE/api/v1/auth/login/ -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"..."}'

# 2. Style-G OPTIONS should return actions.POST with fields (expect rich metadata)
curl -s -X OPTIONS $BASE/api/v1/game/admin/platforms/ -H "Authorization: Bearer $TOKEN"
curl -s -X OPTIONS $BASE/api/v1/game/admin/games/     -H "Authorization: Bearer $TOKEN"
curl -s -X OPTIONS $BASE/api/v1/filter/admin/filter-categories/ -H "Authorization: Bearer $TOKEN"

# 3. Style-A OPTIONS should return NO field metadata (expect name/renders/parses only)
curl -s -X OPTIONS $BASE/api/v1/auth/admin/users/ -H "Authorization: Bearer $TOKEN"
curl -s -X OPTIONS $BASE/api/v1/feedback/list/     -H "Authorization: Bearer $TOKEN"

# 4. Confirm the 4 pagination envelopes
curl -s $BASE/api/v1/auth/admin/users/?page=1      -H "Authorization: Bearer $TOKEN"  # envelope B
curl -s $BASE/api/v1/game/admin/platforms/?page=1  -H "Authorization: Bearer $TOKEN"  # envelope A
curl -s $BASE/api/v1/feedback/list/?page=1         -H "Authorization: Bearer $TOKEN"  # envelope A
curl -s $BASE/api/v1/filter/admin/filter-categories/ -H "Authorization: Bearer $TOKEN" # envelope D?

# 5. Confirm the admin schema really excludes /admin/ (expect no /admin/ paths)
curl -s $BASE/api/schema/ | grep -c "/admin/"   # expect 0
```

## 7. Open decisions for you (blocking Phase 1)

1. **Backend schema endpoint:** Hybrid-only (no backend change) ✅ recommended,
   **or** approve the additive read-only `/api/v1/admin/schema/`?
2. **Parity scope:** ship the panel for the resources that already have admin
   endpoints (✅/🟡 in ADMIN_API_MAP.md §10), **or** do you want full
   Django-admin parity — which would require new write endpoints the brief
   currently forbids (separate approval)?
3. **RTL / Persian:** the product is Persian (player2.ir) and the codebase has
   Persian comments. Should the *admin panel* be LTR-English, or RTL/Persian, or
   bilingual? (I will not assume — default plan is LTR-English, structured so
   RTL can be switched on later.)
4. **is_staff vs Group "admin":** confirm the admin account you'll test with is
   **both** `is_staff=True` **and** in Group `"admin"`, so the report endpoints
   (is_staff-gated) and everything else (Group-gated) both work.
