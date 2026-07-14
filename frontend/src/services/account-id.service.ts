import type {
  AccountIDListResponse,
  CreateAccountIDPayload,
  CreateAccountIDResponse,
} from "@/@types/accountID.type";
import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import { fetchWithAuth } from "@/services/auth.service";

const parseAccountIdErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getAccountIdErrorMessage = (data: unknown, fallbackMessage: string) => {
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

export const getAccountIds = async (): Promise<AccountIDListResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.auth.accountIds}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseAccountIdErrorResponse(response);

    return Promise.reject(
      getAccountIdErrorMessage(
        errorData,
        "Failed to load Account IDs. Please try again.",
      ),
    );
  }

  const data = (await response.json()) as AccountIDListResponse;

  return Array.isArray(data) ? data : [];
};

export const createAccountId = async (
  payload: CreateAccountIDPayload,
): Promise<CreateAccountIDResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.auth.accountIdsCreate}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseAccountIdErrorResponse(response);

    if (errorData) {
      throw errorData;
    }

    return Promise.reject("Failed to create Account ID. Please try again.");
  }

  return response.json();
};

export const deleteAccountId = async (
  accountId: string | number,
): Promise<void> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.auth.accountIdDelete(accountId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await parseAccountIdErrorResponse(response);

    if (errorData) {
      throw errorData;
    }

    return Promise.reject("Failed to delete Account ID. Please try again.");
  }
};
