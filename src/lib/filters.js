import { buildHourlySlots } from './slots.js'

export const SPORTS = [
  { id: 'futbol', label: 'Fútbol' },
  { id: 'padel', label: 'Pádel' },
  { id: 'tenis', label: 'Tenis' },
]

export const SURFACES = [
  { id: 'sintetico', label: 'Sintético' },
  { id: 'cesped', label: 'Césped' },
  { id: 'cemento', label: 'Cemento' },
]

export const ROOFS = [
  { id: 'descubierta', label: 'Descubierta' },
  { id: 'techada', label: 'Techada' },
]

export const TIME_WINDOWS = [
  { id: 'any', label: 'Cualquier horario' },
  { id: 'morning', label: 'Mañana (09–12)' },
  { id: 'afternoon', label: 'Tarde (12–18)' },
  { id: 'night', label: 'Noche (18–22)' },
]

function hourOf(slot) {
  // "09:00" -> 9
  return Number.parseInt(String(slot).slice(0, 2), 10)
}

export function slotsForTimeWindow(timeWindow, { startHour = 9, endHour = 22 } = {}) {
  const slots = buildHourlySlots({ startHour, endHour })
  if (!timeWindow || timeWindow === 'any') return slots
  return slots.filter((s) => {
    const h = hourOf(s)
    if (timeWindow === 'morning') return h >= 9 && h < 12
    if (timeWindow === 'afternoon') return h >= 12 && h < 18
    return h >= 18 && h < 22
  })
}

export function pitchMatchesFilters(pitch, filters, { startHour = 9, endHour = 22 } = {}) {
  if (filters.sport !== 'any' && pitch.sport !== filters.sport) return false
  if (filters.surface !== 'any' && pitch.surface !== filters.surface) return false
  if (filters.roof !== 'any' && pitch.roof !== filters.roof) return false

  if (filters.timeWindow && filters.timeWindow !== 'any') {
    // Keep as a shape filter only; real availability is computed elsewhere.
    const slots = slotsForTimeWindow(filters.timeWindow, { startHour, endHour })
    if (slots.length === 0) return false
  }

  return true
}


