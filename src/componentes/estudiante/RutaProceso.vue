<script setup>
import { Route } from 'lucide-vue-next'
import { RUTA_PROCESO } from '@/utilidades/institucion'

defineProps({
  /** Paso de la ruta en el que se encuentra el estudiante (1-based). 0 = ninguno resaltado. */
  current: { type: Number, default: 0 },
})
</script>

<template>
  <section class="card p-6" aria-labelledby="route-title">
    <div class="flex items-center gap-3">
      <span class="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600"><Route class="h-5 w-5" /></span>
      <div>
        <h3 id="route-title" class="font-bold text-ink">Ruta de opción de grado</h3>
        <p class="text-xs text-muted">Modalidad investigativa · pregrado</p>
      </div>
    </div>

    <ol class="relative mt-5 space-y-4 border-l border-slate-200 pl-5">
      <li v-for="(step, i) in RUTA_PROCESO" :key="step.titulo" class="relative">
        <span
          :class="[
            'absolute -left-[29px] top-0 grid h-[18px] w-[18px] place-items-center rounded-full text-[10px] font-bold ring-4 ring-white',
            i + 1 < current ? 'bg-brand-400 text-ink' : i + 1 === current ? 'bg-ink text-white' : 'bg-slate-200 text-slate-500',
          ]"
        >
          {{ i + 1 }}
        </span>
        <p :class="['text-sm font-semibold', i + 1 === current ? 'text-ink' : 'text-slate-700']">{{ step.titulo }}</p>
        <p class="mt-0.5 text-xs leading-relaxed text-muted">{{ step.detalle }}</p>
      </li>
    </ol>
  </section>
</template>
