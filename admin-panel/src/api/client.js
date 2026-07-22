// Reusable API client: verbs, query building, uploads/downloads, timeout,
// network-retry, Bearer injection, single-flight refresh-on-401, and centralised
// error normalisation. Envelope normalisation lives in envelopes.js and is
// applied by callers that know their resource's envelope.
import { API_BASE, REQUEST_TIMEOUT_MS, RETRY_MAX } from '../config.js';
import { getAccessToken } from '../auth/session.js';
import { ApiError, parseDrfError } from './errors.js';

// auth.js registers its refresh implementation here to avoid a circular import.
let refreshHandler = null;
export function setRefreshHandler(fn) {
  refreshHandler = fn;
}

// Single-flight refresh: concurrent 401s share one refresh call.
let refreshInFlight = null;
function refreshOnce() {
  if (!refreshHandler) return Promise.resolve(false);
  if (!refreshInFlight) {
    refreshInFlight = Promise.resolve()
      .then(() => refreshHandler())
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function buildUrl(path, query) {
  const url = new URL(path.startsWith('http') ? path : API_BASE + path);
  if (query && typeof query === 'object') {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item));
      else url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function readBody(res) {
  const ctype = res.headers.get('content-type') || '';
  if (ctype.includes('application/json')) {
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }
  if (ctype.includes('text/')) {
    try {
      return await res.text();
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Core request.
 * @param {string} method
 * @param {string} path
 * @param {object} opts
 *   query, body, form (FormData|plain object -> multipart), headers,
 *   auth (default true), signal, timeout, retry, responseType ('json'|'blob'),
 *   _isRetry (internal)
 */
export async function request(method, path, opts = {}) {
  const {
    query,
    body,
    form,
    headers = {},
    auth = true,
    signal,
    timeout = REQUEST_TIMEOUT_MS,
    retry = RETRY_MAX,
    responseType = 'json',
    _retriedRefresh = false,
    _netAttempt = 0,
  } = opts;

  const url = buildUrl(path, query);
  const finalHeaders = { Accept: 'application/json', ...headers };
  const init = { method, headers: finalHeaders };

  // Body handling
  if (form !== undefined) {
    init.body = form instanceof FormData ? form : toFormData(form);
    // Let the browser set the multipart boundary — do NOT set Content-Type.
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    finalHeaders['Content-Type'] = 'application/json';
  }

  // Auth
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Timeout via AbortController, chained to any caller-provided signal.
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeout);
  init.signal = controller.signal;

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
    // Distinguish timeout/caller-abort from a transient network failure.
    const timedOut = controller.signal.aborted && !(signal && signal.aborted);
    if (signal && signal.aborted) {
      throw new ApiError({ status: 0, message: 'Request cancelled', isNetwork: true });
    }
    if (!timedOut && _netAttempt < retry) {
      await backoff(_netAttempt);
      return request(method, path, { ...opts, _netAttempt: _netAttempt + 1 });
    }
    throw new ApiError({
      status: 0,
      message: timedOut ? 'Request timed out.' : 'Network error. Check your connection.',
      isNetwork: !timedOut,
      isTimeout: timedOut,
    });
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }

  // 401 -> try one refresh, then retry the original request once.
  if (res.status === 401 && auth && !_retriedRefresh && refreshHandler) {
    const ok = await refreshOnce();
    if (ok) {
      return request(method, path, { ...opts, _retriedRefresh: true });
    }
  }

  if (!res.ok) {
    const payload = await readBody(res);
    const { message, fieldErrors } = parseDrfError(res.status, payload);
    throw new ApiError({ status: res.status, message, fieldErrors, raw: payload });
  }

  // Success
  if (res.status === 204) return null;
  if (responseType === 'blob') {
    return { blob: await res.blob(), filename: filenameFromDisposition(res) };
  }
  return readBody(res);
}

function toFormData(obj) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null) continue;
    if (v instanceof File || v instanceof Blob) fd.append(k, v);
    else if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
    else if (typeof v === 'object') fd.append(k, JSON.stringify(v));
    else fd.append(k, v);
  }
  return fd;
}

function filenameFromDisposition(res) {
  const cd = res.headers.get('content-disposition') || '';
  const m = /filename\*?=(?:UTF-8'')?"?([^;"]+)"?/i.exec(cd);
  return m ? decodeURIComponent(m[1]) : null;
}

function backoff(attempt) {
  const ms = Math.min(2000, 300 * 2 ** attempt);
  return new Promise((r) => setTimeout(r, ms));
}

// Convenience verbs
export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, opts) => request('POST', path, opts),
  put: (path, opts) => request('PUT', path, opts),
  patch: (path, opts) => request('PATCH', path, opts),
  del: (path, opts) => request('DELETE', path, opts),
  options: (path, opts) => request('OPTIONS', path, opts),
  // Download a file (blob). Triggers a browser save.
  async download(path, opts = {}) {
    const { blob, filename } = await request('GET', path, { ...opts, responseType: 'blob' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = opts.filename || filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  },
};
