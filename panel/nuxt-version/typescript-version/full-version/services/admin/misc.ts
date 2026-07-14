// Feedback, notifications, LFG inspection and meta reference data.

import { ADMIN_ENDPOINTS as E } from '@/constants/adminEndpoints'
import type { CustomPage, DrfPage, Paginated } from '@/types/admin/common'
import type {
  DevicePayload,
  Feedback,
  FeedbackType,
  Lfg,
  MetaOption,
  TestPushPayload,
} from '@/types/admin/misc'

export const feedbackService = {
  async list(query: { page?: number; page_size?: number; type?: FeedbackType | '' } = {}): Promise<Paginated<Feedback>> {
    const page = query.page ?? 1
    const pageSize = query.page_size ?? 10
    const raw = await $api<DrfPage<Feedback> | CustomPage<Feedback>>(E.feedback.list, { query: cleanParams({ ...query, page, page_size: pageSize }) })

    return normalizePaginated<Feedback>(raw, page, pageSize)
  },
  remove(id: number): Promise<void> {
    return $api(E.feedback.remove(id), { method: 'DELETE' })
  },
  bulkDelete(ids: number[]): Promise<{ message: string }> {
    return $api(E.feedback.bulkDelete, { method: 'DELETE', body: { feedback_ids: ids } })
  },
}

export const notificationsService = {
  testPush(payload: TestPushPayload): Promise<{ detail: string }> {
    return $api(E.notifications.testPush, { method: 'POST', body: payload })
  },
  registerDevice(payload: DevicePayload): Promise<{ detail: string }> {
    return $api(E.notifications.registerDevice, { method: 'POST', body: payload })
  },
  unregisterDevice(fcmToken: string): Promise<{ detail: string }> {
    return $api(E.notifications.unregisterDevice, { method: 'DELETE', body: { fcm_token: fcmToken } })
  },
}

export const lfgService = {
  async byUser(userId: number, query: { page?: number } = {}): Promise<Paginated<Lfg>> {
    const page = query.page ?? 1
    const raw = await $api<DrfPage<Lfg> | CustomPage<Lfg>>(E.lfg.byUser(userId), { query: cleanParams({ page }) })

    return normalizePaginated<Lfg>(raw, page)
  },
}

export const metaService = {
  languages(): Promise<MetaOption[]> {
    return $api(E.meta.languages)
  },
  countries(): Promise<MetaOption[]> {
    return $api(E.meta.countries)
  },
}
