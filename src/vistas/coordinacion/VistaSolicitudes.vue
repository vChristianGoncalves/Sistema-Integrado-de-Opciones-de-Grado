<script setup>
import { Download, RefreshCw, AlertTriangle } from 'lucide-vue-next'
import BotonBase from '@/componentes/comun/BotonBase.vue'
import FiltrosSolicitudes from '@/componentes/coordinacion/FiltrosSolicitudes.vue'
import TablaSolicitudes from '@/componentes/coordinacion/TablaSolicitudes.vue'
import PanelDetalleSolicitud from '@/componentes/coordinacion/PanelDetalleSolicitud.vue'
import { useCoordinationStore } from '@/estado/estadoCoordinacion'
import { REQUEST_STATUS, ENDORSEMENT_STATUS } from '@/utilidades/estados'

const coord = useCoordinationStore()

/** Exporta con la misma estructura de las bases consolidadas que se remiten a los programas. */
function exportCsv() {
  const header = [
    'ASIGNATURA', 'NOMBRES', 'ID', 'CORREO INSTITUCIONAL', 'FACULTAD', 'PROGRAMA ACADÉMICO', 'MODALIDAD DE ESTUDIO',
    'NOTAS', 'MODALIDAD INVESTIGATIVA', 'NRC', 'PERIODO ACTIVO', 'AVAL PROGRAMA ACADÉMICO', 'AVAL FINANCIERO',
    'DOCENTE ASESOR', 'ESTADO', 'RADICADO',
  ]
  const rows = coord.filteredRequests.map((r) => [
    r.course ?? '',
    r.studentName,
    r.studentCode,
    r.studentEmail,
    r.facultyCode,
    r.program,
    r.studyMode,
    r.researchGrade ? String(r.researchGrade).replace('.', ',') : '',
    r.modalityName,
    r.nrc ?? '',
    r.period,
    ENDORSEMENT_STATUS[r.academicEndorsement]?.label ?? '',
    ENDORSEMENT_STATUS[r.financialEndorsement]?.label ?? '',
    r.advisor ?? '',
    REQUEST_STATUS[r.status]?.label ?? r.status,
    r.radicado,
  ])
  const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `base-opcion-de-grado-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="mt-1 text-sm text-muted">Consolida, valida avales y asigna docente asesor a las preinscripciones de opción de grado.</p>
      </div>
      <div class="flex gap-2">
        <BotonBase variant="secondary" :icon="RefreshCw" :loading="coord.loading" @click="coord.fetchRequests({ force: true })">Actualizar</BotonBase>
        <BotonBase variant="secondary" :icon="Download" :disabled="!coord.filteredRequests.length" @click="exportCsv">Exportar base</BotonBase>
      </div>
    </div>

    <div v-if="coord.error" class="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <AlertTriangle class="h-4 w-4" /> {{ coord.error }}
    </div>

    <FiltrosSolicitudes />

    <section class="card overflow-hidden">
      <TablaSolicitudes
        :rows="coord.filteredRequests"
        :loading="coord.loading"
        empty-title="No hay solicitudes con estos filtros"
        empty-text="Prueba cambiando el estado o limpiando la búsqueda."
        @select="coord.openDetail"
      />
    </section>

    <PanelDetalleSolicitud />
  </div>
</template>
