<script setup>
import { computed } from 'vue'
import { CheckCircle2, XCircle, Clock, ShieldCheck, ShieldAlert, Info, Flag } from 'lucide-vue-next'
import EtiquetaEstado from '@/componentes/comun/EtiquetaEstado.vue'
import { useInscriptionStore } from '@/estado/estadoInscripcion'

const store = useInscriptionStore()

const icons = {
  cumple: { icon: CheckCircle2, cls: 'text-emerald-500 bg-emerald-50' },
  no_cumple: { icon: XCircle, cls: 'text-rose-500 bg-rose-50' },
  pendiente: { icon: Clock, cls: 'text-amber-500 bg-amber-50' },
}

const metCount = computed(() => store.evaluatedRequirements.filter((r) => r.status === 'cumple').length)
</script>

<template>
  <section>
    <header class="mb-6">
      <h2 class="section-title">Verificación de requisitos</h2>
      <p class="section-subtitle">
        Validamos tu información académica contra los requisitos de
        <strong class="font-semibold text-ink">{{ store.selectedModality?.name }}</strong>.
      </p>
    </header>

    <div v-if="store.requirementsOk" class="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status">
      <ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      <div>
        <p class="text-sm font-semibold text-emerald-800">Puedes continuar con la preinscripción</p>
        <p class="mt-0.5 text-sm text-emerald-700">
          {{ metCount }} de {{ store.evaluatedRequirements.length }} requisitos validados automáticamente.
          <template v-if="store.manualRequirements.length">
            {{ store.manualRequirements.length }} se validará{{ store.manualRequirements.length > 1 ? 'n' : '' }} después de cerrar la inscripción
            (programa académico y Coordinación de Investigación y Creación).
          </template>
        </p>
      </div>
    </div>

    <div v-else class="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">
      <ShieldAlert class="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
      <div>
        <p class="text-sm font-semibold text-rose-800">No es posible continuar con esta modalidad</p>
        <p class="mt-0.5 text-sm text-rose-700">
          Tienes {{ store.blockingRequirements.length }} requisito{{ store.blockingRequirements.length > 1 ? 's' : '' }} sin cumplir.
          Regresa al paso anterior y elige otra modalidad. Si no eres aceptado en la opción seleccionada, podrás participar como asistente de
          proyecto de investigación docente según disponibilidad (art. 28, parágrafo 5).
        </p>
      </div>
    </div>

    <ul class="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
      <li v-for="req in store.evaluatedRequirements" :key="req.id" class="flex items-start gap-4 bg-white p-4 sm:items-center">
        <span :class="['grid h-9 w-9 shrink-0 place-items-center rounded-full', icons[req.status].cls]">
          <component :is="icons[req.status].icon" class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-ink">{{ req.name }}</p>
          <p class="mt-0.5 text-xs text-muted">{{ req.description }}</p>
          <p class="mt-1 text-xs font-medium text-slate-600">{{ req.detail }}</p>
          <p class="mt-0.5 text-[11px] text-slate-400">{{ req.source }}</p>
        </div>
        <EtiquetaEstado :status="req.status" kind="requirement" class="shrink-0" />
      </li>
    </ul>

    <div v-if="store.selectedModality?.finalRequirements?.length" class="mt-6 rounded-xl bg-slate-50 p-5">
      <p class="flex items-center gap-2 text-sm font-semibold text-ink"><Flag class="h-4 w-4 text-slate-400" /> Requisitos de finalización de esta modalidad</p>
      <p class="mt-1 text-xs text-muted">Informativo: se entregan al terminar la opción de grado, a través de OMP. Nota mínima aprobatoria: 3,5.</p>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li v-for="item in store.selectedModality.finalRequirements" :key="item">{{ item }}</li>
      </ul>
    </div>

    <p class="mt-4 flex items-start gap-2 text-xs text-muted">
      <Info class="mt-px h-3.5 w-3.5 shrink-0" />
      La información proviene del sistema académico. Si detectas inconsistencias, comunícate con tu programa antes de radicar.
    </p>
  </section>
</template>
