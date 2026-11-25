import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/estado/estadoAutenticacion'

const routes = [
  {
    path: '/',
    name: 'root',
    redirect: () => {
      const auth = useAuthStore()
      return auth.isAuthenticated ? auth.homeRoute : { name: 'login' }
    },
  },
  {
    path: '/ingresar',
    name: 'login',
    component: () => import('@/vistas/autenticacion/VistaInicioSesion.vue'),
    meta: { guestOnly: true, title: 'Iniciar sesión' },
  },

  // ---- Rol Estudiante ------------------------------------------------------
  {
    path: '/estudiante',
    component: () => import('@/plantillas/PlantillaEstudiante.vue'),
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: '', redirect: { name: 'student-inscription' } },
      {
        path: 'inscripcion',
        name: 'student-inscription',
        component: () => import('@/vistas/estudiante/VistaInscripcion.vue'),
        meta: { title: 'Inscripción a opción de grado' },
      },
    ],
  },

  // ---- Rol Coordinación (administrativo) -----------------------------------
  {
    path: '/coordinacion',
    component: () => import('@/plantillas/PlantillaCoordinacion.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: { name: 'admin-dashboard' } },
      {
        path: 'panel',
        name: 'admin-dashboard',
        component: () => import('@/vistas/coordinacion/VistaPanelGeneral.vue'),
        meta: { title: 'Panel general' },
      },
      {
        path: 'solicitudes',
        name: 'admin-requests',
        component: () => import('@/vistas/coordinacion/VistaSolicitudes.vue'),
        meta: { title: 'Bandeja de solicitudes' },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/vistas/VistaNoEncontrada.vue'),
    meta: { title: 'Página no encontrada' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.guestOnly && auth.isAuthenticated) return auth.homeRoute

  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const requiredRole = to.matched.find((r) => r.meta.role)?.meta.role
  if (requiredRole && auth.role !== requiredRole) return auth.homeRoute

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · SIA-OG` : 'SIA-OG · Opciones de Grado'
})

export default router
