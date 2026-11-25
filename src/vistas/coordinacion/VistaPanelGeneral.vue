<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { FileStack, Hourglass, CheckCircle2, UserX, ArrowRight, AlertTriangle, RotateCcw } from 'lucide-vue-next'
import TarjetaIndicador from '@/componentes/coordinacion/TarjetaIndicador.vue'
import TablaSolicitudes from '@/componentes/coordinacion/TablaSolicitudes.vue'
import PanelDetalleSolicitud from '@/componentes/coordinacion/PanelDetalleSolicitud.vue'
import BotonBase from '@/componentes/comun/BotonBase.vue'
import { useCoordinationStore } from '@/estado/estadoCoordinacion'
import { CONVOCATORIA } from '@/utilidades/institucion'

const coord = useCoordinationStore()

const maxByModality = computed(() => Math.max(1, ...coord.byModality.map((m) => m.count)))
const maxByFaculty = computed(() => Math.max(1, ...coord.byFaculty.map((f) => f.count)))

const statusColors = {
  pendiente: 'bg-amber-400',
  en_revision: 'bg-amber-200',
  devuelta: 'bg-sky-400',
  aprobada: 'bg-emerald-500',
  rechazada: 'bg-rose-400',
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="coord.error" class="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <span class="flex items-center gap-2"><AlertTriangle class="h-4 w-4" /> {{ coord.error }}</span>
      <BotonBase size="sm" variant="secondary" :icon="RotateCcw" @click="coord.fetchRequests({ force: true })">Reintentar</BotonBase>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores">
      <TarjetaIndicador label="Preinscripciones" :value="coord.kpis.total" :icon="FileStack" tone="brand" :hint="CONVOCATORIA.periodos" :loading="coord.loading" />
      <TarjetaIndicador label="Por gestionar" :value="coord.kpis.open" :icon="Hourglass" tone="warning" hint="Preinscritas y en validación" :loading="coord.loading" />
      <TarjetaIndicador label="Aprobadas y asignadas" :value="coord.kpis.approved" :icon="CheckCircle2" tone="success" :hint="`Tasa de aprobación: ${coord.kpis.approvalRate} %`" :loading="coord.loading" />
      <TarjetaIndicador label="Sin docente asesor" :value="coord.kpis.withoutAdvisor" :icon="UserX" tone="danger" :hint="`${coord.kpis.rejected} no cumplen · ${coord.kpis.returned} con ajustes`" :loading="coord.loading" />
    </section>

    <div class="grid gap-6 xl:grid-cols-3">
      <section class="card p-6">
        <header class="mb-5">
          <h2 class="font-bold text-ink">Por modalidad</h2>
          <p class="text-sm text-muted">Preinscripciones por modalidad investigativa.</p>
        </header>
        <ul class="space-y-4">
          <li v-for="m in coord.byModality" :key="m.id">
            <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span class="font-medium text-ink">{{ m.name }}</span>
              <span class="text-xs text-muted">
                <strong class="text-sm text-ink">{{ m.count }}</strong>
                <template v-if="m.slots"> · {{ m.slotsTaken }}/{{ m.slots }} cupos</template>
              </span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div class="h-full rounded-full bg-brand-400 transition-all duration-700" :style="{ width: `${(m.count / maxByModality) * 100}%` }" />
            </div>
          </li>
        </ul>
      </section>

      <section class="card p-6">
        <header class="mb-5">
          <h2 class="font-bold text-ink">Por facultad</h2>
          <p class="text-sm text-muted">Bases consolidadas por facultad.</p>
        </header>
        <ul class="space-y-4">
          <li v-for="f in coord.byFaculty" :key="f.codigo">
            <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span class="min-w-0">
                <span class="font-medium text-ink">{{ f.codigo }}</span>
                <span class="ml-1 text-xs text-muted">{{ f.modalidad }} · {{ f.periodos.join(', ') }}</span>
              </span>
              <strong class="text-sm text-ink">{{ f.count }}</strong>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div class="h-full rounded-full bg-slate-700 transition-all duration-700" :style="{ width: `${(f.count / maxByFaculty) * 100}%` }" />
            </div>
          </li>
        </ul>
      </section>

      <section class="card p-6">
        <header class="mb-5">
          <h2 class="font-bold text-ink">Por estado</h2>
          <p class="text-sm text-muted">Composición del flujo de validación.</p>
        </header>
        <div v-if="coord.kpis.total" class="flex h-3 overflow-hidden rounded-full bg-slate-100">
          <div v-for="s in coord.byStatus" :key="s.key" :class="statusColors[s.key]" :style="{ width: `${(s.count / coord.kpis.total) * 100}%` }" :title="`${s.label}: ${s.count}`" />
        </div>
        <ul class="mt-5 space-y-3">
          <li v-for="s in coord.byStatus" :key="s.key" class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2.5 text-slate-600"><span :class="['h-2.5 w-2.5 rounded-full', statusColors[s.key]]" /> {{ s.label }}</span>
            <span class="flex items-center gap-3">
              <span class="text-xs text-muted">{{ coord.kpis.total ? Math.round((s.count / coord.kpis.total) * 100) : 0 }} %</span>
              <span class="w-6 text-right font-semibold text-ink">{{ s.count }}</span>
            </span>
          </li>
        </ul>
      </section>
    </div>

    <section class="card overflow-hidden">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 class="font-bold text-ink">Preinscripciones recientes</h2>
          <p class="text-sm text-muted">Últimos registros del formulario de opción de grado.</p>
        </div>
        <RouterLink :to="{ name: 'admin-requests' }" class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50">
          Ver bandeja completa <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </header>
      <TablaSolicitudes :rows="coord.recentRequests" :loading="coord.loading" compact :paginate="false" @select="coord.openDetail" />
    </section>

    <PanelDetalleSolicitud />
  </div>
</template>
