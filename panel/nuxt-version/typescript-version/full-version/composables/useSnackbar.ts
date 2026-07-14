// Global snackbar/toast used across the admin panel.
// Backed by useState so a single <AdminSnackbar> host (mounted in App.vue)
// renders messages triggered from anywhere.

export type SnackbarColor = 'success' | 'error' | 'warning' | 'info'

export interface SnackbarState {
  show: boolean
  message: string
  color: SnackbarColor
  timeout: number
}

export function useSnackbar() {
  const state = useState<SnackbarState>('admin-snackbar', () => ({
    show: false,
    message: '',
    color: 'success',
    timeout: 4000,
  }))

  function notify(message: string, color: SnackbarColor = 'success', timeout = 4000) {
    state.value = { show: true, message, color, timeout }
  }

  const success = (m: string) => notify(m, 'success')
  const error = (m: string) => notify(m, 'error')
  const warning = (m: string) => notify(m, 'warning')
  const info = (m: string) => notify(m, 'info')

  return { state, notify, success, error, warning, info }
}
