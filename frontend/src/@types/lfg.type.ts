import { GenderEnum, OnlineStatusEnum } from "./general.type";

export type LFGFormData = {
  gameId: number;
  platformId: number;
  allowCrossPlay: boolean;
  mic: boolean;
  skill: string;
  description: string;
};

export type CreateLFGPayload = {
  game: number;
  platform: number;
  allow_cross_play: boolean;
  mic_enabled: boolean;
  game_mode?: number | null;
  description: string;
  selected_items: number[];
  stat_images?: File[];
};

export type CreateLFGResponse = {
  detail: string;
  id: number;
};

export type UpdateLFGRequest = {
  game: number;
  platform: number;
  allow_cross_play: boolean;
  mic_enabled: boolean;
  game_mode: number | null;
  description: string;
  selected_items: number[];
  stat_images?: File[];
};

export type UpdateLFGResponse = {
  detail: string;
};

export type BumpLFGResponse = {
  detail: "LFG bumped successfully";
  bumped_at: string;
};

export type BumpLFGTooSoonResponse = {
  detail: "Too soon to bump again";
  remaining_minutes: number;
};

export type DeleteLFGResponse = {
  detail: "LFG deleted";
};

export type LFGSelectedItem = {
  id: number;
  title: string;
  category: string;
};

export type LFGDetailResponse = {
  id: number;
  game?: number;
  platform?: number;
  game_mode?: number | null;
  owner_username: string;
  game_title: string;
  platform_title: string;
  allow_cross_play: boolean;
  mic_enabled: boolean;
  game_mode_title: string | null;
  description: string;
  stat_images: string[];
  selected_items: LFGSelectedItem[];
  created_at: string;
  can_bump: boolean;
  remaining_bump_minutes: number;
};

export type LFGDetailViewData = {
  id: number;
  gameId: number | null;
  platformId: number | null;
  gameModeId: number | null;
  ownerUsername: string;
  gameTitle: string;
  platformTitle: string;
  allowCrossPlay: boolean;
  micEnabled: boolean;
  gameModeTitle: string | null;
  description: string;
  statImages: string[];
  selectedItems: LFGSelectedItem[];
  createdAt: string;
  canBump: boolean;
  remainingBumpMinutes: number;
};

export type LFGItemType = {
  id: string | number;
  isBookmarked?: boolean;
  description: string;
  game: {
    id: number;
    name: string;
    imageUrl: string;
  };
  user: {
    id?: number;
    imageUrl: string;
    username: string;
    language: string;
    country: string;
    gender: GenderEnum;
    age: number;
    status: OnlineStatusEnum;
  };
  options: {
    [key: string]: string | number | boolean | undefined;
    mic?: boolean;
    platform?: string;
    mode?: string;
    goal?: string;
    skill?: string;
    rank?: number;
    region?: string;
    crossPlay?: boolean;
  };
  date: string;
};

export type LFGFeedResponseItem = {
  id: number;
  is_bookmarked?: boolean;
  isBookmarked?: boolean;
  owner_username: string;
  owner_language: string | null;
  owner_country: string | null;
  owner_age: number | string | null;
  owner_gender: GenderEnum | string;
  owner_image: string | null;
  game_title: string;
  platform_title: string;
  mic: boolean;
  allow_cross_play: boolean;
  has_stat_images: boolean | string;
  categories: string[] | string;
  created_ago: string;
};

export type LFGFeedResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: LFGFeedResponseItem[];
};

export type FilterBookmarkedLFGRequest = {
  game?: number;
  platforms?: number[];
  mic_enabled?: boolean;
  online_only?: boolean;
  cross_play?: boolean;
  has_stat_images?: boolean;
  categories?: number[];
  country?: string;
  languages?: string[];
  age_min?: number;
  age_max?: number;
};

export type BookmarkedLFGListItem = {
  id: number;
  owner_username: string;
  owner_language: string | null;
  owner_country: string;
  owner_age: number | null;
  owner_gender: string;
  owner_image: string | null;
  game_title: string;
  platform_title: string;
  mic: boolean;
  allow_cross_play: boolean;
  has_stat_images: boolean;
  categories: string[];
  created_ago: string;
};

export type FilterBookmarkedLFGResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: BookmarkedLFGListItem[];
};

export type LFGFeedFilters = {
  game?: string;
  platforms?: number[];
  mic_enabled?: boolean;
  online_only?: boolean;
  cross_play?: boolean;
  has_stat_images?: boolean;
  categories?: number[];
  country?: string;
  languages?: string[];
  age_min?: number;
  age_max?: number;
};

export type LFGFeedPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: LFGItemType[];
};
