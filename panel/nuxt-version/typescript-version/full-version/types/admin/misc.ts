// Feedback, notification, LFG and meta types.

export type FeedbackType = 'bug' | 'complaint' | 'suggestion' | 'technical'

export interface FeedbackScreenshot {
  id: number
  image: string
}

/** feed_back.FeedbackListSerializer. */
export interface Feedback {
  id: number
  user: string | null
  email: string
  description: string
  type: FeedbackType
  created_at: string
  screenshots: FeedbackScreenshot[]
}

export type DeviceType = 'android' | 'ios' | 'web'

/** notification test-push payload. */
export interface TestPushPayload {
  title: string
  body: string
  data?: Record<string, unknown>
}

export interface DevicePayload {
  fcm_token: string
  device_type: DeviceType
}

/** posts.LFGListSerializer (subset the admin panel relies on). */
export interface Lfg {
  id: number
  game?: unknown
  platform?: unknown
  description?: string
  mic_enabled?: boolean
  allow_cross_play?: boolean
  bumped_at?: string | null
  created_at?: string
  [key: string]: unknown
}

/** meta languages/countries. */
export interface MetaOption {
  code: string
  name: string
}
