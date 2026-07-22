// Normalised API error. Every failed request rejects with one of these so the
// UI has a single, predictable shape to render.
export class ApiError extends Error {
  constructor({ status = 0, message = 'Request failed', fieldErrors = null, raw = null, isNetwork = false, isTimeout = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors; // { field: [msgs] } | null
    this.raw = raw;
    this.isNetwork = isNetwork;
    this.isTimeout = isTimeout;
  }

  get isAuth() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isValidation() {
    return this.status === 400 && !!this.fieldErrors;
  }
}

// DRF returns errors in several shapes. Flatten them into {message, fieldErrors}.
export function parseDrfError(status, payload) {
  // Non-JSON / empty
  if (payload == null || typeof payload !== 'object') {
    return { message: humanStatus(status), fieldErrors: null };
  }

  // { detail: "..." }
  if (typeof payload.detail === 'string' && Object.keys(payload).length === 1) {
    return { message: payload.detail, fieldErrors: null };
  }

  // { non_field_errors: [...] } or per-field { email: [...], password: [...] }
  const fieldErrors = {};
  let hasFieldErrors = false;
  const generalMsgs = [];

  for (const [key, val] of Object.entries(payload)) {
    const msgs = Array.isArray(val) ? val.map(String) : [String(val)];
    if (key === 'non_field_errors' || key === 'detail' || key === 'error' || key === 'message') {
      generalMsgs.push(...msgs);
    } else {
      fieldErrors[key] = msgs;
      hasFieldErrors = true;
    }
  }

  const message =
    generalMsgs[0] ||
    (hasFieldErrors ? 'Please correct the highlighted fields.' : humanStatus(status));

  return { message, fieldErrors: hasFieldErrors ? fieldErrors : null };
}

export function humanStatus(status) {
  switch (status) {
    case 400:
      return 'Invalid request.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'Not found.';
    case 500:
      return 'Server error. Please try again.';
    default:
      return status ? `Request failed (${status}).` : 'Network error.';
  }
}
