const PAYMENT_LABELS = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
}

/** Número del dueño/complejo (código país, sin + ni espacios). Configurable en .env */
export const OWNER_WHATSAPP =
  (import.meta.env.VITE_WHATSAPP_OWNER || '').replace(/\D/g, '')

export function isOwnerWhatsappConfigured() {
  return OWNER_WHATSAPP.length >= 10
}

export function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

function formatDayLabel(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  if (!d) return iso
  return `${d}/${m}`
}

export function buildBookingMessage({
  pitchName,
  date,
  slot,
  paymentMethod,
  customerWhatsapp,
  status = 'confirmed',
}) {
  const pago = PAYMENT_LABELS[paymentMethod] || paymentMethod || '—'
  const dia = formatDayLabel(date)
  const hora = slot?.includes('hs') ? slot : `${slot} hs`

  if (status === 'cancelled') {
    return (
      `Hola! Cancelo mi reserva desde la web:\n` +
      `Cancha: ${pitchName}\n` +
      `Dia: ${dia}\n` +
      `Hora: ${hora}\n` +
      `Pago: ${pago}` +
      (customerWhatsapp ? `\nMi WhatsApp: ${customerWhatsapp}` : '')
    )
  }

  return (
    `Hola! Acabo de hacer una reserva desde la web:\n` +
    `Cancha: ${pitchName}\n` +
    `Dia: ${dia}\n` +
    `Hora: ${hora}\n` +
    `Pago: ${pago}` +
    (customerWhatsapp ? `\nMi WhatsApp: ${customerWhatsapp}` : '')
  )
}

function ownerDigits(phone = OWNER_WHATSAPP) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits.length >= 10 ? digits : null
}

export function whatsappOwnerUrl(message, phone = OWNER_WHATSAPP) {
  const digits = ownerDigits(phone)
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

const PERIOD_LABELS = {
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual',
}

export function buildFixedSlotMessage({ name, phone, day, hour, format, period, notes }) {
  const periodo = PERIOD_LABELS[period] || period || '—'
  const hora = hour?.includes('hs') ? hour : `${hour} hs`

  return (
    `Hola! Solicito un turno fijo desde la web:\n` +
    `Nombre: ${name}\n` +
    `WhatsApp: ${phone}\n` +
    `Dia: ${day}\n` +
    `Horario: ${hora}\n` +
    `Formato: ${format}\n` +
    `Periodo: ${periodo}` +
    (notes?.trim() ? `\nDetalles: ${notes.trim()}` : '')
  )
}

/** Abre wa.me directo con el mensaje ya escrito. */
export function openWhatsappMessageToOwner(message) {
  const webUrl = whatsappOwnerUrl(message)
  if (!webUrl) return null

  const opened = window.open(webUrl, '_blank', 'noopener,noreferrer')
  if (!opened && isMobileDevice()) {
    window.location.href = webUrl
  }
  return webUrl
}

export function openWhatsappToOwner(payload) {
  return openWhatsappMessageToOwner(buildBookingMessage(payload))
}

export function openWhatsappFixedSlotRequest(payload) {
  return openWhatsappMessageToOwner(buildFixedSlotMessage(payload))
}
