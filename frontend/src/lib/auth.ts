"use client";

import type { LoginResponse } from "@/types/auth.types";

export const AUTH_STORAGE_KEYS = {
  accessToken: "auth_access_token",
  refreshToken: "auth_refresh_token",
  user: "auth_user",
} as const;

const AUTH_SESSION_CHANGE_EVENT = "auth-session-change";

const emitAuthSessionChange = () => {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
};

export const persistAuthSession = (response: LoginResponse) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, response.access);
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, response.refresh);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(response.user));
  emitAuthSessionChange();
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  emitAuthSessionChange();
};

export const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
};

export const setAccessToken = (accessToken: string) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
  emitAuthSessionChange();
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
};

export const hasAuthSession = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = localStorage.getItem(AUTH_STORAGE_KEYS.user);

  return Boolean(accessToken && refreshToken && user);
};

export const subscribeToAuthSession = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleChange);
  };
};
