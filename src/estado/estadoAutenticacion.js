import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/servicios/servicioAutenticacion'
import { tokenStorage } from '@/api/almacenamientoSesion'

export const ROLE_HOME = {
  student: { name: 'student-inscription' },
  admin: { name: 'admin-dashboard' },
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(tokenStorage.getToken())
  const user = ref(tokenStorage.getUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const role = computed(() => user.value?.role ?? null)
  const homeRoute = computed(() => ROLE_HOME[role.value] ?? { name: 'login' })

  async function login(credentials) {
    loading.value = true
    try {
      const data = await authService.login(credentials)
      token.value = data.token
      user.value = data.user
      tokenStorage.setToken(data.token)
      tokenStorage.setUser(data.user)
      return data.user
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      /* la sesión se limpia igualmente */
    }
    clear()
  }

  function clear() {
    token.value = null
    user.value = null
    tokenStorage.clear()
  }

  return { token, user, loading, isAuthenticated, role, homeRoute, login, logout, clear }
})
