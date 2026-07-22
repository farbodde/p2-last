// Auth flow: login, logout, refresh, session bootstrap.
import { API } from '../config.js';
import { request, setRefreshHandler } from '../api/client.js';
import {
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  setUser,
  getUser,
  clearSession,
  isAuthenticated,
  isAdmin,
} from './session.js';

export { getUser, isAuthenticated, isAdmin };

/** POST /login -> store tokens + user. Returns the user object. */
export async function login(email, password) {
  const data = await request('POST', API.login, {
    body: { email, password },
    auth: false,
  });
  if (!data || !data.access) {
    throw new Error('Login response missing access token.');
  }
  setAccessToken(data.access);
  setRefreshToken(data.refresh || null);
  setUser(data.user || null);
  return data.user || null;
}

/** Clear all session state. */
export function logout() {
  clearSession();
}

/**
 * Exchange the refresh token for a new access token.
 * Returns true on success, false if refresh is impossible/expired (session
 * should then be treated as ended). Registered with the API client so any 401
 * triggers a single-flight refresh + retry.
 */
async function refresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const data = await request('POST', API.refresh, {
      body: { refresh: refreshToken },
      auth: false,
    });
    if (data && data.access) {
      setAccessToken(data.access);
      // SimpleJWT may rotate refresh tokens depending on config; store if present.
      if (data.refresh) setRefreshToken(data.refresh);
      return true;
    }
    return false;
  } catch (e) {
    // Refresh expired/invalid -> end session.
    clearSession();
    return false;
  }
}

setRefreshHandler(refresh);

/**
 * On app boot: if we have a refresh token but no access token, obtain one.
 * Returns true if the session is usable.
 */
export async function bootstrapSession() {
  if (!getRefreshToken()) return false;
  return refresh();
}
