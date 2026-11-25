<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: [Object, Function], default: null },
  tone: { type: String, default: 'brand' }, // brand | warning | success | danger | info
  hint: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const tones = {
  brand: 'bg-brand-100 text-brand-700',
  warning: 'bg-amber-50 text-amber-600',
  success: 'bg-emerald-50 text-emerald-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-sky-50 text-sky-600',
}
</script>

<template>
  <article class="card p-5">
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm font-medium text-muted">{{ label }}</p>
      <span v-if="icon" :class="['grid h-10 w-10 shrink-0 place-items-center rounded-lg', tones[tone]]">
        <component :is="icon" class="h-5 w-5" />
      </span>
    </div>
    <div v-if="loading" class="mt-2 h-8 w-16 animate-pulse rounded bg-slate-100" />
    <p v-else class="mt-1 text-3xl font-extrabold tracking-tight text-ink">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted">{{ hint }}</p>
  </article>
</template>
