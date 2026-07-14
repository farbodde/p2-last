type ApiRouteParam = string | number;

const encodeRouteParam = (value: ApiRouteParam) =>
  encodeURIComponent(String(value));

export const apiRoutes = {
  auth: {
    signup: "/api/v1/auth/signup/",
    login: "/api/v1/auth/login/",
    google: "/api/v1/auth/google/",
    refreshToken: "/api/v1/auth/token/refresh/",
    forgotPassword: "/api/v1/auth/forget-password/",
    changePassword: "/api/v1/auth/change-password/",
    profile: "/api/v1/auth/profile/",
    accountIds: "/api/v1/auth/account-ids/",
    accountIdsCreate: "/api/v1/auth/account-ids/create/",
    accountIdDelete: (accountId: ApiRouteParam) =>
      `/api/v1/auth/account-ids/${encodeRouteParam(accountId)}/delete/`,
    publicProfile: (username: ApiRouteParam) =>
      `/api/v1/auth/users/${encodeRouteParam(username)}/profile/`,
    blockedUsers: "/api/v1/auth/users/blocked/",
  },
  games: {
    list: "/api/v1/game/list/",
    categories: (gameId: ApiRouteParam) =>
      `/api/v1/game/${encodeRouteParam(gameId)}/categories/`,
    modes: (gameId: ApiRouteParam) =>
      `/api/v1/game/${encodeRouteParam(gameId)}/modes/`,
  },
  filters: {
    config: "/api/v1/filter/config/",
  },
  meta: {
    countries: "/api/v1/meta/countries/",
  },
  chats: {
    list: "/api/v1/chats/",
    start: "/api/v1/chats/start/",
    messages: (chatId: ApiRouteParam) =>
      `/api/v1/chats/${encodeRouteParam(chatId)}/messages/`,
  },
  lfg: {
    feed: "/api/v1/lfg/filter/",
    create: "/api/v1/lfg/create/",
    update: "/api/v1/lfg/update/",
    delete: "/api/v1/lfg/delete/",
    mine: "/api/v1/lfg/mine/",
    detail: (lfgId: ApiRouteParam) =>
      `/api/v1/lfg/${encodeRouteParam(lfgId)}/`,
    bump: (lfgId: ApiRouteParam) =>
      `/api/v1/lfg/${encodeRouteParam(lfgId)}/bump/`,
    bookmarksFilter: "/api/v1/lfg/bookmarks/filter/",
    byUser: (userId: ApiRouteParam) =>
      `/api/v1/lfg/user/${encodeRouteParam(userId)}/`,
    bookmark: (lfgId: ApiRouteParam) =>
      `/api/v1/lfg/${encodeRouteParam(lfgId)}/bookmark/`,
    unbookmark: (lfgId: ApiRouteParam) =>
      `/api/v1/lfg/${encodeRouteParam(lfgId)}/unbookmark/`,
  },
  notifications: {
    list: "/api/v1/notify/",
    unreadCount: "/api/v1/notify/unread-count/",
  },
} as const;
