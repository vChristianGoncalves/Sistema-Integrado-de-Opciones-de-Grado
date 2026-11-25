<script setup>
import { Lightbulb, Sprout, Users, BookOpenCheck, Plane, Microscope, GraduationCap, Clock, UserPlus, CheckCircle2, AlertCircle, Scale } from 'lucide-vue-next'
import EtiquetaEstado from '@/componentes/comun/EtiquetaEstado.vue'
import { useInscriptionStore } from '@/estado/estadoInscripcion'

const store = useInscriptionStore()
const icons = { Lightbulb, Sprout, Users, BookOpenCheck, Plane, Microscope }

const hasLimit = (m) => m.slots !== null && m.slots !== undefined
const available = (m) => (hasLimit(m) ? Math.max(m.slots - m.slotsTaken, 0) : Infinity)
</script>

<template>
  <section>
    <header class="mb-6">
      <h2 class="section-title">Selecciona tu modalidad de opción de grado</h2>
      <p class="section-subtitle">
        Estas son las modalidades investigativas definidas en el Reglamento de Investigación (Res. 617 de 2024) para tu nivel de formación.
        Solo puedes inscribir y desarrollar <strong class="text-ink">una</strong> opción de grado.
      </p>
    </header>

    <div role="radiogroup" aria-label="Modalidades de opción de grado" class="grid gap-4 md:grid-cols-2">
      <button
        v-for="m in store.availableModalities"
        :key="m.id"
        type="button"
        role="radio"
        :aria-checked="store.form.modalityId === m.id"
        :disabled="available(m) === 0"
        :class="[
          'group relative flex flex-col rounded-xl border-2 p-5 text-left transition-all duration-150',
          'disabled:cursor-not-allowed disabled:opacity-60',
          store.form.modalityId === m.id
            ? 'border-brand-400 bg-brand-50/50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm',
        ]"
        @click="store.selectModality(m.id)"
      >
        <div class="flex items-start justify-between gap-3">
          <span
            :class="[
              'grid h-11 w-11 place-items-center rounded-lg transition',
              store.form.modalityId === m.id ? 'bg-brand-400 text-ink' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-100',
            ]"
          >
            <component :is="icons[m.icon] ?? GraduationCap" class="h-5 w-5" />
          </span>
          <CheckCircle2 v-if="store.form.modalityId === m.id" class="h-6 w-6 text-brand-500" />
          <EtiquetaEstado v-else-if="available(m) === 0" variant="danger" label="Sin cupos" size="sm" />
          <EtiquetaEstado v-else-if="hasLimit(m)" variant="warning" :label="`${available(m)} cupos disponibles`" size="sm" />
        </div>

        <h3 class="mt-4 font-bold text-ink">{{ m.name }}</h3>
        <p class="mt-1 text-sm leading-relaxed text-muted">{{ m.description }}</p>

        <div class="mt-auto space-y-1 pt-4 text-xs text-slate-500">
          <p class="flex items-center gap-1.5"><Clock class="h-3.5 w-3.5" /> {{ m.duration }}</p>
          <p class="flex items-center gap-1.5"><UserPlus class="h-3.5 w-3.5" /> {{ m.members }}</p>
          <p class="flex items-center gap-1.5"><Scale class="h-3.5 w-3.5" /> {{ m.legalBasis }}</p>
        </div>
      </button>
    </div>

    <p v-if="store.errors.modalityId" class="mt-4 flex items-center gap-1.5 text-sm font-medium text-rose-600" role="alert">
      <AlertCircle class="h-4 w-4" /> {{ store.errors.modalityId }}
    </p>
  </section>
</template>
