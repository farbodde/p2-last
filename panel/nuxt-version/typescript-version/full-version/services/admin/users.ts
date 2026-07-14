// Users, roles and reports API service. Uses the template's $api (ofetch).

import { ADMIN_ENDPOINTS as E } from '@/constants/adminEndpoints'
import type { Paginated } from '@/types/admin/common'
import type {
  AdminUser,
  RoleUpdatePayload,
  UserCreatePayload,
  UserReport,
  UserRole,
  UserUpdatePayload,
} from '@/types/admin/user'

export interface UsersQuery {
  page?: number
  page_size?: number
  search?: string
  role?: UserRole | ''
}

/**
 * Build the request body for user create/update.
 * - No image → plain JSON (the `languages` JSONField accepts a real array).
 * - Image present → multipart; `languages` is encoded as a JSON string because
 *   DRF's JSONField does not reconstruct a list from repeated multipart keys.
 */
function userBody(payload: Record<string, unknown>): FormData | Record<string, unknown> {
  if (!hasFile(payload))
    return cleanParams(payload)

  const clone: Record<string, unknown> = { ...payload }
  if (Array.isArray(clone.languages))
    clone.languages = JSON.stringify(clone.languages)

  return buildFormData(clone)
}

export const usersService = {
  async list(query: UsersQuery = {}): Promise<Paginated<AdminUser>> {
    const page = query.page ?? 1
    const pageSize = query.page_size ?? 10
    const raw = await $api(E.users.list, { query: cleanParams({ ...query, page, page_size: pageSize }) })

    return normalizePaginated<AdminUser>(raw, page, pageSize)
  },

  detail(username: string): Promise<AdminUser> {
    return $api(E.users.detail(username))
  },

  create(payload: UserCreatePayload): Promise<AdminUser> {
    return $api(E.users.create, { method: 'POST', body: userBody(payload as Record<string, unknown>) })
  },

  update(username: string, payload: UserUpdatePayload): Promise<AdminUser> {
    return $api(E.users.update(username), { method: 'PUT', body: userBody(payload as Record<string, unknown>) })
  },

  remove(username: string): Promise<void> {
    return $api(E.users.remove(username), { method: 'DELETE' })
  },

  updateRole(payload: RoleUpdatePayload): Promise<{ message: string }> {
    return $api(E.users.updateRole, { method: 'POST', body: payload })
  },
}

export const reportsService = {
  async list(query: { page?: number; page_size?: number } = {}): Promise<Paginated<UserReport>> {
    const page = query.page ?? 1
    const pageSize = query.page_size ?? 20
    const raw = await $api(E.reports.list, { query: cleanParams({ page, page_size: pageSize }) })

    return normalizePaginated<UserReport>(raw, page, pageSize)
  },

  remove(id: number): Promise<void> {
    return $api(E.reports.remove(id), { method: 'DELETE' })
  },
}
