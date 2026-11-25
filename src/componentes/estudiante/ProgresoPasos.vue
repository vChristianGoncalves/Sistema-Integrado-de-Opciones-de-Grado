<script setup>
import { Check } from 'lucide-vue-next'

const props = defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, required: true },
  maxReached: { type: Number, default: 1 },
})

const emit = defineEmits(['go'])

function stateOf(id) {
  if (id < props.current) return 'done'
  if (id === props.current) return 'current'
  return id <= props.maxReached ? 'reachable' : 'upcoming'
}

const circle = {
  done: 'border-brand-400 bg-brand-400 text-ink',
  current: 'border-brand-400 bg-white text-ink ring-4 ring-brand-100',
  reachable: 'border-slate-300 bg-white text-slate-600 group-hover:border-brand-400',
  upcoming: 'border-slate-200 bg-white text-slate-400',
}
</script>

<template>
  <nav aria-label="Progreso de la inscripción">
    <!-- Móvil -->
    <div class="sm:hidden">
      <div class="flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted">Paso {{ current }} de {{ steps.length }}</p>
        <p class="text-xs text-muted">{{ steps[current - 1]?.description }}</p>
      </div>
      <p class="mt-1 text-base font-bold text-ink">{{ steps[current - 1]?.title }}</p>
      <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div class="h-full rounded-full bg-brand-400 transition-all duration-500" :style="{ width: `${(current / steps.length) * 100}%` }" />
      </div>
    </div>

    <!-- Escritorio -->
    <ol class="hidden items-start sm:flex">
      <li v-for="(step, i) in steps" :key="step.id" class="relative flex-1">
        <div
          v-if="i < steps.length - 1"
          class="absolute top-5 h-0.5 rounded-full transition-colors duration-500"
          :class="step.id < current ? 'bg-brand-400' : 'bg-slate-200'"
          style="left: calc(50% + 1.75rem); width: calc(100% - 3.5rem)"
          aria-hidden="true"
        />
        <button
          type="button"
          class="group flex w-full flex-col items-center px-2 text-center disabled:cursor-default"
          :disabled="step.id > maxReached || step.id === current"
          :aria-current="step.id === current ? 'step' : undefined"
          @click="emit('go', step.id)"
        >
          <span
            :class="[
              'grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-300',
              circle[stateOf(step.id)],
            ]"
          >
            <Check v-if="stateOf(step.id) === 'done'" class="h-5 w-5" stroke-width="3" />
            <template v-else>{{ step.id }}</template>
          </span>
          <span
            :class="[
              'mt-2.5 text-sm font-semibold',
              stateOf(step.id) === 'upcoming' ? 'text-slate-400' : 'text-ink',
            ]"
          >
            {{ step.title }}
          </span>
          <span class="mt-0.5 hidden text-xs text-muted md:block">{{ step.description }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>
