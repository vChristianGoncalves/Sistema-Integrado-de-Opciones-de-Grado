/**
 * Persistencia de sesión. Centralizado para poder cambiar a cookies httpOnly
 * (Laravel Sanctum SPA) sin tocar el resto de la aplicación.
 */
const TOKEN_KEY = 'sia_og_token'
const USER_KEY = 'sia_og_user'

export const tokenStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
