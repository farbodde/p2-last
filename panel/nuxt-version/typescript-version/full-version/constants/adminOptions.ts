// Choice sets mirrored from the Django models/serializers.

import type { DeviceType, FeedbackType } from '@/types/admin/misc'
import type { Gender, UserRole } from '@/types/admin/user'

export const USER_ROLES: { title: string; value: UserRole }[] = [
  { title: 'Player', value: 'player' },
  { title: 'Youtuber', value: 'youtuber' },
  { title: 'Premium User', value: 'premium_user' },
  { title: 'Admin', value: 'admin' },
]

export const ROLE_COLOR: Record<UserRole, string> = {
  admin: 'error',
  premium_user: 'warning',
  youtuber: 'info',
  player: 'secondary',
}

export const GENDERS: { title: string; value: Gender }[] = [
  { title: 'Male', value: 'male' },
  { title: 'Female', value: 'female' },
  { title: 'Prefer not to say', value: 'none' },
]

export const FEEDBACK_TYPES: { title: string; value: FeedbackType }[] = [
  { title: 'Bug', value: 'bug' },
  { title: 'Complaint', value: 'complaint' },
  { title: 'Suggestion / Idea', value: 'suggestion' },
  { title: 'Technical Difficulty', value: 'technical' },
]

export const FEEDBACK_TYPE_COLOR: Record<FeedbackType, string> = {
  bug: 'error',
  complaint: 'warning',
  suggestion: 'success',
  technical: 'info',
}

export const DEVICE_TYPES: { title: string; value: DeviceType }[] = [
  { title: 'Android', value: 'android' },
  { title: 'iOS', value: 'ios' },
  { title: 'Web', value: 'web' },
]

/** Ability rules per role for CASL (see plugins/casl). */
export function abilityRulesForRole(role: string | null | undefined) {
  if (role === 'admin')
    return [{ action: 'manage', subject: 'all' }]

  // Non-admin roles can only see their own account area; admin panel is gated.
  return [{ action: 'read', subject: 'Auth' }]
}
