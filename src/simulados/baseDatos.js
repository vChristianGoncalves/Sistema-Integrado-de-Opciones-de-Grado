/**
 * "Base de datos" en memoria para el modo simulado.
 * Lo que preinscribe un estudiante aparece en el panel de la coordinación durante
 * la misma sesión del navegador (se reinicia al recargar).
 */
import solicitudes from './solicitudes.json'
import estudiantes from './estudiantes.json'
import modalidades from './modalidades.json'
import requisitos from './requisitos.json'
import usuarios from './usuarios.json'
import docentes from './docentes.json'

const clone = (o) => JSON.parse(JSON.stringify(o))

export const db = {
  requests: clone(solicitudes),
  students: clone(estudiantes),
  modalities: clone(modalidades),
  requirements: clone(requisitos),
  users: clone(usuarios),
  advisors: clone(docentes),
  nextSequence: 159,
}
