<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import {
  X, FileText, Download, CheckCircle2, XCircle, RotateCcw, Send, Mail, GraduationCap, History, ClipboardCheck, Save, UserCheck,
} from 'lucide-vue-next'
import EtiquetaEstado from '@/componentes/comun/EtiquetaEstado.vue'
import BotonBase from '@/componentes/comun/BotonBase.vue'
import ModalBase from '@/componentes/comun/ModalBase.vue'
import { useCoordinationStore } from '@/estado/estadoCoordinacion'
import { ENDORSEMENT_STATUS } from '@/utilidades/estados'
import { ASIGNATURAS } from '@/utilidades/institucion'
import { formatDate, formatDateTime, formatBytes, initials } from '@/utilidades/formato'

const coord = useCoordinationStore()
const request = computed(() => coord.selectedRequest)
const isOpenStatus = computed(() => ['pendiente', 'en_revision'].includes(request.value?.status))
const editable = computed(() => request.value && request.value.status !== 'rechazada')

// ---- Validación y asignación (estructura de las bases de seguimiento) -------
const validation = reactive({ academicEndorsement: 'pendiente', financialEndorsement: 'pendiente', advisor: '', course: '', nrc: '' })
const feedback = ref('')
const feedbackTone = ref('success')

function loadValidation() {
  const r = request.value
  if (!r) return
  Object.assign(validation, {
    academicEndorsement: r.academicEndorsement,
    financialEndorsement: r.financialEndorsement,
    advisor: r.advisor ?? '',
    course: r.course ?? ASIGNATURAS[0],
    nrc: r.nrc ?? '',
  })
}

const advisorOptions = computed(() => {
  const own = coord.advisors.filter((a) => a.facultyCode === request.value?.facultyCode)
  return own.length ? own : coord.advisors
})

const validationDirty = computed(() => {
  const r = request.value
  if (!r) return false
  return (
    validation.academicEndorsement !== r.academicEndorsement ||
    validation.financialEndorsement !== r.financialEndorsement ||
    (validation.advisor || null) !== (r.advisor || null) ||
    validation.course !== (r.course ?? '') ||
    (validation.nrc || null) !== (r.nrc || null)
  )
})

const readyToApprove = computed(() => {
  const r = request.value
  return r && r.academicEndorsement === 'aprobado' && r.financialEndorsement === 'aprobado' && !!r.advisor
})

const approveHint = computed(() => {
  const r = request.value
  if (!r) return ''
  const missing = []
  if (r.academicEndorsement !== 'aprobado') missing.push('aval académico')
  if (r.financialEndorsement !== 'aprobado') missing.push('aval financiero')
  if (!r.advisor) missing.push('docente asesor')
  return missing.length ? `Para aprobar falta: ${missing.join(', ')}.` : ''
})

function notify(message, tone = 'success') {
  feedback.value = message
  feedbackTone.value = tone
}

async function saveValidation() {
  try {
    await coord.saveValidation(request.value.id, { ...validation })
    notify('Validación y asignación guardadas.')
  } catch (e) {
    notify(e.message, 'danger')
  }
}

async function sendToProgram() {
  try {
    await coord.changeStatus(request.value.id, 'en_revision')
    notify('La solicitud quedó en validación del programa (aval académico y financiero).')
  } catch (e) {
    notify(e.message, 'danger')
  }
}

// ---- Modal de decisión -----------------------------------------------------
const ACTIONS = {
  aprobada: {
    title: 'Aprobar y asignar',
    description: 'Se notificará al estudiante y al docente asesor, y se solicitará la creación del aula virtual.',
    confirm: 'Aprobar',
    variant: 'success',
    tone: 'success',
    icon: CheckCircle2,
    requireComment: false,
  },
  devuelta: {
    title: 'Solicitar ajustes',
    description: 'El estudiante podrá corregir la información o regularizar el requisito indicado.',
    confirm: 'Enviar solicitud de ajustes',
    variant: 'primary',
    tone: 'info',
    icon: RotateCcw,
    requireComment: true,
  },
  rechazada: {
    title: 'Marcar como "No cumple"',
    description: 'Indica el requisito que no se cumple. El estudiante podrá participar como asistente de proyecto docente según disponibilidad (art. 28, parágrafo 5).',
    confirm: 'Confirmar',
    variant: 'danger',
    tone: 'danger',
    icon: XCircle,
    requireComment: true,
  },
}

