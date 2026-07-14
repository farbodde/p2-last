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
    const body = hasFile(payload as Record<string, unknown>)
      ? buildFormData(payload as Record<string, unknown>)
      : cleanParams(payload as Record<string, unknown>)

    return $api(E.users.create, { method: 'POST', body })
  },

  update(username: string, payload: UserUpdatePayload): Promise<AdminUser> {
    const body = hasFile(payload as Record<string, unknown>)
      ? buildFormData(payload as Record<string, unknown>)
      : cleanParams(payload as Record<string, unknown>)

    return $api(E.users.update(username), { method: 'PUT', body })
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
