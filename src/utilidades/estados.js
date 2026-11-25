/** Catálogos de estados → etiqueta y variante visual de EtiquetaEstado. */

export const REQUEST_STATUS = {
  pendiente: { label: 'Preinscrita', variant: 'warning' },
  en_revision: { label: 'En validación', variant: 'warning' },
  devuelta: { label: 'Requiere ajustes', variant: 'info' },
  aprobada: { label: 'Aprobada y asignada', variant: 'success' },
  rechazada: { label: 'No cumple', variant: 'danger' },
}

/** Estados que aún requieren gestión por parte de la coordinación. */
export const OPEN_STATUSES = ['pendiente', 'en_revision']

export const REQUIREMENT_STATUS = {
  cumple: { label: 'Cumple', variant: 'success' },
  pendiente: { label: 'Por validar', variant: 'warning' },
  no_cumple: { label: 'No cumple', variant: 'danger' },
}

export const DOCUMENT_STATUS = {
  validado: { label: 'Validado', variant: 'success' },
  pendiente: { label: 'Pendiente', variant: 'warning' },
  rechazado: { label: 'Rechazado', variant: 'danger' },
}

/** Aval académico (programa) y aval financiero (sello financiero). */
export const ENDORSEMENT_STATUS = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  aprobado: { label: 'Aprobado', variant: 'success' },
  no_aprobado: { label: 'No aprobado', variant: 'danger' },
}

export const STATUS_CATALOGS = {
  request: REQUEST_STATUS,
  requirement: REQUIREMENT_STATUS,
  document: DOCUMENT_STATUS,
  endorsement: ENDORSEMENT_STATUS,
}
