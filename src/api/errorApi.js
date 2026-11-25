/**
 * Error normalizado de la capa HTTP.
 * Compatible con el formato de validación típico de Laravel:
 * { message: string, errors: { campo: [mensajes] } }
 */
export class ApiError extends Error {
  constructor(message, { status = 0, errors = {}, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.data = data
  }

  /** Primer mensaje de error para un campo (útil en formularios). */
  fieldError(field) {
    const value = this.errors?.[field]
    return Array.isArray(value) ? value[0] : value
  }
}
