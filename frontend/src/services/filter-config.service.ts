import type { FilterConfigResponse } from "@/@types/accountID.type";
import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import { fetchWithAuth } from "@/services/auth.service";
import { resolveContentAssetUrl } from "@/services/content.service";

const parseFilterConfigErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getFilterConfigErrorMessage = (
  data: unknown,
  fallbackMessage: string,
) => {
  if (data && typeof data === "object") {
    if (
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim()
    ) {
      return data.message;
    }

    if (
      "detail" in data &&
      typeof data.detail === "string" &&
      data.detail.trim()
    ) {
      return data.detail;
    }
  }

  return fallbackMessage;
};

export const getFilterConfig = async (): Promise<FilterConfigResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.filters.config}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseFilterConfigErrorResponse(response);

    return Promise.reject(
      getFilterConfigErrorMessage(
        errorData,
        "Failed to load platforms. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as FilterConfigResponse;

  return {
    ...data,
    platforms: Array.isArray(data.platforms)
      ? data.platforms.map((platform) => ({
          ...platform,
          logo: resolveContentAssetUrl(platform.logo) ?? "",
        }))
      : [],
  };
};
