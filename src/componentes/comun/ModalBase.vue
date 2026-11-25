<script setup>
import { watch, onBeforeUnmount, useId } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
  persistent: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  tone: { type: String, default: 'brand' }, // brand | success | danger | info
})

const emit = defineEmits(['update:open', 'close'])
const titleId = useId()

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }
const tones = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-emerald-50 text-emerald-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-sky-50 text-sky-600',
}

function close() {
  if (props.persistent) return
  emit('update:open', false)
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.open) close()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" aria-hidden="true" @click="close" />

        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :class="['relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl', sizes[size]]"
        >
          <header class="flex items-start gap-4 px-6 pb-2 pt-6">
            <span v-if="icon" :class="['grid h-10 w-10 shrink-0 place-items-center rounded-full', tones[tone]]">
              <component :is="icon" class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1">
              <h3 :id="titleId" class="text-base font-bold text-ink">{{ title }}</h3>
              <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
            </div>
            <button
              v-if="!persistent"
              type="button"
              class="-mr-2 -mt-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar"
              @click="close"
            >
              <X class="h-4 w-4" />
            </button>
          </header>

          <div class="px-6 py-4">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
