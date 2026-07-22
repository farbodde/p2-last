// Small helpers shared across list/form/detail views.

export function prettyLabel(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\bid\b/i, 'ID')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bIs /, '');
}

// The identifier used in URLs and delete/update calls for a row.
export function rowId(resource, row) {
  if (resource.lookup) return row[resource.lookup];
  return row[resource.idField || 'id'];
}
