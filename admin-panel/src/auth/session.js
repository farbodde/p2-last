// Session state (no network here — see auth.js).
//
// Token-storage strategy (rationale in ARCHITECTURE.md):
//   The backend issues JWTs in the response body only; it never sets an
//   httpOnly auth cookie. So an httpOnly-cookie design is not available without
//   a backend change. Given that constraint we minimise XSS blast radius by
//   keeping the short-lived ACCESS token in memory only (never persisted) and
//   persisting only the longer-lived REFRESH token so sessions survive reloads.
import { STORAGE } from '../config.js';

let accessToken = null; // memory only
let currentUser = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(STORAGE.refresh);
  } catch (e) {
    return null;
  }
}

export function setRefreshToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE.refresh, token);
    else localStorage.removeItem(STORAGE.refresh);
  } catch (e) {}
}

export function getUser() {
  if (currentUser) return currentUser;
  try {
    const raw = localStorage.getItem(STORAGE.user);
    currentUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    currentUser = null;
  }
  return currentUser;
}

export function setUser(user) {
  currentUser = user || null;
  try {
    if (user) localStorage.setItem(STORAGE.user, JSON.stringify(user));
    else localStorage.removeItem(STORAGE.user);
  } catch (e) {}
}

export function clearSession() {
  accessToken = null;
  currentUser = null;
  setRefreshToken(null);
  setUser(null);
}

export function isAuthenticated() {
  // We consider the session "resumable" if we have a refresh token; the access
  // token is obtained/renewed on demand.
  return !!(accessToken || getRefreshToken());
}

export function isAdmin() {
  const u = getUser();
  return !!u && (u.role === 'admin' || u.is_superuser === true);
}
