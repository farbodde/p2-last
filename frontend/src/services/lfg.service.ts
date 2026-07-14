import type {
  BumpLFGResponse,
  CreateLFGPayload,
  CreateLFGResponse,
  DeleteLFGResponse,
  LFGDetailResponse,
  LFGDetailViewData,
  LFGFeedPage,
  LFGFeedResponse,
  UpdateLFGRequest,
  UpdateLFGResponse,
} from "@/@types/lfg.type";
import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import { fetchWithAuth } from "@/services/auth.service";
import {
  mapLfgFeedResponseItem,
  resolveContentAssetUrl,
} from "@/services/content.service";

const parseLfgErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getLfgErrorMessage = (data: any, fallbackMessage: string) => {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  return fallbackMessage;
};

const createLfgFormData = (payload: CreateLFGPayload | UpdateLFGRequest) => {
  const formData = new FormData();

  formData.append("game", String(payload.game));
  formData.append("platform", String(payload.platform));
  formData.append("allow_cross_play", String(payload.allow_cross_play));
  formData.append("mic_enabled", String(payload.mic_enabled));
  formData.append("description", payload.description);

  if (payload.game_mode !== undefined && payload.game_mode !== null) {
    formData.append("game_mode", String(payload.game_mode));
  }

  payload.selected_items.forEach((itemId) => {
    formData.append("selected_items", String(itemId));
  });

  payload.stat_images?.slice(0, 3).forEach((file) => {
    formData.append("stat_images", file);
  });

  return formData;
};

const mapLfgDetailResponse = (
  detail: LFGDetailResponse,
): LFGDetailViewData => ({
  id: detail.id,
  gameId: detail.game ?? null,
  platformId: detail.platform ?? null,
  gameModeId: detail.game_mode ?? null,
  ownerUsername: detail.owner_username,
  gameTitle: detail.game_title,
  platformTitle: detail.platform_title,
  allowCrossPlay: detail.allow_cross_play,
  micEnabled: detail.mic_enabled,
  gameModeTitle: detail.game_mode_title,
  description: detail.description,
  statImages: detail.stat_images
    .map((image) => resolveContentAssetUrl(image))
    .filter((image): image is string => Boolean(image)),
  selectedItems: detail.selected_items,
  createdAt: detail.created_at,
  canBump: detail.can_bump,
  remainingBumpMinutes: detail.remaining_bump_minutes,
});

export const getLfgDetail = async (
  lfgId: string | number,
): Promise<LFGDetailViewData | null> => {
  const response = await fetch(
    `${apiConfig.baseUrl}${apiRoutes.lfg.detail(lfgId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await parseLfgErrorResponse(response);

    return Promise.reject(
      getLfgErrorMessage(
        errorData,
        "Failed to load this LFG post. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as LFGDetailResponse;

  return mapLfgDetailResponse(data);
};

export const createLfg = async (
  payload: CreateLFGPayload,
): Promise<CreateLFGResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.lfg.create}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: createLfgFormData(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseLfgErrorResponse(response);

    if (errorData) {
      throw errorData;
    }

    return Promise.reject("Failed to create LFG. Please try again.");
  }

  return response.json();
};

export const updateLfg = async (
  payload: UpdateLFGRequest,
): Promise<UpdateLFGResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.lfg.update}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
      body: createLfgFormData(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseLfgErrorResponse(response);

    if (errorData) {
      throw errorData;
    }

    return Promise.reject("Failed to update LFG. Please try again.");
  }

  return response.json();
};

export const bumpLfg = async (
  lfgId: string | number,
): Promise<BumpLFGResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.lfg.bump(lfgId)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseLfgErrorResponse(response);

    if (errorData) {
      throw errorData;
    }

    return Promise.reject("Failed to bump LFG. Please try again.");
  }

  return response.json();
};

export const deleteLfg = async (): Promise<DeleteLFGResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.lfg.delete}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseLfgErrorResponse(response);

    if (errorData) {
      throw errorData;
    }

    return Promise.reject("Failed to delete LFG. Please try again.");
  }

  if (response.status === 204) {
    return { detail: "LFG deleted" };
  }

  return response.json();
};

const requestProfileLfgs = async ({
  endpoint,
  authenticated,
  page = 1,
  pageSize = 10,
}: {
  endpoint: string;
  authenticated: boolean;
  page?: number;
  pageSize?: number;
}): Promise<LFGFeedPage> => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const url = `${apiConfig.baseUrl}${endpoint}?${params.toString()}`;
  const response = authenticated
    ? await fetchWithAuth(url, {
        headers: {
          Accept: "application/json",
        },
      })
    : await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

  if (!response.ok) {
    const errorData = await parseLfgErrorResponse(response);

    return Promise.reject(
      getLfgErrorMessage(
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

export const getMyProfileLfgs = ({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
} = {}) =>
  requestProfileLfgs({
    endpoint: apiRoutes.lfg.mine,
    authenticated: true,
    page,
    pageSize,
  });

export const getUserProfileLfgs = ({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: number;
  page?: number;
  pageSize?: number;
}) =>
  requestProfileLfgs({
    endpoint: apiRoutes.lfg.byUser(userId),
    authenticated: false,
    page,
    pageSize,
  });
