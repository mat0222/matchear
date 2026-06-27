function pad2(n) {
  return String(n).padStart(2, '0')
}

export function buildHourlySlots({ startHour = 9, endHour = 22 } = {}) {
  const slots = []
  for (let h = startHour; h < endHour; h += 1) {
    slots.push(`${pad2(h)}:00`)
  }
  return slots
}
