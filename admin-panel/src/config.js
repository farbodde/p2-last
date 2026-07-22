// Centralised, typed access to runtime config + app-wide constants.
const ENV = (typeof window !== 'undefined' && window.__ENV__) || {};

export const API_BASE = String(ENV.API_BASE || 'http://localhost:8001').replace(/\/+$/, '');
export const APP_NAME = ENV.APP_NAME || 'Player2 Admin';

// API path prefixes (from Phase 0 discovery).
export const API = {
  login: '/api/v1/auth/login/',
  refresh: '/api/v1/auth/token/refresh/',
  profile: '/api/v1/auth/profile/',
};

// Token storage keys.
export const STORAGE = {
  refresh: 'p2admin.refresh',
  user: 'p2admin.user',
  theme: 'p2admin.theme',
};

// Network defaults.
export const REQUEST_TIMEOUT_MS = 30000;
export const RETRY_MAX = 2; // network-error retries (not applied to 4xx/5xx)
