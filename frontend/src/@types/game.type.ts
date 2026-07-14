import { JSX } from "react";

export type GameFilterItemType = {
  id: string | number;
  title: string;
  key: string;
  imageUrl: string | null;
};

export interface GameCategoryItem {
  id: number;
  title: string;
  icon: string;
}

export interface GameCategory {
  category_id: number;
  category_title: string;
  limit: number;
  items: GameCategoryItem[];
}

export interface GameCategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GameCategory[];
}

export interface GameMode {
  id: number;
  title: string;
}

export interface GameModesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GameMode[];
}

export type GameListPlatformResponse = {
  id: number;
  title: string;
  logo: string | null;
  created_at: string;
  updated_at: string;
};

export type GameListCategoryResponse = {
  id: number;
  category: number;
  category_title: string;
  item_limit: number;
  items: string;
};

export type GameResponse = {
  id: number;
  title: string;
  cover: string | null;
  platforms: GameListPlatformResponse[];
  is_cross_platform: boolean;
  categories: GameListCategoryResponse[];
  created_at: string;
};

export type GamesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: GameResponse[];
};

export type GameViewData = {
  id: number;
  key: string;
  title: string;
  imageUrl: string | null;
  platformId: number | null;
  platformTitle: string | null;
  platforms: GamePlatformViewData[];
  isCrossPlatform: boolean;
  categoryTitles: string[];
  createdAt: string;
};

export type GamePlatformViewData = {
  id: number;
  title: string;
  logoUrl: string | null;
};

export type GamePlatformItemType = {
  title: string;
  key: string;
  icon: JSX.ElementType;
};
