export const queryKeyNames = {
  profile: "profile",
  accountIds: "account-ids",
  publicProfile: "public-profile",
  notifications: "notifications",
  unreadCount: "unread-count",
  chats: "chats",
  chatMessages: "chat-messages",
  homeFeed: "home-feed",
  bookmarksFeed: "bookmarks-feed",
  profileLfgs: "profile-lfgs",
  games: "games",
  gameCategories: "game-categories",
  gameModes: "game-modes",
  filterConfig: "filter-config",
  countries: "countries",
  lfgDetails: "lfg-details",
  blockedUsers: "blocked-users",
} as const;

export const queryKeys = {
  profile: [queryKeyNames.profile] as const,
  accountIds: [queryKeyNames.accountIds] as const,
  publicProfile: (username: string) =>
    [queryKeyNames.publicProfile, username] as const,
  notifications: [queryKeyNames.notifications] as const,
  unreadNotificationsCount: [
    queryKeyNames.notifications,
    queryKeyNames.unreadCount,
  ] as const,
  chats: [queryKeyNames.chats] as const,
  chatMessages: (chatId: string | number) =>
    [queryKeyNames.chatMessages, String(chatId)] as const,
  homeFeeds: [queryKeyNames.homeFeed] as const,
  homeFeed: (filters: object) =>
    [queryKeyNames.homeFeed, filters] as const,
  bookmarksFeeds: [queryKeyNames.bookmarksFeed] as const,
  bookmarksFeed: (filters: object) =>
    [queryKeyNames.bookmarksFeed, filters] as const,
  profileLfgLists: [queryKeyNames.profileLfgs] as const,
  profileLfgs: (username?: string) =>
    [queryKeyNames.profileLfgs, username ?? "mine"] as const,
  games: [queryKeyNames.games] as const,
  gameCategories: (gameId: string) =>
    [queryKeyNames.gameCategories, gameId] as const,
  gameModes: (gameId: string) =>
    [queryKeyNames.gameModes, gameId] as const,
  filterConfig: [queryKeyNames.filterConfig] as const,
  countries: [queryKeyNames.countries] as const,
  lfgDetails: [queryKeyNames.lfgDetails] as const,
  lfgDetail: (lfgId: string | number) =>
    [queryKeyNames.lfgDetails, String(lfgId)] as const,
  blockedUsers: (page: number) =>
    [queryKeyNames.blockedUsers, page] as const,
} as const;
