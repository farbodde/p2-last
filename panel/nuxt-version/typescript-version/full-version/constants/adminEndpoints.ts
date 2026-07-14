// Single source of truth for admin API paths.
// Paths are RELATIVE to runtimeConfig.public.apiBaseUrl, which must point at
// the backend's /api/v1 root (e.g. http://localhost:8000/api/v1).
// Mirrors ADMIN_API_MAP.md exactly — do not invent paths here.

export const ADMIN_ENDPOINTS = {
  auth: {
    login: 'auth/login/',
    refresh: 'auth/token/refresh/',
    google: 'auth/google/',
    profile: 'auth/profile/',
    changePassword: 'auth/change-password/',
  },

  users: {
    list: 'auth/admin/users/',
    create: 'auth/admin/users/create/',
    updateRole: 'auth/admin/users/update-role/',
    detail: (username: string) => `auth/admin/users/${username}/`,
    update: (username: string) => `auth/admin/users/${username}/update/`,
    remove: (username: string) => `auth/admin/users/${username}/delete/`,
  },

  reports: {
    list: 'auth/admin/users/reports/',
    remove: (id: number) => `auth/admin/users/reports/${id}/delete/`,
  },

  platforms: {
    list: 'game/admin/platforms/',
    detail: (id: number) => `game/admin/platforms/${id}/`,
  },

  categories: {
    list: 'game/admin/categories/',
    detail: (id: number) => `game/admin/categories/${id}/`,
    items: (categoryId: number) => `game/admin/categories/${categoryId}/items/`,
  },

  items: {
    list: 'game/admin/items/',
    detail: (id: number) => `game/admin/items/${id}/`,
  },

  games: {
    list: 'game/admin/games/',
    detail: (id: number) => `game/admin/games/${id}/`,
    modes: (gameId: number) => `game/${gameId}/modes/`,
    gameCategories: (gameId: number) => `game/${gameId}/categories/`,
    publicList: 'game/list/',
  },

  filterCategories: {
    list: 'filter/admin/filter-categories/',
    detail: (id: number) => `filter/admin/filter-categories/${id}/`,
    config: 'filter/config/',
  },

  feedback: {
    list: 'feedback/list/',
    remove: (id: number) => `feedback/delete/${id}/`,
    bulkDelete: 'feedback/bulk-delete/',
  },

  notifications: {
    registerDevice: 'notify/devices/',
    unregisterDevice: 'notify/devices/remove/',
    testPush: 'notify/test/',
  },

  lfg: {
    byUser: (userId: number) => `lfg/user/${userId}/`,
  },

  meta: {
    languages: 'meta/languages/',
    countries: 'meta/countries/',
  },
} as const
