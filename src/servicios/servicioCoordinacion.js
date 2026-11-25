import http from '@/api/clienteHttp'
import { ApiError } from '@/api/errorApi'
import { USE_MOCK_DATA, mockDelay, clone } from './configuracion'
import { REQUEST_STATUS } from '@/utilidades/estados'
import { db } from '@/simulados/baseDatos'

const ACTION_LABELS = {
  en_revision: 'Bases remitidas al programa para aval académico y financiero',
  aprobada: 'Aprobada y docente asignado',
  rechazada: 'No cumple requisitos',
  devuelta: 'Se solicitaron ajustes',
}

const ENDORSEMENT_REQ = { academicEndorsement: 'REQ-AVAL-ACADEMICO', financialEndorsement: 'REQ-AVAL-FINANCIERO' }
const ENDORSEMENT_TO_REQ = { aprobado: 'cumple', no_aprobado: 'no_cumple', pendiente: 'pendiente' }

/**
 * Contrato esperado del backend PHP:
 *  GET   /coordinacion/solicitudes?status=&modality_id=&faculty=&period=&search=  -> lista
 *  GET   /coordinacion/solicitudes/{id}                                           -> detalle
 *  PATCH /coordinacion/solicitudes/{id}/validacion
 *        { academic_endorsement, financial_endorsement, advisor, course, nrc }   -> solicitud
 *  PATCH /coordinacion/solicitudes/{id}/estado { status, comment }               -> solicitud
 *  GET   /coordinacion/docentes                                                   -> docentes asesores
 *  GET   /modalidades                                                             -> catálogo
 */
export const coordinationService = {
  async getRequests(params = {}) {
    if (USE_MOCK_DATA) {
      await mockDelay(600)
      return clone(db.requests)
    }
    const { data } = await http.get('/coordinacion/solicitudes', { params })
    return data.data ?? data
  },

  async getRequestById(id) {
    if (USE_MOCK_DATA) {
      await mockDelay(250)
      const found = db.requests.find((r) => r.id === id)
      if (!found) throw new ApiError('La solicitud no existe.', { status: 404 })
      return clone(found)
    }
    const { data } = await http.get(`/coordinacion/solicitudes/${id}`)
    return data.data ?? data
  },

  async getModalities() {
    if (USE_MOCK_DATA) {
      await mockDelay(200)
      return clone(db.modalities)
    }
    const { data } = await http.get('/modalidades')
    return data.data ?? data
  },

  async getAdvisors() {
    if (USE_MOCK_DATA) {
      await mockDelay(150)
      return clone(db.advisors)
    }
    const { data } = await http.get('/coordinacion/docentes')
    return data.data ?? data
  },

  /** Registra avales, docente asesor, asignatura y NRC (estructura de las bases de seguimiento). */
  async updateValidation(id, { academicEndorsement, financialEndorsement, advisor, course, nrc }) {
    if (USE_MOCK_DATA) {
      await mockDelay(500)
      const request = db.requests.find((r) => r.id === id)
      if (!request) throw new ApiError('La solicitud no existe.', { status: 404 })
      Object.assign(request, { academicEndorsement, financialEndorsement, advisor: advisor || null, course, nrc: nrc || null })
      Object.entries(ENDORSEMENT_REQ).forEach(([field, reqId]) => {
        const req = request.requirements.find((r) => r.id === reqId)
        if (req) req.status = ENDORSEMENT_TO_REQ[request[field]]
      })
      request.updatedAt = new Date().toISOString()
      return clone(request)
    }
    const { data } = await http.patch(`/coordinacion/solicitudes/${id}/validacion`, {
      academic_endorsement: academicEndorsement,
      financial_endorsement: financialEndorsement,
      advisor,
      course,
      nrc,
    })
    return data.data ?? data
  },

  async updateRequestStatus(id, { status, comment, reviewer }) {
    if (!REQUEST_STATUS[status]) throw new ApiError('Estado no válido.', { status: 422 })

    if (USE_MOCK_DATA) {
      await mockDelay(700)
      const request = db.requests.find((r) => r.id === id)
      if (!request) throw new ApiError('La solicitud no existe.', { status: 404 })

      const now = new Date().toISOString()
      request.status = status
      request.updatedAt = now
      if (status === 'aprobada') {
        request.documents.forEach((d) => (d.status = 'validado'))
        request.requirements.forEach((r) => r.status === 'pendiente' && (r.status = 'cumple'))
      }
      request.history.push({
        date: now,
        action: ACTION_LABELS[status] ?? 'Estado actualizado',
        by: reviewer ?? 'Coordinación de Investigación y Creación',
        comment: comment || null,
      })
      return clone(request)
    }

    const { data } = await http.patch(`/coordinacion/solicitudes/${id}/estado`, { status, comment })
    return data.data ?? data
  },
}
