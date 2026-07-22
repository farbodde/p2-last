// Dashboard data. The backend exposes NO dedicated stats endpoint, so every
// number here is derived from real list responses (their `count`, or array
// length for the un-paginated envelope). Nothing is fabricated. Resources that
// 403 (e.g. reports without is_staff) or error are reported as such, not zero.
import { getResource, RESOURCES } from '../resources/registry.js';
import { listResource } from './api.js';

// Resources whose list carries a usable total count.
export const COUNTABLE = RESOURCES.filter(
  (r) => r.capabilities?.list && r.endpoints?.list && r.viewStyle !== 'lookup' && r.viewStyle !== 'actions'
).map((r) => r.key);

async function countOne(key) {
  const res = getResource(key);
  try {
    const data = await listResource(res, { page: 1, pageSize: 1 });
    return { key, label: res.label, icon: res.icon, count: data.count, ok: true };
  } catch (e) {
    return { key, label: res.label, icon: res.icon, count: null, ok: false, status: e?.status || 0, error: e?.message };
  }
}

export async function loadCounts() {
  const results = await Promise.all(COUNTABLE.map(countOne));
  return results;
}

// Fetch the first `n` items from a resource's list (already newest-first on the
// backend for users/feedback/reports).
export async function loadRecent(key, n = 5) {
  const res = getResource(key);
  try {
    const data = await listResource(res, { page: 1, pageSize: n });
    return { key, label: res.label, items: data.items.slice(0, n), ok: true };
  } catch (e) {
    return { key, label: res.label, items: [], ok: false, status: e?.status || 0, error: e?.message };
  }
}
