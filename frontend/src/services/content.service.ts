import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import type {
  GameCategoriesResponse,
  GameModesResponse,
  GameResponse,
  GamesResponse,
  GameViewData,
} from "@/@types/game.type";
import type {
  LFGFeedFilters,
  LFGFeedPage,
  LFGFeedResponse,
  LFGFeedResponseItem,
  LFGItemType,
} from "@/@types/lfg.type";
import { GenderEnum, OnlineStatusEnum } from "@/@types/general.type";
import { GamerItemsMock, LFGItemsMock } from "@/mocks/home.mock";
import { fetchWithAuth } from "@/services/auth.service";

export type LFGFeedSearchParams = Record<string, string | string[] | undefined>;

const parseContentErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getContentErrorMessage = (data: any, fallbackMessage: string) => {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  return fallbackMessage;
};

export const resolveContentAssetUrl = (path: string | null) => {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${apiConfig.baseUrl}${path}`;
};

const mapGameResponse = (game: GameResponse): GameViewData => ({
  id: game.id,
  key: String(game.id),
  title: game.title,
  imageUrl: resolveContentAssetUrl(game.cover),
  platformId: game.platforms[0]?.id ?? null,
  platformTitle: game.platforms[0]?.title ?? null,
  platforms: game.platforms.map((platform) => ({
    id: platform.id,
    title: platform.title,
    logoUrl: resolveContentAssetUrl(platform.logo),
  })),
  isCrossPlatform: game.is_cross_platform,
  categoryTitles: game.categories.map((category) => category.category_title),
  createdAt: game.created_at,
});

const normalizeGender = (gender: LFGFeedResponseItem["owner_gender"]) => {
  if (gender === GenderEnum.FEMALE) {
    return GenderEnum.FEMALE;
  }

  if (gender === GenderEnum.PREFER_NOT_SAY) {
    return GenderEnum.PREFER_NOT_SAY;
  }

  return GenderEnum.MALE;
};

export const mapLfgFeedResponseItem = (
  item: LFGFeedResponseItem,
): LFGItemType => {
  const categoryItems = Array.isArray(item.categories)
    ? item.categories
    : item.categories
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean);
  const categories = categoryItems.reduce<Record<string, string>>(
    (options, category, index) => ({
      ...options,
      [index === 0 ? "category" : `category ${index + 1}`]: category,
    }),
    {},
  );
  const ownerAge = Number(item.owner_age);
  const hasStatImages =
    typeof item.has_stat_images === "boolean"
      ? item.has_stat_images
      : ["true", "1", "yes"].includes(item.has_stat_images.toLowerCase());

  return {
    id: item.id,
    isBookmarked: Boolean(item.is_bookmarked ?? item.isBookmarked),
    description: `Looking for players for ${item.game_title}.`,
    game: {
      id: 0,
      name: item.game_title,
      imageUrl: "/images/games/valorant.png",
    },
    user: {
      imageUrl: resolveContentAssetUrl(item.owner_image) ?? "/images/logo.png",
      username: item.owner_username,
      language: item.owner_language ?? "Unknown",
      country: item.owner_country ?? "",
      gender: normalizeGender(item.owner_gender),
      age: Number.isFinite(ownerAge) ? ownerAge : 0,
      status: OnlineStatusEnum.ONLINE,
    },
    options: {
      mic: item.mic,
      platform: item.platform_title,
      crossPlay: item.allow_cross_play,
      statImages: hasStatImages ? "Yes" : "No",
      ...categories,
    },
    date: item.created_ago,
  };
};

const toStringArray = (value: string | string[] | undefined) => {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
};

const toNumberArray = (value: string | string[] | undefined) =>
  toStringArray(value)
    .map(Number)
    .filter((value) => Number.isFinite(value));

const toNumber = (value: string | string[] | undefined) => {
  const [firstValue] = toStringArray(value);
  const numberValue = Number(firstValue);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const toString = (value: string | string[] | undefined) => {
  const [firstValue] = toStringArray(value);

  return firstValue;
};

export const mapLfgFeedSearchParamsToFilters = (
  searchParams: LFGFeedSearchParams = {},
): LFGFeedFilters => {
  const quickSelections = toStringArray(searchParams.quickSelections);
  const platforms = toNumberArray(
    searchParams.platforms ?? searchParams.consoles ?? searchParams.platform,
  );
  const languages = toStringArray(
    searchParams.languages ?? searchParams.language,
  );
  const categoryKeys = Object.keys(searchParams).filter(
    (key) =>
      ![
        "game",
        "platforms",
        "consoles",
        "platform",
        "quickSelections",
        "country",
        "languages",
        "language",
        "age_min",
        "ageMin",
        "age_max",
        "ageMax",
        "page",
      ].includes(key),
  );
  const categories = categoryKeys.flatMap((key) =>
    toNumberArray(searchParams[key]),
  );
  const filters: LFGFeedFilters = {};
  const game = toString(searchParams.game);
  const ageMin = toNumber(searchParams.age_min ?? searchParams.ageMin);
  const ageMax = toNumber(searchParams.age_max ?? searchParams.ageMax);
  const [country] = toStringArray(searchParams.country);

  if (game) filters.game = game;
  if (platforms.length) filters.platforms = platforms;
  if (quickSelections.includes("mic-on")) filters.mic_enabled = true;
  if (quickSelections.includes("online-only")) filters.online_only = true;
  if (quickSelections.includes("cross-play")) filters.cross_play = true;
  if (quickSelections.includes("stats-image")) filters.has_stat_images = true;
  if (categories.length) filters.categories = categories;
  if (country) filters.country = country;
  if (languages.length) filters.languages = languages;
  if (ageMin !== undefined) filters.age_min = ageMin;
  if (ageMax !== undefined) filters.age_max = ageMax;

  return filters;
};

export const getGames = async ({
  page = 1,
  pageSize = 1000,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<GameViewData[]> => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  const response = await fetch(
    `${apiConfig.baseUrl}${apiRoutes.games.list}?${params}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseContentErrorResponse(response);

    return Promise.reject(
      getContentErrorMessage(
        errorData,
        "Failed to load games. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as GamesResponse | GameResponse[];
  const games = Array.isArray(data) ? data : data.results;

  return Array.isArray(games) ? games.map(mapGameResponse) : [];
};

const getGameEndpointResponse = async <T>(endpoint: string): Promise<T> => {
  const response = await fetchWithAuth(`${apiConfig.baseUrl}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await parseContentErrorResponse(response);

    return Promise.reject(
      getContentErrorMessage(
        errorData,
        "Failed to load game filter options. Please try again.",
      ),
    );
  }

  return (await response.json()) as T;
};

export const getGameCategories = async (gameId: string) => {
  const data = await getGameEndpointResponse<GameCategoriesResponse>(
    apiRoutes.games.categories(gameId),
  );

  return {
    ...data,
    results: data.results.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        icon: resolveContentAssetUrl(item.icon) ?? "",
      })),
    })),
  };
};

export const getGameModes = async (gameId: string) =>
  getGameEndpointResponse<GameModesResponse>(apiRoutes.games.modes(gameId));

export const getHomeFeed = async ({
  page = 1,
  filters,
  searchParams,
}: {
  page?: number;
  filters?: LFGFeedFilters;
  searchParams?: LFGFeedSearchParams;
} = {}): Promise<LFGFeedPage> => {
  const params = new URLSearchParams({
    page: String(page),
  });
  const requestFilters =
    filters ?? mapLfgFeedSearchParamsToFilters(searchParams);

  const response = await fetch(
    `${apiConfig.baseUrl}${apiRoutes.lfg.feed}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestFilters),
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseContentErrorResponse(response);

    return Promise.reject(
      getContentErrorMessage(
        errorData,
        "Failed to load LFG posts. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as LFGFeedResponse;

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: Array.isArray(data.results)
      ? data.results.map(mapLfgFeedResponseItem)
      : [],
  };
};

export const getGamerById = async (id: number) =>
  GamerItemsMock.find((item) => item.id === id);

export const getGamerUsernames = async () =>
  GamerItemsMock.map((item) => item.username);

export const getLfgIds = async () => LFGItemsMock.map((item) => item.id);
