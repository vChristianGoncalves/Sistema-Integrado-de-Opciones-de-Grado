import axios from 'axios'
import { tokenStorage } from './almacenamientoSesion'
import { ApiError } from './errorApi'

/**
 * Cliente HTTP único para toda la aplicación.
 * - baseURL desde VITE_API_BASE_URL
 * - Bearer token (JWT / Sanctum personal access token)
 * - Soporte opcional de cookies + XSRF (Sanctum SPA)
 * - Normalización de errores en ApiError
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true',
  withXSRFToken: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true',
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

// ---- Request: adjunta el token de sesión ---------------------------------
http.interceptors.request.use((config) => {
  const token = tokenStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Si se envía FormData, dejar que el navegador defina el boundary.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// ---- Response: errores homogéneos + manejo de sesión expirada -------------
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    const status = error.response?.status ?? 0
    const data = error.response?.data ?? null

    if (status === 401) {
      tokenStorage.clear()
      if (!window.location.pathname.startsWith('/ingresar')) {
        const redirect = encodeURIComponent(window.location.pathname)
        window.location.assign(`/ingresar?redirect=${redirect}&expired=1`)
      }
    }

    const messages = {
      0: 'No fue posible conectar con el servidor. Verifica tu conexión.',
      403: 'No tienes permisos para realizar esta acción.',
      404: 'El recurso solicitado no existe.',
      419: 'La sesión expiró. Recarga la página e inténtalo de nuevo.',
      422: 'Hay datos inválidos en el formulario.',
      500: 'Ocurrió un error interno en el servidor.',
    }

    const message = data?.message || messages[status] || 'Ocurrió un error inesperado.'
    return Promise.reject(new ApiError(message, { status, errors: data?.errors ?? {}, data }))
  },
)

/** Necesario antes del login cuando se usa Laravel Sanctum en modo SPA. */
export async function ensureCsrfCookie() {
  if (import.meta.env.VITE_API_WITH_CREDENTIALS !== 'true') return
  const root = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
  await axios.get(`${root}/sanctum/csrf-cookie`, { withCredentials: true })
}

export default http
