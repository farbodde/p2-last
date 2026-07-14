// User domain types — mirror auth_app serializers.

export type UserRole = 'player' | 'youtuber' | 'premium_user' | 'admin'
export type Gender = 'male' | 'female' | 'none'
export type AuthProvider = 'email' | 'google'

/** Shape returned by UserDetailSerializer (read). */
export interface AdminUser {
  id: number
  email: string
  display_name: string
  username: string | null
  profile_image: string | null
  cover_image: string | null
  about_me: string
  gender: Gender
  date_of_birth: string | null
  location: string
  languages: string[]
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  last_login: string | null
  last_activity: string | null
  is_online: boolean
  role: UserRole | null
}

/** Payload for UserCreateSerializer (write). Sent as multipart when images present. */
export interface UserCreatePayload {
  email: string
  password: string
  display_name?: string
  username?: string
  about_me?: string
  gender?: Gender
  date_of_birth?: string | null
  location?: string
  languages?: string[]
  is_active?: boolean
  role?: UserRole
  profile_image?: File | null
  cover_image?: File | null
}

/** Payload for UserUpdateSerializer (partial write) + optional role. */
export interface UserUpdatePayload {
  email?: string
  display_name?: string
  username?: string
  about_me?: string
  gender?: Gender
  date_of_birth?: string | null
  location?: string
  languages?: string[]
  is_active?: boolean
  role?: UserRole
  profile_image?: File | null
  cover_image?: File | null
}

/** UserRoleUpdateSerializer payload. */
export interface RoleUpdatePayload {
  username: string
  role: UserRole
}

/** ReportListSerializer shape. */
export interface UserReport {
  id: number
  reporter_username: string | null
  reporter_email: string
  reported_user_username: string | null
  reported_user_email: string
  message: string
  image_urls: string[]
  created_at: string
}
