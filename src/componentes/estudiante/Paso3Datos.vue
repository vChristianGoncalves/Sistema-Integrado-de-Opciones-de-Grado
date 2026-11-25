<script setup>
import { computed } from 'vue'
import { ClipboardList, Paperclip, Info } from 'lucide-vue-next'
import ZonaCargaArchivos from '@/componentes/comun/ZonaCargaArchivos.vue'
import { useInscriptionStore } from '@/estado/estadoInscripcion'

const store = useInscriptionStore()
const modality = computed(() => store.selectedModality)

const fieldId = (key) => `field-${key}`
const fieldError = (key) => store.errors[`field.${key}`]
</script>

<template>
  <section v-if="modality" class="space-y-8">
    <header>
      <h2 class="section-title">Información de la preinscripción</h2>
      <p class="section-subtitle">
        Registra correcta y completamente la información requerida. Los campos con <span class="text-rose-500">*</span> son obligatorios.
      </p>
    </header>

    <fieldset>
      <legend class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
        <ClipboardList class="h-4 w-4" /> Datos de la modalidad
      </legend>

      <div class="grid gap-5 sm:grid-cols-2">
        <div v-for="f in modality.fields" :key="f.key" :class="f.wide || f.type === 'textarea' ? 'sm:col-span-2' : ''">
          <label :for="fieldId(f.key)" class="label">
            {{ f.label }} <span v-if="f.required" class="text-rose-500" aria-hidden="true">*</span>
          </label>

          <select
            v-if="f.type === 'select'"
            :id="fieldId(f.key)"
            v-model="store.form.fields[f.key]"
            :class="['input', fieldError(f.key) && 'input-error']"
            :aria-invalid="!!fieldError(f.key)"
          >
            <option value="" disabled>Selecciona una opción</option>
            <option v-for="opt in f.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <textarea
            v-else-if="f.type === 'textarea'"
            :id="fieldId(f.key)"
            v-model="store.form.fields[f.key]"
            rows="3"
            maxlength="800"
            :placeholder="f.placeholder"
            :class="['input resize-y', fieldError(f.key) && 'input-error']"
            :aria-invalid="!!fieldError(f.key)"
          />

          <input
            v-else
            :id="fieldId(f.key)"
            v-model.trim="store.form.fields[f.key]"
            :type="f.type === 'email' ? 'email' : 'text'"
            :placeholder="f.placeholder"
            :class="['input', fieldError(f.key) && 'input-error']"
            :aria-invalid="!!fieldError(f.key)"
          />

          <p v-if="fieldError(f.key)" class="field-error">{{ fieldError(f.key) }}</p>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
        <Paperclip class="h-4 w-4" /> Soportes
      </legend>

      <div v-if="modality.documents.length" class="grid gap-5 lg:grid-cols-2">
        <ZonaCargaArchivos
          v-for="d in modality.documents"
          :key="d.key"
          v-model="store.form.documents[d.key]"
          :label="d.label"
          :hint="d.hint"
          :accept="d.accept"
          :maxSizeMB="d.maxSizeMB"
          :required="d.required"
          :error="store.errors[`doc.${d.key}`]"
        />
      </div>
      <p v-else class="flex items-start gap-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <Info class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        Esta modalidad no requiere soportes en la preinscripción. Los formatos (acta de instalación, registro de reuniones, etc.) se
        comparten en la notificación formal de asignación.
      </p>
    </fieldset>

    <div>
      <label for="observations" class="label">Observaciones <span class="font-normal text-muted">(opcional)</span></label>
      <textarea
        id="observations"
        v-model="store.form.observations"
        rows="3"
        maxlength="500"
        class="input resize-y"
        placeholder="Información adicional que la Coordinación deba conocer."
      />
      <p class="mt-1 text-right text-xs text-slate-400">{{ store.form.observations.length }}/500</p>
    </div>
  </section>
</template>
