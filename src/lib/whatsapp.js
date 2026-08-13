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
      `¡Hola! Cancelo mi reserva desde la web:\n` +
      `⚽ *Cancha:* ${pitchName}\n` +
      `📅 *Día:* ${dia}\n` +
      `⏰ *Hora:* ${hora}\n` +
      `💳 *Pago:* ${pago}` +
      (customerWhatsapp ? `\n📱 *Mi WhatsApp:* ${customerWhatsapp}` : '')
    )
  }

  return (
    `¡Hola! Acabo de hacer una reserva desde la web:\n` +
    `⚽ *Cancha:* ${pitchName}\n` +
    `📅 *Día:* ${dia}\n` +
    `⏰ *Hora:* ${hora}\n` +
    `💳 *Pago:* ${pago}` +
    (customerWhatsapp ? `\n📱 *Mi WhatsApp:* ${customerWhatsapp}` : '')
  )
}

/**
 * Enlace wa.me al número del dueño, con el mensaje ya redactado.
 * https://wa.me/<NUMERO>?text=<MENSAJE_ENCODIFICADO>
 */
export function whatsappOwnerUrl(message, phone = OWNER_WHATSAPP) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length < 10) return null
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
    `¡Hola! Solicito un *turno fijo* desde la web:\n` +
    `👤 *Nombre:* ${name}\n` +
    `📱 *WhatsApp:* ${phone}\n` +
    `📅 *Día:* ${day}\n` +
    `⏰ *Horario:* ${hora}\n` +
    `⚽ *Formato:* ${format}\n` +
    `📆 *Período:* ${periodo}` +
    (notes?.trim() ? `\n📝 *Detalles:* ${notes.trim()}` : '')
  )
}

/** Abre WhatsApp (app o Web) en una nueva pestaña hacia el dueño */
export function openWhatsappMessageToOwner(message) {
  const url = whatsappOwnerUrl(message)
  if (!url) {
    console.warn('VITE_WHATSAPP_OWNER no configurado')
    return null
  }
  window.open(url, '_blank', 'noopener,noreferrer')
  return url
}

export function openWhatsappToOwner(payload) {
  return openWhatsappMessageToOwner(buildBookingMessage(payload))
}

export function openWhatsappFixedSlotRequest(payload) {
  return openWhatsappMessageToOwner(buildFixedSlotMessage(payload))
}
