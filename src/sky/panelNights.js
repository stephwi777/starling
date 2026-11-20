import { buildNight } from './night.js'



// SETTINGS

const HOUR = 60 * 60 * 1000
const FIRST = -1
const COUNT = 8



// NIGHTS

export function panelNights(place, now) {
  const nights = Array.from({ length: COUNT }, (_, i) => buildNight(place, FIRST + i, now))

  return { nights, tonight: -FIRST }
}



// CHOSEN HOUR

export function startHour(hours, now) {
  const current = hours.findIndex(hour => now >= hour.time && now - hour.time < HOUR)

  if (current !== -1) return current

  return Math.max(0, hours.findIndex(hour => hour.dark))
}

export function sameHour(offset, night, hours) {
  const target = night.noon.getTime() + offset
  const gap = hour => Math.abs(hour.time - target)

  return hours.reduce((best, hour, i) => (gap(hour) < gap(hours[best]) ? i : best), 0)
}
