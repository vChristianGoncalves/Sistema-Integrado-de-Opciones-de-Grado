<script setup>
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger | success | outline-danger
  size: { type: String, default: 'md' }, // sm | md | lg
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  iconRight: { type: [Object, Function], default: null },
})

const variants = {
  primary: 'bg-brand-400 text-ink hover:bg-brand-500 active:bg-brand-600 shadow-sm',
  secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-ink',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm',
  'outline-danger': 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
  variants[props.variant] ?? variants.primary,
  sizes[props.size] ?? sizes.md,
  props.block && 'w-full',
])
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading" :aria-busy="loading || undefined">
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <component :is="icon" v-else-if="icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
    <slot />
    <component :is="iconRight" v-if="iconRight && !loading" class="h-4 w-4 shrink-0" aria-hidden="true" />
  </button>
</template>
