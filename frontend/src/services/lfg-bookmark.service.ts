import type {
  FilterBookmarkedLFGRequest,
  FilterBookmarkedLFGResponse,
  LFGFeedPage,
} from "@/@types/lfg.type";
import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import { fetchWithAuth } from "@/services/auth.service";
import { mapLfgFeedResponseItem } from "@/services/content.service";

export type LfgBookmarkId = string | number;

const parseLfgBookmarkErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getLfgBookmarkErrorMessage = (data: any, fallbackMessage: string) => {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  return fallbackMessage;
};

const createLfgBookmarkRequest = async ({
  lfgId,
  action,
}: {
  lfgId: LfgBookmarkId;
  action: "bookmark" | "unbookmark";
}) => {
  const endpoint =
    action === "bookmark"
      ? apiRoutes.lfg.bookmark(lfgId)
      : apiRoutes.lfg.unbookmark(lfgId);
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${endpoint}`,
    {
      method: action === "bookmark" ? "POST" : "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseLfgBookmarkErrorResponse(response);

    return Promise.reject(
      getLfgBookmarkErrorMessage(
        errorData,
        action === "bookmark"
          ? "Failed to save this LFG. Please try again."
          : "Failed to remove this LFG from saved items. Please try again.",
      ),
    );
  }
};

export const bookmarkLfg = async (lfgId: LfgBookmarkId) =>
  createLfgBookmarkRequest({ lfgId, action: "bookmark" });

export const unbookmarkLfg = async (lfgId: LfgBookmarkId) =>
  createLfgBookmarkRequest({ lfgId, action: "unbookmark" });

export const getBookmarkedLfgs = async ({
  page = 1,
  filters = {},
}: {
  page?: number;
  filters?: FilterBookmarkedLFGRequest;
} = {}): Promise<LFGFeedPage> => {
  const params = new URLSearchParams({
    page: String(page),
  });
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.lfg.bookmarksFilter}?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    },
  );

  if (!response.ok) {
    const errorData = await parseLfgBookmarkErrorResponse(response);

    return Promise.reject(
      getLfgBookmarkErrorMessage(
        errorData,
        "Failed to load saved LFG posts. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as FilterBookmarkedLFGResponse;

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: Array.isArray(data.results)
      ? data.results.map((item) =>
          mapLfgFeedResponseItem({
            ...item,
            is_bookmarked: true,
          }),
        )
      : [],
  };
};
