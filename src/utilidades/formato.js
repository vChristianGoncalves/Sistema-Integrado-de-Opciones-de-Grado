const dateFmt = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatDate = (value) => (value ? dateFmt.format(new Date(value)) : '—')
export const formatDateTime = (value) => (value ? dateTimeFmt.format(new Date(value)) : '—')

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let n = bytes
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

/** Minúsculas y sin tildes, para búsquedas tolerantes. */
export const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
