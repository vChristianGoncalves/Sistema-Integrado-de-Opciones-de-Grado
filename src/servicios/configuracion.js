/**
 * Flag global de datos simulados.
 * Cambia VITE_USE_MOCK_DATA=false en .env para consumir el backend PHP real.
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

/** Simula latencia de red para que la UI muestre estados de carga reales. */
export const mockDelay = (ms = 450) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 300))

export const clone = (value) => JSON.parse(JSON.stringify(value))
