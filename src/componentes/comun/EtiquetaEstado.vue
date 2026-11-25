<script setup>
import { computed } from 'vue'
import { STATUS_CATALOGS } from '@/utilidades/estados'

const props = defineProps({
  /** success | warning | danger | info | neutral | brand */
  variant: { type: String, default: 'neutral' },
  label: { type: String, default: '' },
  /** Atajo: resuelve etiqueta y color desde los catálogos de estado. */
  status: { type: String, default: '' },
  /** request | requirement | document */
  kind: { type: String, default: 'request' },
  dot: { type: Boolean, default: true },
  size: { type: String, default: 'md' },
})

const resolved = computed(() => (props.status ? STATUS_CATALOGS[props.kind]?.[props.status] : null))
const tone = computed(() => resolved.value?.variant ?? props.variant)
const text = computed(() => props.label || resolved.value?.label || props.status)

const styles = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  brand: 'bg-brand-50 text-brand-700 ring-brand-500/30',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}
const dots = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  brand: 'bg-brand-500',
  neutral: 'bg-slate-400',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      styles[tone] ?? styles.neutral,
    ]"
  >
    <span v-if="dot" :class="['h-1.5 w-1.5 rounded-full', dots[tone] ?? dots.neutral]" aria-hidden="true" />
    <slot>{{ text }}</slot>
  </span>
</template>
