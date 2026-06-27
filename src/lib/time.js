export function isoDay(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function prettyDay(iso) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

export function formatARS(value) {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `$${value}`
  }
}
