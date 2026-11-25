<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { GraduationCap, LayoutDashboard, Inbox, Layers, School, BarChart3, LogOut, Menu, X, Bell, Search } from 'lucide-vue-next'
import { useAuthStore } from '@/estado/estadoAutenticacion'
import { useCoordinationStore } from '@/estado/estadoCoordinacion'
import { initials } from '@/utilidades/formato'
import { INSTITUCION } from '@/utilidades/institucion'

const auth = useAuthStore()
const coord = useCoordinationStore()
const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const quickSearch = ref('')

const nav = computed(() => [
  { label: 'Panel general', to: { name: 'admin-dashboard' }, icon: LayoutDashboard },
  { label: 'Solicitudes', to: { name: 'admin-requests' }, icon: Inbox, badge: coord.pendingCount || null },
])

// Módulos previstos para siguientes iteraciones
const upcoming = [
  { label: 'Modalidades y cupos', icon: Layers },
  { label: 'Aulas TG I / TG II', icon: School },
  { label: 'Reportes por facultad', icon: BarChart3 },
]

onMounted(() => coord.fetchRequests())
watch(() => route.fullPath, () => (sidebarOpen.value = false))

function submitSearch() {
  coord.filters.search = quickSearch.value
  coord.filters.status = 'all'
  quickSearch.value = ''
  router.push({ name: 'admin-requests' })
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen">
    <Transition enter-active-class="transition-opacity" enter-from-class="opacity-0" leave-active-class="transition-opacity" leave-to-class="opacity-0">
      <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" @click="sidebarOpen = false" />
    </Transition>

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      aria-label="Navegación de la coordinación"
    >
      <div class="flex h-16 items-center justify-between gap-3 border-b border-slate-100 px-5">
        <RouterLink :to="{ name: 'admin-dashboard' }" class="flex items-center gap-3">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-brand-400 text-ink shadow-sm"><GraduationCap class="h-5 w-5" /></span>
          <span class="leading-tight">
            <span class="block text-sm font-extrabold tracking-tight">Sistema Integrado de Opciones de Grado</span>
            <span class="block text-[11px] text-muted">Coordinación</span>
          </span>
        </RouterLink>
        <button type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Cerrar menú" @click="sidebarOpen = false">
          <X class="h-5 w-5" />
        </button>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div>
          <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gestión</p>
          <ul class="space-y-1">
            <li v-for="item in nav" :key="item.label">
              <RouterLink
                :to="item.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                active-class="!bg-brand-50 !text-ink font-semibold [&>svg]:!text-brand-600"
              >
                <component :is="item.icon" class="h-[18px] w-[18px] text-slate-400" />
                <span class="flex-1">{{ item.label }}</span>
                <span v-if="item.badge" class="rounded-full bg-brand-400 px-2 py-0.5 text-[11px] font-bold text-ink">{{ item.badge }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Próximamente</p>
          <ul class="space-y-1">
            <li v-for="item in upcoming" :key="item.label">
              <span class="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400">
                <component :is="item.icon" class="h-[18px] w-[18px]" /> {{ item.label }}
              </span>
            </li>
          </ul>
        </div>
      </nav>

      <div class="border-t border-slate-100 p-3">
        <div class="flex items-center gap-3 rounded-lg p-2">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{{ initials(auth.user?.name) }}</span>
          <div class="min-w-0 flex-1 leading-tight">
            <p class="truncate text-sm font-semibold">{{ auth.user?.name }}</p>
            <p class="truncate text-[11px] text-muted">{{ auth.user?.position }}</p>
          </div>
          <button type="button" class="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" aria-label="Cerrar sesión" title="Cerrar sesión" @click="logout">
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>

    <div class="flex min-h-screen flex-col lg:pl-64">
      <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Abrir menú" @click="sidebarOpen = true">
          <Menu class="h-5 w-5" />
        </button>

        <div class="min-w-0 flex-1">
          <p class="hidden text-[11px] font-medium uppercase tracking-wider text-muted sm:block">{{ INSTITUCION.coordinacion }}</p>
          <h1 class="truncate text-base font-bold text-ink sm:text-lg">{{ route.meta.title }}</h1>
        </div>

        <form class="relative hidden w-72 md:block" role="search" @submit.prevent="submitSearch">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label for="quick-search" class="sr-only">Buscar solicitud</label>
          <input id="quick-search" v-model="quickSearch" type="search" class="input h-10 py-2 pl-9" placeholder="Buscar radicado, ID o estudiante…" />
        </form>

        <button type="button" class="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink" aria-label="Notificaciones">
          <Bell class="h-5 w-5" />
          <span v-if="coord.pendingCount" class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>
      </header>

      <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
