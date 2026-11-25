<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { GraduationCap, LogOut, Bell, FilePlus2 } from 'lucide-vue-next'
import { useAuthStore } from '@/estado/estadoAutenticacion'
import { useInscriptionStore } from '@/estado/estadoInscripcion'
import { initials } from '@/utilidades/formato'
import { INSTITUCION } from '@/utilidades/institucion'

const auth = useAuthStore()
const inscription = useInscriptionStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  inscription.reset()
  inscription.initialized = false
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-8">
          <RouterLink :to="{ name: 'student-inscription' }" class="flex items-center gap-3">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-brand-400 text-ink shadow-sm">
              <GraduationCap class="h-5 w-5" />
            </span>
            <span class="leading-tight">
              <span class="block text-sm font-extrabold tracking-tight">Sistema Integrado de Opciones de Grado</span>
            </span>
          </RouterLink>

          <nav class="hidden items-center gap-1 md:flex" aria-label="Principal">
            <RouterLink
              :to="{ name: 'student-inscription' }"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink"
              active-class="!bg-brand-50 !text-ink"
            >
              <FilePlus2 class="h-4 w-4" /> Inscripción
            </RouterLink>
          </nav>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <button type="button" class="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink" aria-label="Notificaciones">
            <Bell class="h-5 w-5" />
            <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
          </button>

          <div class="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {{ initials(auth.user?.name) }}
            </span>
            <div class="leading-tight">
              <p class="max-w-[180px] truncate text-sm font-semibold">{{ auth.user?.name }}</p>
              <p class="text-[11px] text-muted">Estudiante</p>
            </div>
          </div>

          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            @click="logout"
          >
            <LogOut class="h-4 w-4" /> <span class="hidden lg:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RouterView />
      </div>
    </main>

    <footer class="border-t border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
        <p>© 2026 {{ INSTITUCION.nombre }} · {{ INSTITUCION.direccion }}</p>
        <p>{{ INSTITUCION.correo }}</p>
      </div>
    </footer>
  </div>
</template>
