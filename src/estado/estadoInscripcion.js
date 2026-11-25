import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { studentService } from '@/servicios/servicioEstudiante'
import { evaluateRequirement, isModalityAvailableFor } from '@/utilidades/requisitos'
import { useAuthStore } from './estadoAutenticacion'

export const INSCRIPTION_STEPS = [
  { id: 1, title: 'Modalidad', description: 'Elige tu opción de grado' },
  { id: 2, title: 'Requisitos', description: 'Verificación académica' },
  { id: 3, title: 'Datos', description: 'Información y soportes' },
  { id: 4, title: 'Confirmación', description: 'Revisa y envía' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function emptyForm() {
  return { modalityId: null, fields: {}, documents: {}, observations: '', acceptTerms: false, acceptDataPolicy: false }
}

export const useInscriptionStore = defineStore('inscription', () => {
  // ---- Estado ---------------------------------------------------------------
  const currentStep = ref(1)
  const maxReachedStep = ref(1)
  const profile = ref(null)
  const modalities = ref([])
  const requirementsCatalog = ref([])

  const initialized = ref(false)
  const loading = ref(false)
  const loadError = ref(null)
  const submitting = ref(false)
  const submitError = ref(null)
  const result = ref(null)
  const errors = ref({})

  const form = reactive(emptyForm())

  // ---- Getters --------------------------------------------------------------
  /** Modalidades que aplican al nivel y facultad del estudiante (Res. 617/2024, arts. 26 y 27). */
  const availableModalities = computed(() => modalities.value.filter((m) => isModalityAvailableFor(m, profile.value)))

  const selectedModality = computed(() => modalities.value.find((m) => m.id === form.modalityId) ?? null)

  const evaluatedRequirements = computed(() => {
    if (!selectedModality.value || !profile.value) return []
    return selectedModality.value.requirementIds
      .map((id) => requirementsCatalog.value.find((r) => r.id === id))
      .filter(Boolean)
      .map((req) => ({ ...req, ...evaluateRequirement(req, profile.value) }))
  })

  const blockingRequirements = computed(() =>
    evaluatedRequirements.value.filter((r) => r.mandatory && r.status === 'no_cumple'),
  )
  const manualRequirements = computed(() => evaluatedRequirements.value.filter((r) => r.status === 'pendiente'))
  const requirementsOk = computed(() => blockingRequirements.value.length === 0)

  const uploadedDocuments = computed(() => {
    if (!selectedModality.value) return []
    return selectedModality.value.documents.map((d) => ({ ...d, files: form.documents[d.key] ?? [] }))
  })

  // ---- Acciones -------------------------------------------------------------
  async function init() {
    const auth = useAuthStore()
    loading.value = true
    loadError.value = null
    try {
      const [p, m, r] = await Promise.all([
        studentService.getProfile(auth.user?.studentId),
        studentService.getModalities(),
        studentService.getRequirements(),
      ])
      profile.value = p
      modalities.value = m
      requirementsCatalog.value = r
      initialized.value = true
    } catch (e) {
      loadError.value = e.message ?? 'No fue posible cargar la información.'
    } finally {
      loading.value = false
    }
  }

  function selectModality(id) {
    if (form.modalityId === id) return
    const modality = modalities.value.find((m) => m.id === id)
    if (!modality) return
    form.modalityId = id
    form.fields = Object.fromEntries(modality.fields.map((f) => [f.key, '']))
    form.documents = Object.fromEntries(modality.documents.map((d) => [d.key, []]))
    form.acceptTerms = false
    maxReachedStep.value = 1
    errors.value = {}
  }

  function validateStep(step = currentStep.value) {
    const e = {}
    const modality = selectedModality.value

    if (step === 1 && !form.modalityId) {
      e.modalityId = 'Selecciona una modalidad para continuar.'
    }

    if (step === 2 && !requirementsOk.value) {
      e.requirements =
        'No cumples con todos los requisitos obligatorios de esta modalidad. Elige otra opción o comunícate con la Coordinación de Investigación y Creación.'
    }

    if (step === 3 && modality) {
      for (const f of modality.fields) {
        const value = String(form.fields[f.key] ?? '').trim()
        if (f.required && !value) e[`field.${f.key}`] = 'Este campo es obligatorio.'
        else if (f.type === 'email' && value && !EMAIL_RE.test(value)) e[`field.${f.key}`] = 'Ingresa un correo válido.'
      }
      for (const d of modality.documents) {
        if (d.required && !form.documents[d.key]?.length) e[`doc.${d.key}`] = 'Debes adjuntar este documento.'
      }
    }

    if (step === 4) {
      if (!form.acceptTerms) e.acceptTerms = 'Debes aceptar el Reglamento de Investigación (Res. 617 de 2024).'
      if (!form.acceptDataPolicy) e.acceptDataPolicy = 'Debes autorizar el tratamiento de datos personales.'
    }

    errors.value = e
    return Object.keys(e).length === 0
  }

  function nextStep() {
    if (!validateStep()) return false
    if (currentStep.value < INSCRIPTION_STEPS.length) {
      currentStep.value++
      maxReachedStep.value = Math.max(maxReachedStep.value, currentStep.value)
    }
    return true
  }

  function prevStep() {
    errors.value = {}
    if (currentStep.value > 1) currentStep.value--
  }

  function goToStep(step) {
    if (step < 1 || step > maxReachedStep.value) return
    errors.value = {}
    currentStep.value = step
  }

  async function submit() {
    if (!validateStep(4)) return null
    submitting.value = true
    submitError.value = null
    try {
      result.value = await studentService.submitInscription({
        profile: profile.value,
        modality: selectedModality.value,
        fields: { ...form.fields },
        documents: form.documents,
        observations: form.observations,
        requirements: evaluatedRequirements.value,
      })
      return result.value
    } catch (e) {
      submitError.value = e.message ?? 'No fue posible radicar la preinscripción.'
      return null
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.assign(form, emptyForm())
    currentStep.value = 1
    maxReachedStep.value = 1
    errors.value = {}
    result.value = null
    submitError.value = null
  }

  return {
    // state
    currentStep, maxReachedStep, profile, modalities, requirementsCatalog,
    initialized, loading, loadError, submitting, submitError, result, errors, form,
    // getters
    availableModalities, selectedModality, evaluatedRequirements, blockingRequirements, manualRequirements,
    requirementsOk, uploadedDocuments,
    // actions
    init, selectModality, validateStep, nextStep, prevStep, goToStep, submit, reset,
  }
})
