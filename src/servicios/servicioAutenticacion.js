import http, { ensureCsrfCookie } from '@/api/clienteHttp'
import { ApiError } from '@/api/errorApi'
import { USE_MOCK_DATA, mockDelay } from './configuracion'
import { db } from '@/simulados/baseDatos'

/**
 * Contrato esperado del backend PHP:
 *  POST /auth/login   { email, password } -> { token, user: { id, name, email, role, ... } }
 *  POST /auth/logout  -> 204
 *  GET  /auth/me      -> { user }
 */
export const authService = {
  async login({ email, password }) {
    if (USE_MOCK_DATA) {
      await mockDelay(600)
      const found = db.users.find(
        (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password,
      )
      if (!found) {
        throw new ApiError('Correo o contraseña incorrectos.', {
          status: 422,
          errors: { email: ['Credenciales inválidas.'] },
        })
      }
      // eslint-disable-next-line no-unused-vars
      const { password: _omit, ...user } = found
      return { token: `mock-token-${user.id}-${Date.now()}`, user }
    }

    await ensureCsrfCookie()
    const { data } = await http.post('/auth/login', { email, password })
    return data
  },

  async logout() {
    if (USE_MOCK_DATA) {
      await mockDelay(150)
      return
    }
    await http.post('/auth/logout')
  },

  async me() {
    if (USE_MOCK_DATA) return null
    const { data } = await http.get('/auth/me')
    return data.user ?? data
  },
}
