// Authentication against the real Django JWT backend, wired to the template's
// cookie conventions (accessToken / refreshToken / userData / userAbilityRules)
// so the existing $api, useApi, UserProfile and CASL plumbing keep working.

import { useAbility } from '@/plugins/casl/composables/useAbility'
import { ADMIN_ENDPOINTS as E } from '@/constants/adminEndpoints'
import { COOKIE_MAX_AGE_1_YEAR } from '@/utils/constants'
import { abilityRulesForRole } from '@/constants/adminOptions'
import type { UserRole } from '@/types/admin/user'

interface LoginUser {
  id: number
  email: string
  display_name: string
  username: string | null
  role: UserRole | null
  is_staff: boolean
  is_superuser: boolean
}

interface LoginResponse {
  access: string
  refresh: string
  user: LoginUser
}

export interface StoredUser {
  id: number
  email: string
  fullName: string
  username: string | null
  role: UserRole | null
  avatar: string | null
  is_staff: boolean
  is_superuser: boolean
}

const cookieOpts = { maxAge: COOKIE_MAX_AGE_1_YEAR, path: '/' as const }

export function useAdminAuth() {
  const accessToken = useCookie<string | null>('accessToken', cookieOpts)
  const refreshToken = useCookie<string | null>('refreshToken', cookieOpts)
  const userData = useCookie<StoredUser | null>('userData', cookieOpts)
  const userAbilityRules = useCookie<any[]>('userAbilityRules', cookieOpts)

  const isLoggedIn = computed(() => Boolean(accessToken.value && userData.value))
  const isAdmin = computed(() => userData.value?.role === 'admin' || Boolean(userData.value?.is_staff))

  function applyAbility(role: UserRole | null) {
    const rules = abilityRulesForRole(role)
    userAbilityRules.value = rules
    try {
      useAbility().update(rules as any)
    }
    catch {
      // Ability plugin not ready (SSR / early call) — cookie is enough; the
      // casl plugin re-hydrates from the cookie on the next request.
    }
  }

  async function login(email: string, password: string) {
    const res = await $api<LoginResponse>(E.auth.login, {
      method: 'POST',
      body: { email, password },
    })

    const u = res.user
    const isPanelUser = u.role === 'admin' || u.is_staff
    if (!isPanelUser) {
      throw createError({
        statusCode: 403,
        data: { detail: 'This account is not allowed to access the admin panel.' },
      })
    }

    accessToken.value = res.access
    refreshToken.value = res.refresh
    userData.value = {
      id: u.id,
      email: u.email,
      fullName: u.display_name,
      username: u.username,
      role: u.role,
      avatar: null,
      is_staff: u.is_staff,
      is_superuser: u.is_superuser,
    }
    applyAbility(u.role)

    return userData.value
  }

  /** Refresh the access token using the stored refresh token. Returns success. */
  async function refresh(): Promise<boolean> {
    if (!refreshToken.value)
      return false

    try {
      const res = await $fetch<{ access: string }>(E.auth.refresh, {
        baseURL: useRuntimeConfig().public.apiBaseUrl,
        method: 'POST',
        body: { refresh: refreshToken.value },
      })
      accessToken.value = res.access

      return true
    }
    catch {
      return false
    }
  }

  function clearSession() {
    accessToken.value = null
    refreshToken.value = null
    userData.value = null
    userAbilityRules.value = []
    try {
      useAbility().update([])
    }
    catch { /* noop */ }
  }

  async function logout() {
    clearSession()
    await navigateTo('/login')
  }

  return {
    accessToken,
    refreshToken,
    userData,
    isLoggedIn,
    isAdmin,
    login,
    refresh,
    logout,
    clearSession,
  }
}
