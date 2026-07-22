// Per-resource data access. Wraps the API client with registry endpoints and
// normalises list responses per the resource's declared pagination envelope.
import { api } from '../api/client.js';
import { normalizeList } from '../api/envelopes.js';

function ep(resource, name) {
  const e = resource.endpoints && resource.endpoints[name];
  if (!e) throw new Error(`Resource "${resource.key}" has no "${name}" endpoint.`);
  return e;
}

// Does any field require multipart (image/file present in payload as File)?
function hasFileField(fields, payload) {
  return fields.some((f) => (f.type === 'image' || f.type === 'file') && payload[f.name] instanceof File);
}

export async function listResource(resource, { page = 1, pageSize = null, search = null, filters = {}, signal } = {}) {
  const query = {};
  if (page) query.page = page;
  if (pageSize) query.page_size = pageSize;
  if (search) query.search = search;
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v !== '' && v != null) query[k] = v;
  });
  const data = await api.get(ep(resource, 'list'), { query, signal });
  return normalizeList(resource.envelope, data, { page, pageSize });
}

export async function retrieveResource(resource, id) {
  return api.get(ep(resource, 'retrieve')(id));
}

export async function createResource(resource, payload, fields) {
  const path = resource.endpoints.create;
  return writePayload('POST', path, payload, fields);
}

export async function updateResource(resource, id, payload, fields, { method = 'PATCH' } = {}) {
  // Users use PUT for update; games/filter use PUT/PATCH. Registry note: the
  // caller passes the method appropriate to the resource.
  const path = ep(resource, 'update')(id);
  return writePayload(method, path, payload, fields);
}

export async function deleteResource(resource, id) {
  return api.del(ep(resource, 'delete')(id));
}

// Sequential fallback for resources without a bulk endpoint.
export async function bulkDeleteResource(resource, ids) {
  if (resource.endpoints && resource.endpoints.bulkDelete && resource.capabilities?.bulkDelete) {
    // Feedback: DELETE with a JSON body { feedback_ids: [...] }
    return api.del(resource.endpoints.bulkDelete, { body: { feedback_ids: ids } });
  }
  const results = { ok: 0, failed: [] };
  for (const id of ids) {
    try {
      await deleteResource(resource, id);
      results.ok += 1;
    } catch (e) {
      results.failed.push({ id, error: e });
    }
  }
  return results;
}

async function writePayload(method, path, payload, fields) {
  const verb = method.toLowerCase();
  const fn = api[verb === 'delete' ? 'del' : verb];
  if (hasFileField(fields || [], payload)) {
    // multipart — client will not set Content-Type (browser adds boundary).
    return fn(path, { form: payload });
  }
  return fn(path, { body: payload });
}

// Custom action (e.g. update-role, test-push).
export async function runAction(action, body) {
  const verb = (action.method || 'POST').toLowerCase();
  const fn = api[verb === 'delete' ? 'del' : verb];
  return fn(action.path, { body });
}
