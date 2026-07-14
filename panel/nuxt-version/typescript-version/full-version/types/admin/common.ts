// Shared admin API types.
// Mirrors the two pagination shapes the P2 Player backend returns
// (see PROJECT_ANALYSIS.md §6). Both are normalized to `Paginated<T>`.

/** Normalized paginated response used across the admin panel. */
export interface Paginated<T> {
  count: number
  results: T[]

  /** 1-based current page (derived when the backend does not send it). */
  page: number

  /** Total pages (derived from count/pageSize when not provided). */
  numPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/** Raw DRF PageNumberPagination payload. */
export interface DrfPage<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Raw custom pagination payload used by auth_app.UserListView. */
export interface CustomPage<T> {
  count: number
  num_pages: number
  current_page: number
  has_next: boolean
  has_previous: boolean
  results: T[]
}

/** Common list query parameters accepted by admin list endpoints. */
export interface ListQuery {
  page?: number
  page_size?: number
  search?: string
  [key: string]: unknown
}
