<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Eye, Inbox, GraduationCap, Wallet } from 'lucide-vue-next'
import EtiquetaEstado from '@/componentes/comun/EtiquetaEstado.vue'
import { formatDate, initials } from '@/utilidades/formato'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  pageSize: { type: Number, default: 8 },
  paginate: { type: Boolean, default: true },
  emptyTitle: { type: String, default: 'No hay solicitudes' },
  emptyText: { type: String, default: 'Ajusta los filtros o vuelve más tarde.' },
})

const emit = defineEmits(['select'])

const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)))
const visibleRows = computed(() =>
  props.paginate ? props.rows.slice((page.value - 1) * props.pageSize, page.value * props.pageSize) : props.rows,
)
const rangeLabel = computed(() => {
  if (!props.rows.length) return '0 resultados'
  const start = (page.value - 1) * props.pageSize + 1
  const end = Math.min(page.value * props.pageSize, props.rows.length)
  return `${start}–${end} de ${props.rows.length}`
})
const columns = computed(() => (props.compact ? 6 : 8))

const endorsementColor = {
  aprobado: 'text-emerald-600 bg-emerald-50',
  no_aprobado: 'text-rose-600 bg-rose-50',
  pendiente: 'text-amber-600 bg-amber-50',
}
const endorsementTitle = { aprobado: 'aprobado', no_aprobado: 'no aprobado', pendiente: 'pendiente' }

watch(
  () => props.rows.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)
</script>

<template>
  <div class="overflow-hidden">
    <div class="scrollbar-thin overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" class="whitespace-nowrap px-5 py-3">Radicado</th>
            <th scope="col" class="px-5 py-3">Estudiante</th>
            <th v-if="!compact" scope="col" class="px-5 py-3">Programa</th>
            <th scope="col" class="px-5 py-3">Modalidad</th>
            <th v-if="!compact" scope="col" class="whitespace-nowrap px-5 py-3">Periodo</th>
            <th scope="col" class="px-5 py-3">Avales</th>
            <th scope="col" class="px-5 py-3">Estado</th>
            <th scope="col" class="px-5 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 bg-white">
          <template v-if="loading">
            <tr v-for="n in 5" :key="n">
              <td v-for="c in columns" :key="c" class="px-5 py-4"><div class="h-4 animate-pulse rounded bg-slate-100" /></td>
            </tr>
          </template>

          <template v-else>
            <tr
              v-for="r in visibleRows"
              :key="r.id"
              class="group cursor-pointer transition hover:bg-brand-50/40"
              tabindex="0"
              @click="emit('select', r.id)"
              @keydown.enter="emit('select', r.id)"
            >
              <td class="whitespace-nowrap px-5 py-3.5">
                <p class="font-mono text-xs font-semibold text-ink">{{ r.radicado }}</p>
                <p class="text-[11px] text-muted">{{ formatDate(r.submittedAt) }}</p>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 sm:grid">
                    {{ initials(r.studentName) }}
                  </span>
                  <div class="min-w-0">
                    <p class="max-w-[220px] truncate font-medium text-ink">{{ r.studentName }}</p>
                    <p class="text-xs text-muted">ID {{ r.studentCode }}</p>
                  </div>
                </div>
              </td>
              <td v-if="!compact" class="px-5 py-3.5">
                <p class="max-w-[200px] truncate text-slate-700">{{ r.program }}</p>
                <p class="text-xs text-muted">{{ r.facultyCode }} · {{ r.studyMode }}</p>
              </td>
              <td class="px-5 py-3.5 text-slate-600"><span class="line-clamp-2 max-w-[220px]">{{ r.modalityName }}</span></td>
              <td v-if="!compact" class="whitespace-nowrap px-5 py-3.5 text-slate-600">{{ r.period }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1.5">
                  <span
                    :class="['grid h-7 w-7 place-items-center rounded-md', endorsementColor[r.academicEndorsement]]"
                    :title="`Aval académico: ${endorsementTitle[r.academicEndorsement]}`"
                  >
                    <GraduationCap class="h-4 w-4" />
                  </span>
                  <span
                    :class="['grid h-7 w-7 place-items-center rounded-md', endorsementColor[r.financialEndorsement]]"
                    :title="`Aval financiero: ${endorsementTitle[r.financialEndorsement]}`"
                  >
                    <Wallet class="h-4 w-4" />
                  </span>
                </div>
              </td>
              <td class="px-5 py-3.5"><EtiquetaEstado :status="r.status" /></td>
              <td class="px-5 py-3.5 text-right">
                <span class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition group-hover:bg-white group-hover:text-ink group-hover:shadow-sm">
                  <Eye class="h-3.5 w-3.5" /> Ver
                </span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && !rows.length" class="flex flex-col items-center px-6 py-14 text-center">
      <span class="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"><Inbox class="h-6 w-6" /></span>
      <p class="mt-3 font-semibold text-ink">{{ emptyTitle }}</p>
      <p class="mt-1 text-sm text-muted">{{ emptyText }}</p>
    </div>

    <div v-if="paginate && !loading && rows.length > pageSize" class="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm">
      <p class="text-muted">{{ rangeLabel }}</p>
      <div class="flex items-center gap-1">
        <button type="button" class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40" :disabled="page === 1" aria-label="Página anterior" @click="page--">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="px-2 text-xs font-medium text-slate-600">{{ page }} / {{ totalPages }}</span>
        <button type="button" class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40" :disabled="page === totalPages" aria-label="Página siguiente" @click="page++">
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
