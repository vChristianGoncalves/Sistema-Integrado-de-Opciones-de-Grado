/**
 * Información institucional y de la convocatoria vigente.
 * Fuente: formulario "Inscripción Opciones de grado programas virtuales y presenciales
 * 2026-20/2026-34-44 y P4", comunicados de la Coordinación de Investigación y Creación
 * y Resolución 617 de 2024 (Reglamento de Investigación, Innovación y Creación).
 *
 * Al conectar el backend, estos datos pueden venir de un endpoint /convocatoria-vigente.
 */
export const INSTITUCION = {
  nombre: 'Corporación Universitaria Iberoamericana',
  nombreCorto: 'Ibero',
  direccion: 'Dirección de Investigación y Transferencia',
  coordinacion: 'Coordinación de Investigación y Creación',
  correo: 'coord.investigaciones@academico.ibero.edu.co',
  horario: 'Lunes a viernes · 8:00 a. m. – 6:00 p. m.',
}

export const CONVOCATORIA = {
  titulo: 'Inscripción Opciones de grado programas virtuales y presenciales 2026-20 / 2026-34-44 y P4',
  periodos: '2026-20 · 2026-34-44 · P4',
  fechaLimite: '2026-08-14',
  fechaLimiteTexto: '14 de agosto de 2026',
  avanceMinimo: 60,
  notaMinimaAprobatoria: 3.5,
  nota:
    'Este proceso de inscripción es válido para iniciar la opción de grado en los periodos señalados según modalidad. ' +
    'Si no se matricula o aplaza el desarrollo de la opción de grado deberá volver a realizar el proceso.',
}

export const ENLACES = {
  reglamento: 'https://investigaciones.ibero.edu.co/',
  omp: 'https://publicaciones.ibero.edu.co/index.php/t-grad/user/register',
  modalidades: 'https://view.genially.com/66e9e124520fc8626ad830f0',
  avalEtico: 'https://investigaciones.ibero.edu.co/?page_id=2449',
}

/** Facultades y bases consolidadas por periodo (documento "Resultado formulario opción de grado"). */
export const FACULTADES = [
  { codigo: 'FCE', nombre: 'Facultad de Ciencias Empresariales', modalidad: 'Presencial y virtual', periodos: ['202620', '202634'] },
  { codigo: 'FCHS', nombre: 'Facultad de Ciencias Humanas y Sociales', modalidad: 'Presencial', periodos: ['202620'] },
  { codigo: 'FCS', nombre: 'Facultad de Ciencias de la Salud', modalidad: 'Presencial y virtual', periodos: ['202620', '202634'] },
  { codigo: 'FE', nombre: 'Facultad de Educación', modalidad: 'Virtual', periodos: ['202634'] },
  { codigo: 'FI', nombre: 'Facultad de Ingeniería', modalidad: 'Virtual', periodos: ['202634'] },
]

/** Asignaturas del componente investigativo (pregrado). */
export const ASIGNATURAS = ['Procesos Investigativos', 'Trabajo de Grado I', 'Trabajo de Grado II']

/**
 * Ruta del proceso de opción de grado (flujograma del comunicado + validación,
 * asignación docente y creación de aulas).
 */
export const RUTA_PROCESO = [
  {
    titulo: 'Componente investigativo',
    detalle: 'Cursar o aprobar Procesos Investigativos o Investigación I y II, según tu plan de estudios.',
  },
  { titulo: 'Preinscripción', detalle: 'Diligenciar el formulario de preinscripción de opción de grado.' },
  { titulo: 'Selección de modalidad', detalle: 'Elegir una de las modalidades investigativas disponibles.' },
  {
    titulo: 'Validación de requisitos',
    detalle: 'El programa académico valida tu estado académico (aval académico) y el aval financiero.',
  },
  {
    titulo: 'Asignación docente y aulas',
    detalle: 'La Coordinación asigna el docente asesor y solicita la creación del aula virtual (TG I / TG II).',
  },
  {
    titulo: 'Notificación formal',
    detalle: 'Recibes por correo institucional la asignación, los formatos y la ruta de tu modalidad.',
  },
  {
    titulo: 'Desarrollo y entrega',
    detalle: 'Desarrollas la opción de grado y cargas los requisitos de finalización en OMP. Nota mínima: 3,5.',
  },
]
