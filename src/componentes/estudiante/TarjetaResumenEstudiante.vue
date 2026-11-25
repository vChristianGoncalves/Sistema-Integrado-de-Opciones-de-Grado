<script setup>
import { computed } from 'vue'
import { BookMarked, FlaskConical, Sprout, Wallet, Building2 } from 'lucide-vue-next'
import EtiquetaEstado from '@/componentes/comun/EtiquetaEstado.vue'
import { initials } from '@/utilidades/formato'

const props = defineProps({
  profile: { type: Object, default: null },
})

const progress = computed(() => props.profile?.academicProgress ?? 0)
const courseStatus = { cursando: 'Cursando', aprobado: 'Aprobado', pendiente: 'Sin cursar' }
</script>

<template>
  <section class="card overflow-hidden" aria-label="Resumen académico">
    <div v-if="!profile" class="animate-pulse space-y-4 p-6">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 rounded-full bg-slate-200" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-3/4 rounded bg-slate-200" />
          <div class="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
      <div class="h-20 rounded-lg bg-slate-100" />
    </div>

    <template v-else>
      <div class="bg-gradient-to-br from-brand-50 via-white to-white p-6">
        <div class="flex items-center gap-3">
          <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-400 text-base font-bold text-ink ring-4 ring-white">
            {{ initials(profile.fullName) }}
          </span>
          <div class="min-w-0">
            <p class="truncate font-bold text-ink">{{ profile.fullName }}</p>
            <p class="text-xs text-muted">ID {{ profile.code }}</p>
          </div>
        </div>
        <dl class="mt-4 space-y-1.5 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Programa</dt>
            <dd class="text-right font-medium text-ink">{{ profile.program }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="flex items-center gap-1 text-muted"><Building2 class="h-3.5 w-3.5" /> Facultad</dt>
            <dd class="text-right font-medium text-ink">{{ profile.facultyCode }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Modalidad de estudio</dt>
            <dd class="font-medium text-ink">{{ profile.studyMode }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Periodo</dt>
            <dd class="font-medium text-ink">{{ profile.academicPeriod }}</dd>
          </div>
        </dl>
      </div>

      <div class="space-y-4 border-t border-slate-100 p-6">
        <div>
          <div class="mb-1.5 flex items-center justify-between text-sm">
            <span class="flex items-center gap-1.5 text-muted"><BookMarked class="h-4 w-4" /> Avance académico</span>
            <span class="font-semibold text-ink">{{ progress }} %</span>
          </div>
          <div class="relative h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
            <div class="h-full rounded-full bg-brand-400" :style="{ width: `${progress}%` }" />
            <span class="absolute inset-y-0 left-[60%] w-0.5 bg-slate-400" title="Mínimo 60 %" />
          </div>
          <p class="mt-1 text-right text-xs text-muted">Mínimo para iniciar: 60 %</p>
        </div>

        <div class="rounded-lg border border-slate-200 p-3">
          <p class="text-xs text-muted">Promedio ponderado</p>
          <p class="mt-0.5 text-xl font-bold text-ink">{{ profile.gpa.toFixed(1).replace('.', ',') }}</p>
        </div>

        <ul class="space-y-2.5 text-sm">
          <li class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 text-muted"><FlaskConical class="h-4 w-4" /> {{ profile.researchCourse }}</span>
            <EtiquetaEstado
              :variant="profile.researchCourseStatus === 'pendiente' ? 'danger' : 'success'"
              :label="courseStatus[profile.researchCourseStatus]"
              size="sm"
            />
          </li>
          <li class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 text-muted"><Sprout class="h-4 w-4" /> Semillero</span>
            <EtiquetaEstado
              :variant="profile.seedbedPeriods >= 2 ? 'success' : 'neutral'"
              :label="profile.seedbedPeriods ? `${profile.seedbedPeriods} periodo(s)` : 'No vinculado'"
              size="sm"
            />
          </li>
          <li class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 text-muted"><Wallet class="h-4 w-4" /> Aval financiero</span>
            <EtiquetaEstado variant="warning" label="Lo valida el programa" size="sm" />
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>
