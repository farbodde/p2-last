// RESOURCE REGISTRY — the panel's source of truth for what exists and how to
// talk to it. Encodes only what the backend cannot tell us at runtime
// (endpoints, lookup keys, pagination envelopes, permission gate, custom
// actions) plus a FALLBACK field list for style-A (plain APIView) endpoints.
//
// For style-G endpoints (viewStyle: 'generic') the field list here is a
// fallback; the live form is enriched from an authenticated OPTIONS call
// (Phase 2). See SCHEMA_STRATEGY.md.
//
// Field type vocabulary (mirrors DRF OPTIONS 'type'):
//   string | text | email | integer | boolean | choice | date | datetime |
//   list | image | pk | json
import { ENVELOPE } from '../api/envelopes.js';

// Django-app groups shown in the sidebar (ordered).
export const GROUPS = [
  { key: 'auth_app', label: 'Accounts', icon: 'users' },
  { key: 'games', label: 'Games', icon: 'gamepad' },
  { key: 'filter', label: 'Filters', icon: 'filter' },
  { key: 'feed_back', label: 'Feedback', icon: 'message' },
  { key: 'notification', label: 'Notifications', icon: 'bell' },
  { key: 'posts', label: 'LFG / Posts', icon: 'list' },
];

// GATE: which permission the endpoint requires (informational + UI hints).
export const GATE = { ADMIN_GROUP: 'group:admin', STAFF: 'is_staff' };

