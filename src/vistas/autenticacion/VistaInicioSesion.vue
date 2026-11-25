<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { GraduationCap, Mail, Lock, Eye, EyeOff, LogIn, UserRound, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import BotonBase from '@/componentes/comun/BotonBase.vue'
import { useAuthStore } from '@/estado/estadoAutenticacion'
import { USE_MOCK_DATA } from '@/servicios/configuracion'
import { INSTITUCION } from '@/utilidades/institucion'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const error = ref('')
const sessionExpired = computed(() => route.query.expired === '1')

// Cuentas de demostración (solo visibles en modo simulado)
const demoAccounts = [
  { role: 'Estudiante', icon: UserRound, email: 'vruizc12@estudiante.ibero.edu.co', password: 'Estudiante2026*' },
  { role: 'Coordinación', icon: ShieldCheck, email: 'coord.investigaciones@academico.ibero.edu.co', password: 'Coordinacion2026*' },
]

function useDemo(account) {
  form.email = account.email
  form.password = account.password
  error.value = ''
}

async function submit() {
  error.value = ''
  if (!form.email || !form.password) {
    error.value = 'Ingresa tu correo institucional y contraseña.'
    return
  }
  try {
    await auth.login({ ...form })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    const target = redirect && router.resolve(redirect).matched.length ? redirect : auth.homeRoute
    router.replace(target)
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Panel institucional -->
    <aside class="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div class="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
      <div class="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />

      <div class="relative flex items-center gap-3">
        <span class="grid h-11 w-11 place-items-center rounded-xl bg-brand-400 text-ink"><GraduationCap class="h-6 w-6" /></span>
        <span class="text-lg font-extrabold tracking-tight text-white">Sistema Integrado de Opciones de Grado</span>
      </div>

      <div class="relative max-w-md">
        <p class="mt-1 text-sm text-slate-400">{{ INSTITUCION.direccion }} · {{ INSTITUCION.coordinacion }}</p>
        <h1 class="mt-4 text-4xl font-extrabold leading-tight text-white">Tu opción de grado en modalidad investigativa, en un solo lugar.</h1>
        <p class="mt-4 text-base leading-relaxed text-slate-300">
          Conoce las cinco modalidades investigativas, verifica los requisitos del Reglamento de Investigación (Res. 617 de 2024) y radica tu preinscripción.
        </p>
        <ul class="mt-8 space-y-3 text-sm text-slate-200">
          <li class="flex items-center gap-2.5"><CheckCircle2 class="h-5 w-5 text-brand-400" /> Proyecto particular, semillero, asistente de investigación, monitoria y pasantía</li>
          <li class="flex items-center gap-2.5"><CheckCircle2 class="h-5 w-5 text-brand-400" /> Validación de requisitos académicos y financieros</li>
          <li class="flex items-center gap-2.5"><CheckCircle2 class="h-5 w-5 text-brand-400" /> Seguimiento de la asignación de docente asesor</li>
        </ul>
      </div>

      <p class="relative text-xs text-slate-400">© 2026 {{ INSTITUCION.nombre }}</p>
    </aside>

    <!-- Formulario -->
    <main class="flex items-center justify-center px-4 py-12 sm:px-8">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="grid h-10 w-10 place-items-center rounded-lg bg-brand-400 text-ink"><GraduationCap class="h-5 w-5" /></span>
          <span class="text-lg font-extrabold">Sistema Integrado de Opciones de Grado</span>
        </div>

        <h2 class="text-2xl font-extrabold tracking-tight">Iniciar sesión</h2>
        <p class="mt-1 text-sm text-muted">Usa tus credenciales institucionales.</p>

        <div v-if="sessionExpired" class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Tu sesión expiró. Ingresa nuevamente.
        </div>

        <form class="mt-8 space-y-5" novalidate @submit.prevent="submit">
          <div>
            <label for="email" class="label">Correo institucional</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="email" v-model.trim="form.email" type="email" autocomplete="username" class="input pl-9" placeholder="usuario@estudiante.ibero.edu.co" />
            </div>
          </div>

          <div>
            <label for="password" class="label">Contraseña</label>
            <div class="relative">
              <Lock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="input px-9"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <p v-if="error" class="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700" role="alert">
            <AlertCircle class="h-4 w-4 shrink-0" /> {{ error }}
          </p>

          <BotonBase type="submit" size="lg" block :icon="LogIn" :loading="auth.loading">Ingresar</BotonBase>
        </form>

        <div v-if="USE_MOCK_DATA" class="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">Modo demostración · cuentas de prueba</p>
          <div class="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              v-for="acc in demoAccounts"
              :key="acc.role"
              type="button"
              class="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-left transition hover:border-brand-400 hover:bg-brand-50"
              @click="useDemo(acc)"
            >
              <component :is="acc.icon" class="h-4 w-4 text-slate-500" />
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-ink">{{ acc.role }}</span>
                <span class="block truncate text-[11px] text-muted">{{ acc.email }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
