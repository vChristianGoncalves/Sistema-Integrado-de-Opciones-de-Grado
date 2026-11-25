<script setup>
import { ref, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Send, CheckCircle2, AlertTriangle, RotateCcw, Copy, Check } from 'lucide-vue-next'
import BotonBase from '@/componentes/comun/BotonBase.vue'
import EtiquetaEstado from '@/componentes/comun/EtiquetaEstado.vue'
import ModalBase from '@/componentes/comun/ModalBase.vue'
import ProgresoPasos from '@/componentes/estudiante/ProgresoPasos.vue'
import TarjetaResumenEstudiante from '@/componentes/estudiante/TarjetaResumenEstudiante.vue'
import TarjetaAyuda from '@/componentes/estudiante/TarjetaAyuda.vue'
import RutaProceso from '@/componentes/estudiante/RutaProceso.vue'
import Paso1Modalidad from '@/componentes/estudiante/Paso1Modalidad.vue'
import Paso2Requisitos from '@/componentes/estudiante/Paso2Requisitos.vue'
import Paso3Datos from '@/componentes/estudiante/Paso3Datos.vue'
import Paso4Confirmacion from '@/componentes/estudiante/Paso4Confirmacion.vue'
import { useInscriptionStore, INSCRIPTION_STEPS } from '@/estado/estadoInscripcion'
import { formatDateTime } from '@/utilidades/formato'
import { INSTITUCION, CONVOCATORIA, ENLACES } from '@/utilidades/institucion'

const store = useInscriptionStore()
const stepComponents = { 1: Paso1Modalidad, 2: Paso2Requisitos, 3: Paso3Datos, 4: Paso4Confirmacion }

const confirmOpen = ref(false)
const copied = ref(false)

onMounted(() => {
  if (!store.initialized) store.init()
})

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

