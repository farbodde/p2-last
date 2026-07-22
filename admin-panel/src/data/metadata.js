// Runtime field-metadata resolution.
//
// For style-G resources we issue an authenticated OPTIONS and overlay the live
// DRF metadata (types, required, read_only, choices, max_length) on top of the
// registry's fallback field list. For style-A resources OPTIONS yields nothing,
// so the registry field list is authoritative. See SCHEMA_STRATEGY.md.
import { api } from '../api/client.js';

const cache = new Map(); // resourceKey -> merged fields

// Map a DRF OPTIONS field descriptor to our field shape.
function fromOptions(name, d) {
  const typeMap = {
    email: 'email',
    string: 'string',
    integer: 'integer',
    boolean: 'boolean',
    choice: 'choice',
    date: 'date',
    datetime: 'datetime',
    field: 'string',
    nested: 'json',
    list: 'list',
    image: 'image',
    file: 'image',
    url: 'string',
    decimal: 'string',
  };
  return {
    name,
    type: typeMap[d.type] || 'string',
    required: !!d.required,
    readOnly: !!d.read_only,
    label: d.label || null,
    max_length: d.max_length || null,
    choices: Array.isArray(d.choices) ? d.choices.map((c) => ({ value: c.value, label: c.display_name })) : null,
    child: d.child || null,
  };
}

// Merge registry fallback fields with live OPTIONS metadata (live wins on
// attributes it provides; registry keeps relation/writeOnly/createOnly hints).
function merge(registryFields, optionActions) {
  if (!optionActions) return registryFields.map((f) => ({ ...f }));
  // Prefer POST action metadata (create shape); fall back to PUT.
  const src = optionActions.POST || optionActions.PUT || null;
  if (!src) return registryFields.map((f) => ({ ...f }));

  const byName = new Map(registryFields.map((f) => [f.name, { ...f }]));
  for (const [name, d] of Object.entries(src)) {
    const live = fromOptions(name, d);
    const base = byName.get(name) || {};
    byName.set(name, {
      ...base,
      ...live,
      // keep registry-only hints
      relation: base.relation || null,
      writeOnly: base.writeOnly || live.writeOnly,
      createOnly: base.createOnly || false,
      hint: base.hint || null,
      choices: live.choices || base.choices || null,
    });
  }
  // preserve registry order, then append any live-only fields
  const ordered = [];
  registryFields.forEach((f) => ordered.push(byName.get(f.name)));
  byName.forEach((v, k) => {
    if (!registryFields.find((f) => f.name === k)) ordered.push(v);
  });
  return ordered;
}

/**
 * Resolve the effective field list for a resource.
 * @param {object} resource registry entry
 * @param {object} opts { force }
 */
export async function resolveFields(resource, { force = false } = {}) {
  if (!force && cache.has(resource.key)) return cache.get(resource.key);

  let fields = (resource.fields || []).map((f) => ({ ...f }));

  if (resource.viewStyle === 'generic' && resource.endpoints && resource.endpoints.list) {
    try {
      const meta = await api.options(resource.endpoints.list);
      if (meta && meta.actions) {
        fields = merge(resource.fields || [], meta.actions);
      }
    } catch (e) {
      // OPTIONS failed (network/403) — silently fall back to registry fields.
      console.warn(`[metadata] OPTIONS failed for ${resource.key}; using registry fallback.`, e?.message || e);
    }
  }

  cache.set(resource.key, fields);
  return fields;
}

export function clearMetadataCache() {
  cache.clear();
}
