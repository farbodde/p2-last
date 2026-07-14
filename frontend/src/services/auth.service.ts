import { apiConfig } from "@/config/api.config";
import { apiRoutes } from "@/config/api-routes";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/lib/auth";
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  GoogleLoginPayload,
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  SignupPayload,
  SignupResponse,
} from "@/types/auth.types";

let refreshAccessTokenPromise: Promise<string> | null = null;

const parseAuthErrorResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getAuthErrorMessage = (data: any, fallbackMessage: string) => {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  return fallbackMessage;
};

const requestNewAccessToken = async (
  payload: RefreshTokenPayload,
): Promise<RefreshTokenResponse> => {
  const response = await fetch(
    `${apiConfig.baseUrl}${apiRoutes.auth.refreshToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseAuthErrorResponse(response);

    return Promise.reject(
      getAuthErrorMessage(
        errorData,
        "Your session has expired. Please sign in again.",
      ),
    );
  }

  return response.json();
};

export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();
    return Promise.reject("Your session has expired. Please sign in again.");
  }

  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = requestNewAccessToken({
      refresh: refreshToken,
    })
      .then((response) => {
        if (!response.access) {
          clearAuthSession();
          return Promise.reject(
            "Your session has expired. Please sign in again.",
          );
        }

        setAccessToken(response.access);
        return response.access;
      })
      .catch((error) => {
        clearAuthSession();
        return Promise.reject(
          typeof error === "string"
            ? error
            : "Your session has expired. Please sign in again.",
        );
      })
      .finally(() => {
        refreshAccessTokenPromise = null;
      });
  }

  return refreshAccessTokenPromise;
};

export const fetchWithAuth = async (
  input: string,
  init: RequestInit = {},
): Promise<Response> => {
  const executeRequest = async (accessToken: string) =>
    fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

  const currentAccessToken = getAccessToken();

  if (currentAccessToken) {
    const response = await executeRequest(currentAccessToken);

    if (response.status !== 401) {
      return response;
    }
  }

  const nextAccessToken = await refreshAccessToken();
  const response = await executeRequest(nextAccessToken);

  if (response.status === 401) {
    clearAuthSession();
    return Promise.reject("Your session has expired. Please sign in again.");
  }

  return response;
};

export const signup = async (
  payload: SignupPayload,
): Promise<SignupResponse> => {
  const response = await fetch(`${apiConfig.baseUrl}${apiRoutes.auth.signup}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await parseAuthErrorResponse(response);

    if (response.status === 400 && errorData) {
      throw errorData;
    }

    return Promise.reject(
      getAuthErrorMessage(errorData, "Signup failed. Please try again."),
    );
  }

  return response.json();
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch(`${apiConfig.baseUrl}${apiRoutes.auth.login}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await parseAuthErrorResponse(response);

    if (response.status === 400 && errorData) {
      throw errorData;
    }

    return Promise.reject(
      getAuthErrorMessage(errorData, "Login failed. Please try again."),
    );
  }

  return response.json();
};

const getGoogleAuthUrl = () => {
  const endpoint =
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENDPOINT ?? apiRoutes.auth.google;

  return endpoint.startsWith("http")
    ? endpoint
    : `${apiConfig.baseUrl}${endpoint}`;
};

export const googleLogin = async (
  payload: GoogleLoginPayload,
): Promise<LoginResponse> => {
  const response = await fetch(getGoogleAuthUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await parseAuthErrorResponse(response);

    if (response.status === 400 && errorData) {
      throw errorData;
    }

    return Promise.reject(
      getAuthErrorMessage(errorData, "Google login failed. Please try again."),
    );
  }

  return response.json();
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  const response = await fetch(
    `${apiConfig.baseUrl}${apiRoutes.auth.forgotPassword}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseAuthErrorResponse(response);

    if (response.status === 400 && errorData) {
      throw errorData;
    }

    return Promise.reject(
      getAuthErrorMessage(
        errorData,
        "Failed to send recovery email. Please try again.",
      ),
    );
  }

  return response.json();
};

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  const response = await fetchWithAuth(
    `${apiConfig.baseUrl}${apiRoutes.auth.changePassword}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await parseAuthErrorResponse(response);

    if (response.status === 400 && errorData) {
      throw errorData;
    }

    return Promise.reject(
      getAuthErrorMessage(
        errorData,
        "Failed to change password. Please try again.",
      ),
    );
  }

  return response.json();
};
