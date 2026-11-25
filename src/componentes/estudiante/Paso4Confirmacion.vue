<script setup>
import { computed } from 'vue'
import { Pencil, FileText, User, Layers, ClipboardCheck } from 'lucide-vue-next'
import EtiquetaEstado from '@/componentes/comun/EtiquetaEstado.vue'
import { useInscriptionStore } from '@/estado/estadoInscripcion'
import { formatBytes } from '@/utilidades/formato'

const store = useInscriptionStore()
const modality = computed(() => store.selectedModality)
const profile = computed(() => store.profile)

const filledFields = computed(() =>
  (modality.value?.fields ?? []).map((f) => ({ ...f, value: store.form.fields[f.key] || '—' })),
)
const files = computed(() => store.uploadedDocuments.flatMap((d) => d.files.map((file) => ({ doc: d.label, file }))))
</script>

<template>
  <section v-if="modality && profile" class="space-y-6">
    <header>
      <h2 class="section-title">Revisa y confirma tu preinscripción</h2>
      <p class="section-subtitle">
        Verifica que la información sea correcta. Una vez radicada, solo podrás modificarla si la Coordinación lo solicita.
      </p>
    </header>

    <article class="rounded-xl border border-slate-200">
      <header class="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
        <User class="h-4 w-4 text-slate-400" />
        <h3 class="text-sm font-bold text-ink">Datos del estudiante</h3>
      </header>
      <dl class="grid gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
        <div><dt class="text-xs text-muted">Nombres y apellidos</dt><dd class="font-medium">{{ profile.fullName }}</dd></div>
        <div><dt class="text-xs text-muted">ID · Documento</dt><dd class="font-medium">{{ profile.code }} · {{ profile.documentType }} {{ profile.documentNumber }}</dd></div>
        <div><dt class="text-xs text-muted">Facultad</dt><dd class="font-medium">{{ profile.faculty }}</dd></div>
        <div><dt class="text-xs text-muted">Programa académico</dt><dd class="font-medium">{{ profile.program }} ({{ profile.studyMode }})</dd></div>
        <div><dt class="text-xs text-muted">Correo institucional</dt><dd class="font-medium">{{ profile.email }}</dd></div>
        <div><dt class="text-xs text-muted">Periodo</dt><dd class="font-medium">{{ profile.academicPeriod }}</dd></div>
      </dl>
    </article>

    <article class="rounded-xl border border-slate-200">
      <header class="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div class="flex items-center gap-2">
          <Layers class="h-4 w-4 text-slate-400" />
          <h3 class="text-sm font-bold text-ink">Modalidad investigativa</h3>
        </div>
        <button type="button" class="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline" @click="store.goToStep(1)">
          <Pencil class="h-3.5 w-3.5" /> Cambiar
        </button>
      </header>
      <div class="p-5">
        <p class="font-semibold text-ink">{{ modality.name }}</p>
        <p class="text-xs text-muted">{{ modality.duration }} · {{ modality.legalBasis }}</p>
        <dl class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div v-for="f in filledFields" :key="f.key" :class="f.wide || f.type === 'textarea' ? 'sm:col-span-2' : ''">
            <dt class="text-xs text-muted">{{ f.label }}</dt>
            <dd class="whitespace-pre-line font-medium">{{ f.value }}</dd>
          </div>
        </dl>
        <button type="button" class="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline" @click="store.goToStep(3)">
          <Pencil class="h-3.5 w-3.5" /> Editar datos
        </button>
      </div>
    </article>

    <div class="grid gap-6 lg:grid-cols-2">
      <article class="rounded-xl border border-slate-200">
        <header class="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
          <ClipboardCheck class="h-4 w-4 text-slate-400" />
          <h3 class="text-sm font-bold text-ink">Requisitos</h3>
        </header>
        <ul class="space-y-2.5 p-5">
          <li v-for="r in store.evaluatedRequirements" :key="r.id" class="flex items-center justify-between gap-3 text-sm">
            <span class="text-slate-700">{{ r.name }}</span>
            <EtiquetaEstado :status="r.status" kind="requirement" size="sm" />
          </li>
        </ul>
      </article>

      <article class="rounded-xl border border-slate-200">
        <header class="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
          <div class="flex items-center gap-2">
            <FileText class="h-4 w-4 text-slate-400" />
            <h3 class="text-sm font-bold text-ink">Soportes ({{ files.length }})</h3>
          </div>
          <button
            v-if="modality.documents.length"
            type="button"
            class="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
            @click="store.goToStep(3)"
          >
            <Pencil class="h-3.5 w-3.5" /> Editar
          </button>
        </header>
        <ul v-if="files.length" class="space-y-2.5 p-5">
          <li v-for="item in files" :key="item.doc + item.file.name" class="text-sm">
            <p class="text-xs text-muted">{{ item.doc }}</p>
            <p class="truncate font-medium text-ink">
              {{ item.file.name }} <span class="font-normal text-slate-400">· {{ formatBytes(item.file.size) }}</span>
            </p>
          </li>
        </ul>
        <p v-else class="p-5 text-sm text-muted">No se adjuntaron soportes.</p>
      </article>
    </div>

    <div v-if="store.form.observations" class="rounded-xl border border-slate-200 p-5 text-sm">
      <p class="text-xs text-muted">Observaciones</p>
      <p class="mt-1 whitespace-pre-line text-slate-700">{{ store.form.observations }}</p>
    </div>

    <div class="space-y-3 rounded-xl border border-brand-200 bg-brand-50/60 p-5">
      <label class="flex cursor-pointer items-start gap-3 text-sm">
        <input v-model="store.form.acceptTerms" type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-yellow-500" />
        <span class="text-slate-700">
          Declaro que la información suministrada es veraz y conozco el
          <strong class="text-ink">Reglamento de Investigación, Innovación y Creación Artística y Cultural (Res. 617 de 2024)</strong>.
        </span>
      </label>
      <p v-if="store.errors.acceptTerms" class="field-error ml-7">{{ store.errors.acceptTerms }}</p>

      <label class="flex cursor-pointer items-start gap-3 text-sm">
        <input v-model="store.form.acceptDataPolicy" type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-yellow-500" />
        <span class="text-slate-700">
          Autorizo el tratamiento de mis datos personales conforme a la <strong class="text-ink">Ley 1581 de 2012</strong> y la política institucional.
        </span>
      </label>
      <p v-if="store.errors.acceptDataPolicy" class="field-error ml-7">{{ store.errors.acceptDataPolicy }}</p>
    </div>
  </section>
</template>
