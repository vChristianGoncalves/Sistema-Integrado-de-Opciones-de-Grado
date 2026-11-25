<script setup>
import { LifeBuoy, Mail, Clock, ExternalLink, ChevronRight } from 'lucide-vue-next'
import { INSTITUCION, CONVOCATORIA, ENLACES } from '@/utilidades/institucion'

const links = [
  { label: 'Reglamento de Investigación (Res. 617 de 2024)', href: ENLACES.reglamento },
  { label: 'Conoce las modalidades de opción de grado', href: ENLACES.modalidades },
  { label: 'Plataforma OMP (registro y carga de avances)', href: ENLACES.omp },
]
</script>

<template>
  <section class="card p-6" aria-labelledby="help-title">
    <div class="flex items-center gap-3">
      <span class="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <LifeBuoy class="h-5 w-5" />
      </span>
      <div>
        <h3 id="help-title" class="font-bold text-ink">¿Necesitas ayuda?</h3>
        <p class="text-xs text-muted">{{ INSTITUCION.direccion }}</p>
      </div>
    </div>

    <ul class="mt-5 space-y-3 text-sm">
      <li class="flex items-center gap-2.5 text-slate-600">
        <Mail class="h-4 w-4 shrink-0 text-slate-400" />
        <a :href="`mailto:${INSTITUCION.correo}`" class="truncate hover:text-ink hover:underline">{{ INSTITUCION.correo }}</a>
      </li>
      <li class="flex items-center gap-2.5 text-slate-600">
        <Clock class="h-4 w-4 shrink-0 text-slate-400" /> {{ INSTITUCION.horario }}
      </li>
    </ul>

    <div class="mt-5 space-y-1 border-t border-slate-100 pt-4">
      <a
        v-for="l in links"
        :key="l.href"
        :href="l.href"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-slate-50"
      >
        <span class="flex items-center gap-2"><ExternalLink class="h-4 w-4 shrink-0 text-slate-400" /> {{ l.label }}</span>
        <ChevronRight class="h-4 w-4 shrink-0 text-slate-400" />
      </a>
    </div>

    <p class="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
      Fecha máxima de inscripción: <strong>{{ CONVOCATORIA.fechaLimiteTexto }}</strong>. {{ CONVOCATORIA.nota }}
    </p>
  </section>
</template>
