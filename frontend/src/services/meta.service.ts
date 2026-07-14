import type { CountryListResponse } from "@/@types/general.type";
import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";

const parseMetaErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getMetaErrorMessage = (data: unknown, fallbackMessage: string) => {
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

export const getCountries = async (): Promise<CountryListResponse> => {
  const response = await fetch(
    `${apiConfig.baseUrl}${apiRoutes.meta.countries}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseMetaErrorResponse(response);

    return Promise.reject(
      getMetaErrorMessage(
        errorData,
        "Failed to load countries. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as CountryListResponse;

  return Array.isArray(data) ? data : [];
};
