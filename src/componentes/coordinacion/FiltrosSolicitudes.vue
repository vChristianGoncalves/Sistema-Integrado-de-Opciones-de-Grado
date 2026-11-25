<script setup>
import { Search, X, SlidersHorizontal } from 'lucide-vue-next'
import { useCoordinationStore } from '@/estado/estadoCoordinacion'
import { REQUEST_STATUS } from '@/utilidades/estados'
import { FACULTADES } from '@/utilidades/institucion'

const coord = useCoordinationStore()
</script>

<template>
  <div class="card p-4">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_auto]">
      <div class="relative md:col-span-2 xl:col-span-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <label for="filter-search" class="sr-only">Buscar</label>
        <input id="filter-search" v-model="coord.filters.search" type="search" class="input pl-9" placeholder="Radicado, nombre, ID, documento o NRC…" />
      </div>

      <div>
        <label for="filter-status" class="sr-only">Estado</label>
        <select id="filter-status" v-model="coord.filters.status" class="input">
          <option value="open">Por gestionar</option>
          <option value="all">Todos los estados</option>
          <option v-for="(meta, key) in REQUEST_STATUS" :key="key" :value="key">{{ meta.label }}</option>
        </select>
      </div>

      <div>
        <label for="filter-modality" class="sr-only">Modalidad</label>
        <select id="filter-modality" v-model="coord.filters.modalityId" class="input">
          <option value="all">Todas las modalidades</option>
          <option v-for="m in coord.modalities" :key="m.id" :value="m.id">{{ m.shortName ?? m.name }}</option>
        </select>
      </div>

      <div>
        <label for="filter-faculty" class="sr-only">Facultad</label>
        <select id="filter-faculty" v-model="coord.filters.facultyCode" class="input">
          <option value="all">Todas las facultades</option>
          <option v-for="f in FACULTADES" :key="f.codigo" :value="f.codigo">{{ f.codigo }} · {{ f.nombre.replace('Facultad de ', '') }}</option>
        </select>
      </div>

      <div>
        <label for="filter-period" class="sr-only">Periodo</label>
        <select id="filter-period" v-model="coord.filters.period" class="input">
          <option value="all">Todos los periodos</option>
          <option v-for="p in coord.periods" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <button
        type="button"
        class="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink disabled:opacity-40"
        :disabled="!coord.hasActiveFilters"
        @click="coord.resetFilters()"
      >
        <X class="h-4 w-4" /> Limpiar
      </button>
    </div>

    <p class="mt-3 flex items-center gap-1.5 text-xs text-muted">
      <SlidersHorizontal class="h-3.5 w-3.5" />
      {{ coord.filteredRequests.length }} resultado{{ coord.filteredRequests.length === 1 ? '' : 's' }}
    </p>
  </div>
</template>
