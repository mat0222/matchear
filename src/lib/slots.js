function pad2(n) {
  return String(n).padStart(2, '0')
}

export function buildHourlySlots({ startHour = 9, endHour = 22 } = {}) {
  // returns slots like "09:00" .. "21:00" (each slot is 1h)
  const slots = []
  for (let h = startHour; h < endHour; h += 1) {
    slots.push(`${pad2(h)}:00`)
  }
  return slots
}