function onNext() {
  if (store.nextStep()) scrollTop()
}
function onPrev() {
  store.prevStep()
  scrollTop()
}
function onGo(step) {
  store.goToStep(step)
  scrollTop()
}
function askConfirm() {
  if (store.validateStep(4)) confirmOpen.value = true
}
async function onSubmit() {
  await store.submit()
  confirmOpen.value = false
  scrollTop()
}
async function copyRadicado() {
  try {
    await navigator.clipboard.writeText(store.result.radicado)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    /* sin permisos de portapapeles */
  }
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-brand-700">{{ INSTITUCION.coordinacion }} · {{ CONVOCATORIA.periodos }}</p>
        <h1 class="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Inscripción a opción de grado en modalidad investigativa</h1>
        <p class="mt-2 max-w-3xl text-sm text-muted">
          Esta inscripción es de carácter obligatorio para los estudiantes de pregrado que cursan Procesos Investigativos o Trabajo de Grado I.
        </p>
      </div>
      <EtiquetaEstado variant="warning" :label="`Fecha máxima: ${CONVOCATORIA.fechaLimiteTexto}`" />
    </div>

    <!-- Carga -->
    <div v-if="store.loading" class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <div class="card h-28 animate-pulse bg-slate-50" />
        <div class="card h-96 animate-pulse bg-slate-50" />
      </div>
      <div class="card h-80 animate-pulse bg-slate-50" />
    </div>

    <!-- Error de carga -->
    <div v-else-if="store.loadError" class="card flex flex-col items-center p-10 text-center">
      <span class="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-500"><AlertTriangle class="h-6 w-6" /></span>
      <p class="mt-4 font-semibold">No pudimos cargar tu información</p>
      <p class="mt-1 text-sm text-muted">{{ store.loadError }}</p>
      <BotonBase class="mt-6" variant="secondary" :icon="RotateCcw" @click="store.init()">Reintentar</BotonBase>
    </div>

    <!-- Éxito -->
    <div v-else-if="store.result" class="grid items-start gap-6 lg:grid-cols-3">
      <div class="card overflow-hidden text-center lg:col-span-2">
        <div class="bg-gradient-to-b from-emerald-50 to-white px-6 pb-6 pt-10">
          <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
            <CheckCircle2 class="h-8 w-8" />
          </span>
          <h2 class="mt-6 text-2xl font-extrabold">¡Preinscripción radicada!</h2>
          <p class="mx-auto mt-2 max-w-md text-sm text-muted">
            Registraste la modalidad <strong class="text-ink">{{ store.selectedModality?.name }}</strong>. La
            {{ INSTITUCION.coordinacion }} consolidará tu información y la remitirá a tu programa para la validación.
          </p>
        </div>

        <div class="mx-6 mb-6 rounded-xl border border-slate-200 p-5 text-left">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs text-muted">Número de radicado</p>
              <p class="font-mono text-xl font-bold tracking-wide">{{ store.result.radicado }}</p>
            </div>
            <BotonBase variant="secondary" size="sm" :icon="copied ? Check : Copy" @click="copyRadicado">
              {{ copied ? 'Copiado' : 'Copiar' }}
            </BotonBase>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm">
            <span class="flex items-center gap-2 text-muted">Estado: <EtiquetaEstado :status="store.result.status" /></span>
            <span class="text-muted">Fecha: <span class="font-medium text-ink">{{ formatDateTime(store.result.submittedAt) }}</span></span>
          </div>
        </div>

        <div class="mx-6 mb-8 rounded-xl bg-slate-50 p-5 text-left text-sm">
          <p class="font-semibold">¿Qué sigue?</p>
          <ol class="mt-2 list-decimal space-y-1.5 pl-5 text-slate-600">
            <li>Al cerrar la inscripción, tu programa valida el estado académico (aval académico) y el aval financiero.</li>
            <li>La Coordinación asigna el docente asesor y solicita la creación del aula virtual.</li>
            <li>Recibirás en {{ store.profile?.email }} la asignación, los formatos y la ruta de tu modalidad.</li>
            <li>
              Crea tu usuario en la plataforma
              <a :href="ENLACES.omp" target="_blank" rel="noopener noreferrer" class="font-semibold text-brand-700 underline">OMP</a>:
              allí cargarás la ficha y los avances. Crea un solo caso para todo el proceso.
            </li>
          </ol>
        </div>

        <div class="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <BotonBase variant="secondary" :icon="RotateCcw" @click="store.reset()">Volver al inicio</BotonBase>
        </div>
      </div>
      <aside class="space-y-6"><RutaProceso :current="4" /></aside>
    </div>

    <!-- Asistente -->
    <div v-else class="grid items-start gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <div class="card p-5 sm:p-6">
          <ProgresoPasos :steps="INSCRIPTION_STEPS" :current="store.currentStep" :max-reached="store.maxReachedStep" @go="onGo" />
        </div>

        <div class="card p-5 sm:p-8">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <component :is="stepComponents[store.currentStep]" :key="store.currentStep" />
          </Transition>

          <div v-if="store.submitError" class="mt-6 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" /> {{ store.submitError }}
          </div>

          <div class="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <BotonBase v-if="store.currentStep > 1" variant="secondary" :icon="ChevronLeft" @click="onPrev">Anterior</BotonBase>
            <span v-else />

            <BotonBase
              v-if="store.currentStep < INSCRIPTION_STEPS.length"
              :icon-right="ChevronRight"
              :disabled="store.currentStep === 2 && !store.requirementsOk"
              @click="onNext"
            >
              Continuar
            </BotonBase>
            <BotonBase v-else :icon="Send" :loading="store.submitting" @click="askConfirm">Radicar preinscripción</BotonBase>
          </div>
        </div>
      </div>

      <aside class="space-y-6 lg:sticky lg:top-24">
        <TarjetaResumenEstudiante :profile="store.profile" />
        <TarjetaAyuda />
        <RutaProceso :current="store.currentStep === 1 ? 3 : 2" />
      </aside>
    </div>

    <ModalBase
      v-model:open="confirmOpen"
      :icon="Send"
      title="¿Confirmas el envío de tu preinscripción?"
      description="Solo puedes inscribir una opción de grado. Una vez radicada no podrás modificarla a menos que la Coordinación solicite ajustes."
      :persistent="store.submitting"
    >
      <div class="rounded-lg bg-slate-50 p-4 text-sm">
        <p class="text-xs text-muted">Modalidad seleccionada</p>
        <p class="font-semibold text-ink">{{ store.selectedModality?.name }}</p>
      </div>
      <template #footer>
        <BotonBase variant="secondary" :disabled="store.submitting" @click="confirmOpen = false">Revisar de nuevo</BotonBase>
        <BotonBase :icon="Send" :loading="store.submitting" @click="onSubmit">Sí, radicar</BotonBase>
      </template>
    </ModalBase>
  </div>
</template>
