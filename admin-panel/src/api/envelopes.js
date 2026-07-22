// Pagination-envelope normalisers.
//
// The backend uses FOUR different list response shapes (PROJECT_ANALYSIS.md §5).
// Every list endpoint declares which one it uses in the resource registry, and
// the client normalises to a single internal shape:
//
//   { items: [...], count: <total>, pageCount: <total pages | null>,
//     hasNext: <bool>, hasPrev: <bool>, raw: <original> }

export const ENVELOPE = {
  DRF: 'A', // { count, next, previous, results }
  USER: 'B', // { count, num_pages, current_page, has_next, has_previous, results }
  DATA: 'C', // { data, count, totalPage }
  NONE: 'D', // plain array (no pagination)
};

export function normalizeList(envelope, payload, { page = 1, pageSize = null } = {}) {
  switch (envelope) {
    case ENVELOPE.DRF:
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? (payload?.results?.length || 0),
        pageCount: pageSize ? Math.max(1, Math.ceil((payload?.count || 0) / pageSize)) : null,
        hasNext: !!payload?.next,
        hasPrev: !!payload?.previous,
        raw: payload,
      };

    case ENVELOPE.USER:
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? 0,
        pageCount: payload?.num_pages ?? null,
        hasNext: !!payload?.has_next,
        hasPrev: !!payload?.has_previous,
        raw: payload,
      };

    case ENVELOPE.DATA:
      return {
        items: payload?.data ?? [],
        count: payload?.count ?? (payload?.data?.length || 0),
        pageCount: payload?.totalPage ?? null,
        hasNext: payload?.totalPage ? page < payload.totalPage : false,
        hasPrev: page > 1,
        raw: payload,
      };

    case ENVELOPE.NONE:
    default: {
      const arr = Array.isArray(payload) ? payload : payload?.results ?? [];
      return {
        items: arr,
        count: arr.length,
        pageCount: 1,
        hasNext: false,
        hasPrev: false,
        raw: payload,
      };
    }
  }
}
