<script setup>
import { ref, computed, useId } from 'vue'
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { formatBytes } from '@/utilidades/formato'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  accept: { type: String, default: '.pdf' },
  maxSizeMB: { type: Number, default: 10 },
  multiple: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const inputId = useId()
const inputRef = ref(null)
const dragging = ref(false)
const localErrors = ref([])

const acceptList = computed(() =>
  props.accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
)
const acceptLabel = computed(() => acceptList.value.map((a) => a.replace('.', '').toUpperCase()).join(', '))
const hasFiles = computed(() => props.modelValue.length > 0)
const showDropArea = computed(() => props.multiple || !hasFiles.value)

function isAccepted(file) {
  if (!acceptList.value.length) return true
  const name = file.name.toLowerCase()
  return acceptList.value.some((a) => {
    if (a.startsWith('.')) return name.endsWith(a)
    if (a.endsWith('/*')) return file.type.startsWith(a.slice(0, -1))
    return file.type === a
  })
}

function addFiles(fileList) {
  const errors = []
  const valid = []
  for (const file of Array.from(fileList ?? [])) {
    if (!isAccepted(file)) {
      errors.push(`"${file.name}" no tiene un formato permitido (${acceptLabel.value}).`)
      continue
    }
    if (file.size > props.maxSizeMB * 1024 * 1024) {
      errors.push(`"${file.name}" supera el tamaño máximo de ${props.maxSizeMB} MB.`)
      continue
    }
    valid.push(file)
  }
  localErrors.value = errors
  if (!valid.length) return
  emit('update:modelValue', props.multiple ? [...props.modelValue, ...valid] : [valid[0]])
}

function onDrop(e) {
  dragging.value = false
  addFiles(e.dataTransfer?.files)
}

function onChange(e) {
  addFiles(e.target.files)
  e.target.value = ''
}

function openPicker() {
  inputRef.value?.click()
}

function removeAt(index) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div>
    <div v-if="label" class="mb-1.5 flex items-baseline justify-between gap-2">
      <label :for="inputId" class="text-sm font-medium text-ink">
        {{ label }} <span v-if="required" class="text-rose-500" aria-hidden="true">*</span>
      </label>
      <span class="text-[11px] text-slate-400">{{ acceptLabel }} · máx. {{ maxSizeMB }} MB</span>
    </div>

    <div
      v-if="showDropArea"
      role="button"
      tabindex="0"
      :aria-describedby="hint ? `${inputId}-hint` : undefined"
      :class="[
        'group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition',
        dragging
          ? 'border-brand-400 bg-brand-50'
          : error
            ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
            : 'border-slate-200 bg-slate-50/50 hover:border-brand-400 hover:bg-brand-50/40',
      ]"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span
        :class="[
          'mb-2 grid h-10 w-10 place-items-center rounded-full transition',
          dragging ? 'bg-brand-400 text-ink' : 'bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 group-hover:text-brand-600',
        ]"
      >
        <UploadCloud class="h-5 w-5" />
      </span>
      <p class="text-sm text-ink">
        <span class="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2">Haz clic para cargar</span>
        o arrastra el archivo aquí
      </p>
      <p v-if="hint" :id="`${inputId}-hint`" class="mt-1 text-xs text-muted">{{ hint }}</p>
      <input
        :id="inputId"
        ref="inputRef"
        type="file"
        class="sr-only"
        :accept="accept"
        :multiple="multiple"
        @change="onChange"
      />
    </div>

    <ul v-if="hasFiles" :class="['space-y-2', showDropArea && 'mt-3']">
      <li
        v-for="(file, i) in modelValue"
        :key="`${file.name}-${i}`"
        class="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2.5"
      >
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-emerald-600 ring-1 ring-emerald-200">
          <FileText class="h-4 w-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-ink">{{ file.name }}</p>
          <p class="flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 class="h-3.5 w-3.5" /> {{ formatBytes(file.size) }} · listo para enviar
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600"
          :aria-label="`Quitar ${file.name}`"
          @click="removeAt(i)"
        >
          <X class="h-4 w-4" />
        </button>
      </li>
    </ul>

    <ul v-if="localErrors.length || error" class="mt-2 space-y-1" role="alert">
      <li v-for="msg in localErrors" :key="msg" class="flex items-start gap-1.5 text-xs font-medium text-rose-600">
        <AlertCircle class="mt-px h-3.5 w-3.5 shrink-0" /> {{ msg }}
      </li>
      <li v-if="error && !localErrors.length" class="flex items-start gap-1.5 text-xs font-medium text-rose-600">
        <AlertCircle class="mt-px h-3.5 w-3.5 shrink-0" /> {{ error }}
      </li>
    </ul>
  </div>
</template>