export const RESOURCES = [
  // ── Accounts ────────────────────────────────────────────────────────────
  {
    key: 'users',
    label: 'Users',
    group: 'auth_app',
    icon: 'users',
    viewStyle: 'apiview', // style-A: no OPTIONS metadata
    gate: GATE.ADMIN_GROUP,
    lookup: 'username', // string lookup, NOT pk
    idField: 'id',
    envelope: ENVELOPE.USER,
    capabilities: { list: true, create: true, retrieve: true, update: true, delete: true },
    endpoints: {
      list: '/api/v1/auth/admin/users/',
      create: '/api/v1/auth/admin/users/create/',
      retrieve: (u) => `/api/v1/auth/admin/users/${encodeURIComponent(u)}/`,
      update: (u) => `/api/v1/auth/admin/users/${encodeURIComponent(u)}/update/`,
      delete: (u) => `/api/v1/auth/admin/users/${encodeURIComponent(u)}/delete/`,
    },
    listParams: { search: true, filters: [{ key: 'role', label: 'Role', choices: ['player', 'youtuber', 'premium_user', 'admin'] }] },
    actions: [
      { key: 'update-role', label: 'Change role', method: 'POST', path: '/api/v1/auth/admin/users/update-role/', body: ['username', 'role'] },
    ],
    columns: ['id', 'email', 'username', 'display_name', 'role', 'is_active', 'is_online'],
    fields: [
      { name: 'email', type: 'email', required: true },
      { name: 'display_name', type: 'string', required: true, max_length: 255 },
      { name: 'username', type: 'string', max_length: 30 },
      { name: 'password', type: 'string', required: true, writeOnly: true, createOnly: true },
      { name: 'profile_image', type: 'image' },
      { name: 'cover_image', type: 'image' },
      { name: 'about_me', type: 'text' },
      { name: 'gender', type: 'choice', choices: ['male', 'female', 'none'] },
      { name: 'date_of_birth', type: 'date' },
      { name: 'location', type: 'string' },
      { name: 'languages', type: 'list' },
      { name: 'is_active', type: 'boolean' },
      { name: 'role', type: 'choice', choices: ['player', 'youtuber', 'premium_user', 'admin'] },
      // read-only display fields
      { name: 'is_staff', type: 'boolean', readOnly: true },
      { name: 'is_superuser', type: 'boolean', readOnly: true },
      { name: 'last_login', type: 'datetime', readOnly: true },
      { name: 'last_activity', type: 'datetime', readOnly: true },
      { name: 'is_online', type: 'boolean', readOnly: true },
    ],
  },
  {
    key: 'reports',
    label: 'User Reports',
    group: 'auth_app',
    icon: 'flag',
    viewStyle: 'apiview',
    gate: GATE.STAFF, // ⚠ is_staff, not Group "admin"
    idField: 'id',
    envelope: ENVELOPE.DRF,
    capabilities: { list: true, create: false, retrieve: false, update: false, delete: true },
    endpoints: {
      list: '/api/v1/auth/admin/users/reports/',
      delete: (id) => `/api/v1/auth/admin/users/reports/${id}/delete/`,
    },
    columns: ['id', 'reporter_username', 'reported_user_username', 'message', 'created_at'],
    fields: [
      { name: 'reporter_username', type: 'string', readOnly: true },
      { name: 'reporter_email', type: 'email', readOnly: true },
      { name: 'reported_user_username', type: 'string', readOnly: true },
      { name: 'reported_user_email', type: 'email', readOnly: true },
      { name: 'message', type: 'text', readOnly: true },
      { name: 'image_urls', type: 'list', readOnly: true },
      { name: 'created_at', type: 'datetime', readOnly: true },
    ],
  },

  // ── Games ───────────────────────────────────────────────────────────────
  {
    key: 'platforms',
    label: 'Platforms',
    group: 'games',
    icon: 'layers',
    viewStyle: 'generic', // style-G: OPTIONS-enriched
    gate: GATE.ADMIN_GROUP,
    idField: 'id',
    envelope: ENVELOPE.DRF,
    capabilities: { list: true, create: true, retrieve: true, update: true, delete: true },
    endpoints: {
      list: '/api/v1/game/admin/platforms/',
      create: '/api/v1/game/admin/platforms/',
      retrieve: (id) => `/api/v1/game/admin/platforms/${id}/`,
      update: (id) => `/api/v1/game/admin/platforms/${id}/`,
      delete: (id) => `/api/v1/game/admin/platforms/${id}/`,
    },
    columns: ['id', 'title', 'logo', 'created_at'],
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'logo', type: 'image' },
    ],
  },
  {
    key: 'categories',
    label: 'Categories',
    group: 'games',
    icon: 'grid',
    viewStyle: 'generic',
    gate: GATE.ADMIN_GROUP,
    idField: 'id',
    envelope: ENVELOPE.DRF,
    capabilities: { list: true, create: true, retrieve: true, update: true, delete: true },
    endpoints: {
      list: '/api/v1/game/admin/categories/',
      create: '/api/v1/game/admin/categories/',
      retrieve: (id) => `/api/v1/game/admin/categories/${id}/`,
      update: (id) => `/api/v1/game/admin/categories/${id}/`,
      delete: (id) => `/api/v1/game/admin/categories/${id}/`,
    },
    columns: ['id', 'title', 'limit', 'created_at'],
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'limit', type: 'string', hint: 'A number, or blank/"unlimited" for no limit.' },
    ],
  },
  {
    key: 'items',
    label: 'Items',
    group: 'games',
    icon: 'grid',
    viewStyle: 'generic',
    gate: GATE.ADMIN_GROUP,
    idField: 'id',
    envelope: ENVELOPE.DRF,
    capabilities: { list: true, create: true, retrieve: true, update: true, delete: true },
    endpoints: {
      list: '/api/v1/game/admin/items/',
      create: '/api/v1/game/admin/items/',
      retrieve: (id) => `/api/v1/game/admin/items/${id}/`,
      update: (id) => `/api/v1/game/admin/items/${id}/`,
      delete: (id) => `/api/v1/game/admin/items/${id}/`,
    },
    listParams: { filters: [{ key: 'category_id', label: 'Category', relation: 'categories' }] },
    columns: ['id', 'title', 'category', 'icon'],
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'icon', type: 'image' },
      { name: 'category_id', type: 'pk', relation: 'categories', required: true, writeOnly: true },
    ],
  },
  {
    key: 'games',
    label: 'Games',
    group: 'games',
    icon: 'gamepad',
    viewStyle: 'generic',
    gate: GATE.ADMIN_GROUP,
    idField: 'id',
    envelope: ENVELOPE.DRF,
    composite: true, // asymmetric read/write serializer — custom form (Phase 2)
    capabilities: { list: true, create: true, retrieve: true, update: true, delete: true },
    endpoints: {
      list: '/api/v1/game/admin/games/',
      create: '/api/v1/game/admin/games/',
      retrieve: (id) => `/api/v1/game/admin/games/${id}/`,
      update: (id) => `/api/v1/game/admin/games/${id}/`,
      delete: (id) => `/api/v1/game/admin/games/${id}/`,
    },
    columns: ['id', 'title', 'cover', 'is_cross_platform', 'created_at'],
    // Write shape (GameCreateUpdateSerializer)
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'cover', type: 'image' },
      { name: 'platform_ids', type: 'list', relation: 'platforms', required: true },
      { name: 'categories', type: 'json', required: true, hint: '[{category, item_limit, items:[]}]' },
    ],
  },

  // ── Filters ───────────────────────────────────────────────────────────────
  {
    key: 'filter-categories',
    label: 'Filter Categories',
    group: 'filter',
    icon: 'filter',
    viewStyle: 'generic', // ModelViewSet
    gate: GATE.ADMIN_GROUP,
    idField: 'id',
    envelope: ENVELOPE.NONE, // no pagination configured
    capabilities: { list: true, create: true, retrieve: true, update: true, delete: true },
    endpoints: {
      list: '/api/v1/filter/admin/filter-categories/',
      create: '/api/v1/filter/admin/filter-categories/',
      retrieve: (id) => `/api/v1/filter/admin/filter-categories/${id}/`,
      update: (id) => `/api/v1/filter/admin/filter-categories/${id}/`,
      delete: (id) => `/api/v1/filter/admin/filter-categories/${id}/`,
    },
    columns: ['id', 'category', 'is_active', 'order'],
    fields: [
      { name: 'category', type: 'pk', relation: 'categories', required: true },
      { name: 'is_active', type: 'boolean' },
      { name: 'order', type: 'integer' },
    ],
  },

  // ── Feedback ──────────────────────────────────────────────────────────────
  {
    key: 'feedback',
    label: 'Feedback',
    group: 'feed_back',
    icon: 'message',
    viewStyle: 'apiview',
    gate: GATE.ADMIN_GROUP,
    idField: 'id',
    envelope: ENVELOPE.DRF,
    capabilities: { list: true, create: false, retrieve: false, update: false, delete: true, bulkDelete: true },
    endpoints: {
      list: '/api/v1/feedback/list/',
      delete: (id) => `/api/v1/feedback/delete/${id}/`,
      bulkDelete: '/api/v1/feedback/bulk-delete/', // DELETE { feedback_ids: [] }
    },
    listParams: { filters: [{ key: 'type', label: 'Type', choices: ['bug', 'complaint', 'suggestion', 'technical'] }] },
    columns: ['id', 'email', 'user', 'type', 'description', 'created_at'],
    fields: [
      { name: 'email', type: 'email', readOnly: true },
      { name: 'user', type: 'string', readOnly: true },
      { name: 'type', type: 'choice', choices: ['bug', 'complaint', 'suggestion', 'technical'], readOnly: true },
      { name: 'description', type: 'text', readOnly: true },
      { name: 'created_at', type: 'datetime', readOnly: true },
    ],
  },

  // ── Notifications (action panel, not CRUD) ────────────────────────────────
  {
    key: 'notifications',
    label: 'Push / Devices',
    group: 'notification',
    icon: 'bell',
    viewStyle: 'actions',
    gate: GATE.ADMIN_GROUP,
    capabilities: { list: false },
    actions: [
      { key: 'register-device', label: 'Register device', method: 'POST', path: '/api/v1/notify/devices/', body: ['fcm_token', 'device_type'] },
      { key: 'unregister-device', label: 'Unregister device', method: 'DELETE', path: '/api/v1/notify/devices/remove/', body: ['fcm_token'] },
      { key: 'test-push', label: 'Send test push', method: 'POST', path: '/api/v1/notify/test/', body: ['title', 'body', 'data'] },
    ],
  },

  // ── LFG (read-only per user) ──────────────────────────────────────────────
  {
    key: 'user-lfg',
    label: 'User LFGs',
    group: 'posts',
    icon: 'list',
    viewStyle: 'lookup', // needs a user_id to view
    gate: GATE.ADMIN_GROUP,
    idField: 'id',
    envelope: ENVELOPE.DRF,
    capabilities: { list: false, retrieve: false },
    note: 'Read-only per user. Backend endpoint may 500 (known select_related bug).',
    endpoints: {
      byUser: (userId) => `/api/v1/lfg/user/${userId}/`,
    },
  },
];

export function getResource(key) {
  return RESOURCES.find((r) => r.key === key) || null;
}

export function resourcesByGroup() {
  const map = new Map();
  GROUPS.forEach((g) => map.set(g.key, { ...g, items: [] }));
  RESOURCES.forEach((r) => {
    if (!map.has(r.group)) map.set(r.group, { key: r.group, label: r.group, items: [] });
    map.get(r.group).items.push(r);
  });
  return [...map.values()].filter((g) => g.items.length);
}
