// Helpers shared by every admin service.
// Auto-imported by Nuxt (root `utils/`).

import type { CustomPage, DrfPage, Paginated } from '@/types/admin/common'

/**
 * Normalize the two backend pagination shapes into `Paginated<T>`.
 * - DRF PageNumberPagination: { count, next, previous, results }
 * - Custom (UserListView): { count, num_pages, current_page, has_next, has_previous, results }
 */
export function normalizePaginated<T>(
  raw: DrfPage<T> | CustomPage<T>,
  requestedPage = 1,
  pageSize = 10,
): Paginated<T> {
  if (raw && 'num_pages' in raw) {
    const p = raw as CustomPage<T>

    return {
      count: p.count,
      results: p.results ?? [],
      page: p.current_page,
      numPages: p.num_pages,
      hasNext: p.has_next,
      hasPrevious: p.has_previous,
    }
  }

  const p = raw as DrfPage<T>
  const numPages = pageSize > 0 ? Math.max(1, Math.ceil((p?.count ?? 0) / pageSize)) : 1

  return {
    count: p?.count ?? 0,
    results: p?.results ?? [],
    page: requestedPage,
    numPages,
    hasNext: Boolean(p?.next),
    hasPrevious: Boolean(p?.previous),
  }
}

/**
 * Resolve a (possibly relative) media path returned by the backend to an
 * absolute URL by stripping the trailing `/api/v1` from the configured API base.
 */
export function mediaUrl(path?: string | null): string | undefined {
  if (!path)
    return undefined
  if (path.startsWith('http'))
    return path

  const base = String(useRuntimeConfig().public.apiBaseUrl || '').replace(/\/api\/v1\/?$/, '')

  return `${base}${path}`
}

/** Strip null/undefined/'' entries so we don't send empty query params. */
export function cleanParams(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

/**
 * Build FormData for multipart endpoints (image uploads).
 * - File values are appended directly.
 * - Arrays are appended as repeated keys (works with DRF ListField / getlist).
 * - Objects/arrays-of-objects are JSON-stringified.
 * - null/undefined are skipped; booleans become 'true'/'false'.
 */
export function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData()

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null)
      return

    if (value instanceof File) {
      fd.append(key, value)

      return
    }

    if (typeof value === 'boolean') {
      fd.append(key, value ? 'true' : 'false')

      return
    }

    if (Array.isArray(value)) {
      // Array of primitives -> repeated keys; array of objects -> JSON.
      if (value.every(v => typeof v !== 'object' || v === null))
        value.forEach(v => fd.append(key, String(v)))
      else
        fd.append(key, JSON.stringify(value))

      return
    }

    if (typeof value === 'object') {
      fd.append(key, JSON.stringify(value))

      return
    }

    fd.append(key, String(value))
  }

  Object.entries(payload).forEach(([k, v]) => append(k, v))

  return fd
}

/** True when the payload contains a File somewhere at the top level. */
export function hasFile(payload: Record<string, unknown>): boolean {
  return Object.values(payload).some(v => v instanceof File)
}

export interface ParsedApiError {

  /** A single human-readable message (best effort). */
  message: string

  /** field -> messages, for form binding. `non_field_errors`/`detail` under `_`. */
  fields: Record<string, string[]>
  status?: number
}

/**
 * Parse a DRF error response (from an ofetch error) into field errors.
 * DRF returns either { field: [msg, ...] }, { detail: "..." },
 * { error: "..." }, or a plain string.
 */
export function parseApiError(err: any): ParsedApiError {
  const status = err?.statusCode ?? err?.response?.status
  const data = err?.data ?? err?.response?._data ?? err

  const fields: Record<string, string[]> = {}
  let message = 'Something went wrong. Please try again.'

  const toArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String) : [String(v)]

  if (typeof data === 'string') {
    message = data
  }
  else if (data && typeof data === 'object') {
    if ('detail' in data) {
      message = String((data as any).detail)
      fields._ = toArray((data as any).detail)
    }
    else if ('error' in data) {
      message = String((data as any).error)
      fields._ = toArray((data as any).error)
    }
    else {
      for (const [key, value] of Object.entries(data))
        fields[key] = toArray(value)

      const first = Object.entries(fields)[0]
      if (first)
        message = `${first[0] === '_' || first[0] === 'non_field_errors' ? '' : `${first[0]}: `}${first[1][0]}`
    }
  }

  if (status === 401)
    message = 'Your session has expired. Please sign in again.'
  else if (status === 403)
    message = 'You do not have permission to perform this action.'

  return { message, fields, status }
}
