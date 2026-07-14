// Shared ofetch instance for the admin panel.
// - Adds the JWT bearer from the `accessToken` cookie to every request.
// - On a 401, transparently refreshes the access token once (via the Django
//   SimpleJWT refresh endpoint) and lets ofetch retry the original request.
//   If refresh fails, the session cookies are cleared so route middleware
//   bounces the user back to /login.

let refreshInFlight: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const accessToken = useCookie<string | null>('accessToken', { path: '/' })
  const refreshToken = useCookie<string | null>('refreshToken', { path: '/' })

  if (!refreshToken.value) {
    accessToken.value = null

    return false
  }

  // De-duplicate concurrent refreshes.
  refreshInFlight ??= (async () => {
    try {
      const res = await $fetch<{ access: string }>('auth/token/refresh/', {
        baseURL: useRuntimeConfig().public.apiBaseUrl || '/api',
        method: 'POST',
        body: { refresh: refreshToken.value },
      })
      accessToken.value = res.access

      return true
    }
    catch {
      accessToken.value = null
      refreshToken.value = null

      return false
    }
    finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export const $api = $fetch.create({
  retry: 1,
  retryStatusCodes: [401],

  // Request interceptor — set base URL + bearer (re-read on retry).
  async onRequest({ options }) {
    options.baseURL = useRuntimeConfig().public.apiBaseUrl || '/api'

    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  },

  // Response error interceptor — refresh once before ofetch retries.
  async onResponseError({ request, response }) {
    if (response?.status !== 401)
      return

    const url = typeof request === 'string' ? request : (request as Request).url ?? ''

    // Never try to refresh the login/refresh calls themselves.
    if (url.includes('auth/token/refresh') || url.includes('auth/login'))
      return

    await tryRefresh()
  },
})
