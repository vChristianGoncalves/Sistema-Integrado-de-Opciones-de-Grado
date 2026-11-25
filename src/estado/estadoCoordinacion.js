import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { coordinationService } from '@/servicios/servicioCoordinacion'
import { OPEN_STATUSES, REQUEST_STATUS } from '@/utilidades/estados'
import { FACULTADES } from '@/utilidades/institucion'
import { normalize } from '@/utilidades/formato'
import { useAuthStore } from './estadoAutenticacion'

const DEFAULT_FILTERS = { search: '', status: 'open', modalityId: 'all', facultyCode: 'all', period: 'all' }

export const useCoordinationStore = defineStore('coordination', () => {
  const requests = ref([])
  const modalities = ref([])
  const advisors = ref([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)
  const updating = ref(false)

  const filters = reactive({ ...DEFAULT_FILTERS })
  const selectedId = ref(null)
  const drawerOpen = ref(false)

  // ---- Getters --------------------------------------------------------------
  const sortedRequests = computed(() =>
    [...requests.value].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
  )

  const selectedRequest = computed(() => requests.value.find((r) => r.id === selectedId.value) ?? null)

  const periods = computed(() => [...new Set(requests.value.map((r) => r.period))].sort())

  const filteredRequests = computed(() => {
    const q = normalize(filters.search)
    return sortedRequests.value.filter((r) => {
      if (filters.status === 'open' && !OPEN_STATUSES.includes(r.status)) return false
      if (!['open', 'all'].includes(filters.status) && r.status !== filters.status) return false
      if (filters.modalityId !== 'all' && r.modalityId !== filters.modalityId) return false
      if (filters.facultyCode !== 'all' && r.facultyCode !== filters.facultyCode) return false
      if (filters.period !== 'all' && r.period !== filters.period) return false
      if (q) {
        const haystack = normalize(
          `${r.radicado} ${r.studentName} ${r.studentCode} ${r.documentNumber} ${r.modalityName} ${r.program} ${r.nrc ?? ''}`,
        )
        if (!haystack.includes(q)) return false
      }
      return true
    })
  })

  const hasActiveFilters = computed(() => Object.keys(DEFAULT_FILTERS).some((k) => filters[k] !== DEFAULT_FILTERS[k]))

  const pendingCount = computed(() => requests.value.filter((r) => OPEN_STATUSES.includes(r.status)).length)

  const kpis = computed(() => {
    const total = requests.value.length
    const count = (s) => requests.value.filter((r) => r.status === s).length
    const approved = count('aprobada')
    const rejected = count('rechazada')
    const resolved = approved + rejected
    return {
      total,
      open: pendingCount.value,
      approved,
      rejected,
      returned: count('devuelta'),
      withoutAdvisor: requests.value.filter((r) => r.status !== 'rechazada' && !r.advisor).length,
      approvalRate: resolved ? Math.round((approved / resolved) * 100) : 0,
    }
  })

  const byModality = computed(() =>
    modalities.value
      .map((m) => ({
        id: m.id,
        name: m.shortName ?? m.name,
        count: requests.value.filter((r) => r.modalityId === m.id).length,
        slots: m.slots,
        slotsTaken: m.slotsTaken,
      }))
      .sort((a, b) => b.count - a.count),
  )

  const byFaculty = computed(() =>
    FACULTADES.map((f) => ({
      ...f,
      count: requests.value.filter((r) => r.facultyCode === f.codigo).length,
    })),
  )

  const byStatus = computed(() =>
    Object.entries(REQUEST_STATUS).map(([key, meta]) => ({
      key,
      ...meta,
      count: requests.value.filter((r) => r.status === key).length,
    })),
  )

  const recentRequests = computed(() => sortedRequests.value.slice(0, 6))

  // ---- Acciones -------------------------------------------------------------
  async function fetchRequests({ force = false } = {}) {
    if (loaded.value && !force) return
    loading.value = true
    error.value = null
    try {
      const [reqs, mods, docs] = await Promise.all([
        coordinationService.getRequests(),
        coordinationService.getModalities(),
        coordinationService.getAdvisors(),
      ])
      requests.value = reqs
      modalities.value = mods
      advisors.value = docs
      loaded.value = true
    } catch (e) {
      error.value = e.message ?? 'No fue posible cargar las solicitudes.'
    } finally {
      loading.value = false
    }
  }

  function openDetail(id) {
    selectedId.value = id
    drawerOpen.value = true
  }

  function closeDetail() {
    drawerOpen.value = false
  }

  function replace(updated) {
    const idx = requests.value.findIndex((r) => r.id === updated.id)
    if (idx !== -1) requests.value[idx] = updated
  }

  async function saveValidation(id, payload) {
    updating.value = true
    try {
      const updated = await coordinationService.updateValidation(id, payload)
      replace(updated)
      return updated
    } finally {
      updating.value = false
    }
  }

  async function changeStatus(id, status, comment = '') {
    const auth = useAuthStore()
    updating.value = true
    try {
      const updated = await coordinationService.updateRequestStatus(id, { status, comment, reviewer: auth.user?.name })
      replace(updated)
      return updated
    } finally {
      updating.value = false
    }
  }

  function resetFilters() {
    Object.assign(filters, DEFAULT_FILTERS)
  }

  return {
    requests, modalities, advisors, loading, loaded, error, updating, filters, selectedId, drawerOpen,
    sortedRequests, selectedRequest, periods, filteredRequests, hasActiveFilters, pendingCount,
    kpis, byModality, byFaculty, byStatus, recentRequests,
    fetchRequests, openDetail, closeDetail, saveValidation, changeStatus, resetFilters,
  }
})
