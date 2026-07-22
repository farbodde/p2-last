// Loads option lists for FK / M2M fields (e.g. platforms, categories) so form
// selects can render human labels. Cached per relation key for the session.
import { getResource } from '../resources/registry.js';
import { listResource } from './api.js';

const cache = new Map(); // relationKey -> [{value,label,raw}]

// Best-effort label for a related row.
function labelOf(row) {
  return row.title || row.name || row.display_name || row.username || row.email || `#${row.id}`;
}

/**
 * Load all options for a relation (a registry resource key), paging through the
 * backend. Capped to avoid runaway loads on very large tables.
 */
export async function loadRelation(relationKey, { force = false, maxPages = 20, pageSize = 100 } = {}) {
  if (!force && cache.has(relationKey)) return cache.get(relationKey);

  const resource = getResource(relationKey);
  if (!resource || !resource.endpoints?.list) {
    cache.set(relationKey, []);
    return [];
  }

  const out = [];
  let page = 1;
  for (; page <= maxPages; page++) {
    let res;
    try {
      res = await listResource(resource, { page, pageSize });
    } catch (e) {
      console.warn(`[relations] failed to load ${relationKey} page ${page}:`, e?.message || e);
      break;
    }
    res.items.forEach((row) => out.push({ value: row.id, label: labelOf(row), raw: row }));
    if (!res.hasNext) break;
  }

  cache.set(relationKey, out);
  return out;
}

export function invalidateRelation(relationKey) {
  cache.delete(relationKey);
}

export function invalidateAllRelations() {
  cache.clear();
}
