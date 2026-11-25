/**
 * Motor simple de reglas para validar requisitos contra el perfil del estudiante.
 * El backend PHP debe repetir esta validación: el frontend solo da
 * retroalimentación inmediata.
 */
const operators = {
  '>=': (a, b) => Number(a) >= Number(b),
  '<=': (a, b) => Number(a) <= Number(b),
  '==': (a, b) => a === b,
  in: (a, b) => Array.isArray(b) && b.includes(a),
}

const COURSE_STATUS = { cursando: 'Cursando', aprobado: 'Aprobado', pendiente: 'Sin cursar' }

function display(value, unit) {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number') {
    const n = Number.isInteger(value) ? value : value.toFixed(1).replace('.', ',')
    return `${n}${unit ?? ''}`
  }
  return COURSE_STATUS[value] ?? value ?? '—'
}

export function evaluateRequirement(requirement, profile) {
  if (requirement.type === 'manual' || !requirement.rule) {
    return {
      status: 'pendiente',
      detail: 'Se valida después de cerrar la inscripción.',
    }
  }

  const { field, op, value } = requirement.rule
  const actual = profile?.[field]
  const check = operators[op]
  const ok = check ? check(actual, value) : false

  return {
    status: ok ? 'cumple' : 'no_cumple',
    actual,
    detail: `Tu registro: ${display(actual, requirement.unit)} · Exigido: ${requirement.expected}`,
  }
}

/** Modalidades habilitadas según nivel (pregrado/posgrado) y facultad del estudiante. */
export function isModalityAvailableFor(modality, profile) {
  if (!profile) return true
  if (modality.levels?.length && !modality.levels.includes(profile.level)) return false
  if (modality.excludeFaculties?.includes(profile.facultyCode)) return false
  return true
}