const pendingAction = ref(null)
const comment = ref('')
const commentError = ref('')
const actionError = ref('')
const action = computed(() => (pendingAction.value ? ACTIONS[pendingAction.value] : null))

function ask(status) {
  pendingAction.value = status
  comment.value = ''
  commentError.value = ''
  actionError.value = ''
}

async function confirmAction() {
  if (action.value.requireComment && comment.value.trim().length < 10) {
    commentError.value = 'Describe el motivo (mínimo 10 caracteres).'
    return
  }
  try {
    await coord.changeStatus(request.value.id, pendingAction.value, comment.value.trim())
    notify(`Solicitud ${request.value.radicado} actualizada correctamente.`)
    pendingAction.value = null
  } catch (e) {
    actionError.value = e.message
  }
}

// ---- Cierre / accesibilidad ------------------------------------------------
function onKeydown(e) {
  if (e.key === 'Escape' && coord.drawerOpen && !pendingAction.value) coord.closeDetail()
}

watch(
  () => coord.drawerOpen,
  (open) => {
    feedback.value = ''
    if (open) {
      loadValidation()
      document.addEventListener('keydown', onKeydown)
    } else document.removeEventListener('keydown', onKeydown)
  },
)
watch(() => coord.selectedId, () => {
  feedback.value = ''
  loadValidation()
})
watch(() => request.value?.updatedAt, loadValidation)
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-200" leave-to-class="opacity-0">
      <div v-if="coord.drawerOpen" class="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[1px]" aria-hidden="true" @click="coord.closeDetail()" />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="coord.drawerOpen && request"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div class="min-w-0">
            <p class="font-mono text-xs font-semibold text-muted">{{ request.radicado }} · Periodo {{ request.period }}</p>
            <h2 id="drawer-title" class="mt-1 text-lg font-bold leading-snug text-ink">{{ request.modalityName }}</h2>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <EtiquetaEstado :status="request.status" />
              <span>Radicada el {{ formatDateTime(request.submittedAt) }}</span>
            </div>
          </div>
          <button type="button" class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Cerrar detalle" @click="coord.closeDetail()">
            <X class="h-5 w-5" />
          </button>
        </header>

        <div class="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div
            v-if="feedback"
            :class="[
              'flex items-start gap-2 rounded-lg border p-3 text-sm',
              feedbackTone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700',
            ]"
            role="status"
          >
            <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0" /> {{ feedback }}
          </div>

          <!-- Estudiante -->
          <section class="rounded-xl border border-slate-200 p-5">
            <div class="flex items-center gap-3">
              <span class="grid h-11 w-11 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{{ initials(request.studentName) }}</span>
              <div class="min-w-0">
                <p class="truncate font-semibold text-ink">{{ request.studentName }}</p>
                <a :href="`mailto:${request.studentEmail}`" class="flex items-center gap-1 text-xs text-muted hover:text-ink">
                  <Mail class="h-3.5 w-3.5" /> {{ request.studentEmail }}
                </a>
              </div>
            </div>
            <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
              <div><dt class="text-xs text-muted">ID</dt><dd class="font-medium">{{ request.studentCode }}</dd></div>
              <div><dt class="text-xs text-muted">Documento</dt><dd class="font-medium">{{ request.documentNumber }}</dd></div>
              <div><dt class="text-xs text-muted">Promedio</dt><dd class="font-medium">{{ Number(request.gpa).toFixed(1).replace('.', ',') }}</dd></div>
              <div><dt class="text-xs text-muted">Avance</dt><dd class="font-medium">{{ request.academicProgress }} %</dd></div>
              <div><dt class="text-xs text-muted">Nota comp. investigativo</dt><dd class="font-medium">{{ request.researchGrade ? String(request.researchGrade).replace('.', ',') : '—' }}</dd></div>
              <div class="col-span-1 sm:col-span-3">
                <dt class="text-xs text-muted">Programa</dt>
                <dd class="flex items-center gap-1.5 font-medium"><GraduationCap class="h-4 w-4 shrink-0 text-slate-400" />{{ request.program }} · {{ request.studyMode }}</dd>
              </div>
              <div class="col-span-2 sm:col-span-4"><dt class="text-xs text-muted">Facultad</dt><dd class="font-medium">{{ request.faculty }}</dd></div>
            </dl>
          </section>

          <!-- Validación y asignación -->
          <section class="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
            <h3 class="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
              <UserCheck class="h-3.5 w-3.5" /> Validación y asignación
            </h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="v-academic" class="label">Aval del programa académico</label>
                <select id="v-academic" v-model="validation.academicEndorsement" class="input" :disabled="!editable">
                  <option v-for="(meta, key) in ENDORSEMENT_STATUS" :key="key" :value="key">{{ meta.label }}</option>
                </select>
              </div>
              <div>
                <label for="v-financial" class="label">Aval financiero (sello)</label>
                <select id="v-financial" v-model="validation.financialEndorsement" class="input" :disabled="!editable">
                  <option v-for="(meta, key) in ENDORSEMENT_STATUS" :key="key" :value="key">{{ meta.label }}</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label for="v-advisor" class="label">Docente asesor</label>
                <select id="v-advisor" v-model="validation.advisor" class="input" :disabled="!editable">
                  <option value="">Sin asignar</option>
                  <option v-for="a in advisorOptions" :key="a.id" :value="a.name">{{ a.name }}</option>
                </select>
              </div>
              <div>
                <label for="v-course" class="label">Asignatura</label>
                <select id="v-course" v-model="validation.course" class="input" :disabled="!editable">
                  <option v-for="c in ASIGNATURAS" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label for="v-nrc" class="label">NRC</label>
                <input id="v-nrc" v-model.trim="validation.nrc" type="text" inputmode="numeric" maxlength="10" class="input" placeholder="Ej.: 20145" :disabled="!editable" />
              </div>
            </div>
            <div v-if="editable" class="mt-4 flex justify-end">
              <BotonBase size="sm" variant="secondary" :icon="Save" :disabled="!validationDirty" :loading="coord.updating" @click="saveValidation">
                Guardar validación
              </BotonBase>
            </div>
          </section>

          <!-- Datos de la modalidad -->
          <section>
            <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Datos de la preinscripción</h3>
            <dl class="space-y-3 rounded-xl bg-slate-50 p-5 text-sm">
              <div v-for="d in request.details" :key="d.key">
                <dt class="text-xs text-muted">{{ d.label }}</dt>
                <dd class="whitespace-pre-line font-medium text-ink">{{ d.value }}</dd>
              </div>
              <div v-if="request.observations" class="border-t border-slate-200 pt-3">
                <dt class="text-xs text-muted">Observaciones del estudiante</dt>
                <dd class="whitespace-pre-line text-slate-700">{{ request.observations }}</dd>
              </div>
            </dl>
          </section>

          <!-- Requisitos -->
          <section>
            <h3 class="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><ClipboardCheck class="h-3.5 w-3.5" /> Requisitos</h3>
            <ul class="divide-y divide-slate-100 rounded-xl border border-slate-200">
              <li v-for="r in request.requirements" :key="r.id" class="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p class="font-medium text-ink">{{ r.name }}</p>
                  <p class="text-xs text-muted">Exigido: {{ r.expected }}</p>
                </div>
                <EtiquetaEstado :status="r.status" kind="requirement" size="sm" />
              </li>
            </ul>
          </section>

          <!-- Soportes -->
          <section>
            <h3 class="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><FileText class="h-3.5 w-3.5" /> Soportes ({{ request.documents.length }})</h3>
            <ul v-if="request.documents.length" class="space-y-2">
              <li v-for="doc in request.documents" :key="doc.key + doc.fileName" class="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><FileText class="h-4 w-4" /></span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-ink">{{ doc.label }}</p>
                  <p class="truncate text-xs text-muted">{{ doc.fileName }} · {{ formatBytes(doc.size) }}</p>
                </div>
                <EtiquetaEstado :status="doc.status" kind="document" size="sm" />
                <button type="button" class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink" :aria-label="`Descargar ${doc.label}`" title="Descarga disponible al conectar el backend">
                  <Download class="h-4 w-4" />
                </button>
              </li>
            </ul>
            <p v-else class="rounded-lg bg-slate-50 p-3 text-sm text-muted">Esta modalidad no exige soportes en la preinscripción.</p>
          </section>

          <!-- Historial -->
          <section>
            <h3 class="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><History class="h-3.5 w-3.5" /> Historial</h3>
            <ol class="relative space-y-5 border-l border-slate-200 pl-5">
              <li v-for="(h, i) in [...request.history].reverse()" :key="i" class="relative">
                <span :class="['absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white', i === 0 ? 'bg-brand-400' : 'bg-slate-300']" />
                <p class="text-sm font-semibold text-ink">{{ h.action }}</p>
                <p class="text-xs text-muted">{{ h.by }} · {{ formatDate(h.date) }}</p>
                <p v-if="h.comment" class="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">“{{ h.comment }}”</p>
              </li>
            </ol>
          </section>
        </div>

        <footer v-if="isOpenStatus" class="border-t border-slate-200 bg-slate-50/70 px-6 py-4">
          <div v-if="request.status === 'pendiente'" class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs text-muted">Remite la solicitud al programa para el aval académico y financiero.</p>
            <BotonBase :icon="Send" :loading="coord.updating" @click="sendToProgram">Enviar a validación</BotonBase>
          </div>
          <div v-else class="space-y-2">
            <p v-if="approveHint" class="text-right text-xs text-amber-700">{{ approveHint }}</p>
            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <BotonBase variant="outline-danger" :icon="XCircle" @click="ask('rechazada')">No cumple</BotonBase>
              <BotonBase variant="secondary" :icon="RotateCcw" @click="ask('devuelta')">Solicitar ajustes</BotonBase>
              <BotonBase variant="success" :icon="CheckCircle2" :disabled="!readyToApprove || validationDirty" @click="ask('aprobada')">Aprobar y asignar</BotonBase>
            </div>
          </div>
        </footer>
      </aside>
    </Transition>

    <ModalBase
      :open="!!pendingAction"
      :title="action?.title"
      :description="action?.description"
      :icon="action?.icon"
      :tone="action?.tone"
      :persistent="coord.updating"
      @update:open="(v) => !v && (pendingAction = null)"
    >
      <label for="decision-comment" class="label">
        Observación para el estudiante
        <span v-if="!action?.requireComment" class="font-normal text-muted">(opcional)</span>
        <span v-else class="text-rose-500">*</span>
      </label>
      <textarea
        id="decision-comment"
        v-model="comment"
        rows="4"
        maxlength="600"
        :class="['input resize-y', commentError && 'input-error']"
        placeholder="Escribe aquí el detalle de la decisión…"
      />
      <p v-if="commentError" class="field-error">{{ commentError }}</p>
      <p v-if="actionError" class="mt-3 rounded-lg bg-rose-50 p-2.5 text-sm text-rose-700">{{ actionError }}</p>

      <template #footer>
        <BotonBase variant="secondary" :disabled="coord.updating" @click="pendingAction = null">Cancelar</BotonBase>
        <BotonBase :variant="action?.variant" :icon="action?.icon" :loading="coord.updating" @click="confirmAction">{{ action?.confirm }}</BotonBase>
      </template>
    </ModalBase>
  </Teleport>
</template>
