import http from '@/api/clienteHttp'
import { ApiError } from '@/api/errorApi'
import { USE_MOCK_DATA, mockDelay, clone } from './configuracion'
import { db } from '@/simulados/baseDatos'

/**
 * Contrato esperado del backend PHP:
 *  GET  /estudiantes/me/perfil           -> perfil académico
 *  GET  /modalidades                      -> catálogo de modalidades investigativas
 *  GET  /requisitos                       -> catálogo de requisitos
 *  POST /estudiantes/me/inscripciones     (multipart/form-data) -> { id, radicado, status, submittedAt }
 *  GET  /estudiantes/me/inscripciones     -> historial del estudiante
 */
export const studentService = {
  async getProfile(studentId) {
    if (USE_MOCK_DATA) {
      await mockDelay()
      return clone(db.students.find((s) => s.id === studentId) ?? db.students[0])
    }
    const { data } = await http.get('/estudiantes/me/perfil')
    return data.data ?? data
  },

  async getModalities() {
    if (USE_MOCK_DATA) {
      await mockDelay()
      return clone(db.modalities)
    }
    const { data } = await http.get('/modalidades')
    return data.data ?? data
  },

  async getRequirements() {
    if (USE_MOCK_DATA) {
      await mockDelay(200)
      return clone(db.requirements)
    }
    const { data } = await http.get('/requisitos')
    return data.data ?? data
  },

  /**
   * @param {{ profile, modality, fields, documents, observations, requirements }} payload
   * documents: { [docKey]: File[] }
   */
  async submitInscription({ profile, modality, fields, documents, observations, requirements }) {
    if (USE_MOCK_DATA) {
      await mockDelay(1200)

      // Res. 617/2024, art. 25 parágrafo 1: una sola opción de grado.
      const duplicated = db.requests.find(
        (r) => r.studentCode === profile.code && ['pendiente', 'en_revision', 'aprobada'].includes(r.status),
      )
      if (duplicated) {
        throw new ApiError(
          `Ya tienes una inscripción registrada (${duplicated.radicado}). Solo se puede desarrollar una opción de grado.`,
          { status: 409 },
        )
      }

      const seq = String(db.nextSequence++).padStart(4, '0')
      const now = new Date().toISOString()
      const request = {
        id: `SOL-2026-${seq}`,
        radicado: `OG-2026-${seq}`,
        studentName: profile.fullName,
        studentCode: profile.code,
        documentNumber: profile.documentNumber,
        studentEmail: profile.email,
        program: profile.program,
        facultyCode: profile.facultyCode,
        faculty: profile.faculty,
        studyMode: profile.studyMode,
        level: profile.level,
        gpa: profile.gpa,
        academicProgress: profile.academicProgress,
        researchGrade: null,
        modalityId: modality.id,
        modalityName: modality.name,
        period: profile.academicPeriod,
        course: profile.researchCourse,
        nrc: null,
        academicEndorsement: 'pendiente',
        financialEndorsement: 'pendiente',
        advisor: null,
        status: 'pendiente',
        submittedAt: now,
        updatedAt: now,
        details: modality.fields
          .filter((f) => fields[f.key])
          .map((f) => ({ key: f.key, label: f.label, value: fields[f.key] })),
        documents: modality.documents.flatMap((d) =>
          (documents[d.key] ?? []).map((file) => ({
            key: d.key,
            label: d.label,
            fileName: file.name,
            size: file.size,
            status: 'pendiente',
          })),
        ),
        requirements: requirements.map((r) => ({ id: r.id, name: r.name, expected: r.expected, status: r.status })),
        history: [{ date: now, action: 'Preinscripción radicada', by: profile.fullName, comment: null }],
        observations: observations ?? '',
      }
      db.requests.unshift(request)
      return { id: request.id, radicado: request.radicado, status: request.status, submittedAt: now }
    }

    // ---- Backend real: multipart/form-data -----------------------------------
    const form = new FormData()
    form.append('modality_id', modality.id)
    form.append('observations', observations ?? '')
    Object.entries(fields).forEach(([key, value]) => form.append(`fields[${key}]`, value ?? ''))
    Object.entries(documents).forEach(([key, files]) =>
      (files ?? []).forEach((file) => form.append(`documents[${key}][]`, file)),
    )
    const { data } = await http.post('/estudiantes/me/inscripciones', form)
    return data.data ?? data
  },

  async getMyRequests(studentCode) {
    if (USE_MOCK_DATA) {
      await mockDelay()
      return clone(db.requests.filter((r) => r.studentCode === studentCode))
    }
    const { data } = await http.get('/estudiantes/me/inscripciones')
    return data.data ?? data
  },
}
