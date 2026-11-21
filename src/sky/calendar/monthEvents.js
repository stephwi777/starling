import { localParts, observerFor } from '../night.js'
import { eclipseEvents } from './eclipseEvents.js'
import { moonEvents } from './moonEvents.js'
import { planetEvents } from './planetEvents.js'
import { sunEvents } from './seasonEvents.js'
import { showerEvents } from './showerEvents.js'
import { DAY, dayKey, monthBounds, monthKey } from './skyTools.js'



// CACHE

const saved = new Map()
const LIMIT = 48



// MONTH EVENTS

function compute(place, year, month) {
  const { start, end } = monthBounds(year, month, place.timeZone)
  const from = new Date(start.getTime() - DAY)
  const to = new Date(end.getTime() + DAY)
  const observer = observerFor(place)
  const key = monthKey(year, month)

  return [
    ...moonEvents(from, to, place, observer),
    ...eclipseEvents(from, to, place, observer),
    ...planetEvents(from, to, place, observer),
    ...showerEvents(from, to, place, observer),
    ...sunEvents(from, to, place),
  ]
    .filter(event => event.day.startsWith(key))
    .sort((a, b) => a.day.localeCompare(b.day) || a.date - b.date)
}

export function monthEvents(place, year, month) {
  const key = `${place.latitude},${place.longitude},${place.timeZone},${place.country}|${year}-${month}`

  if (!saved.has(key)) {
    if (saved.size >= LIMIT) saved.delete(saved.keys().next().value)
    saved.set(key, compute(place, year, month))
  }

  return saved.get(key)
}



// FILTER

export function shownEvents(events, { kinds, world, query }) {
  const words = query.trim().toLowerCase()

  return events.filter(event => (
    event.kinds.some(kind => kinds.includes(kind))
    && (world || event.here)
    && (!words || `${event.name} ${event.tags.join(' ')} ${event.note}`.toLowerCase().includes(words))
  ))
}



// MONTHS AHEAD

export function monthsFrom(year, month, count) {
  return Array.from({ length: count }, (_, i) => {
    const index = month - 1 + i

    return { year: year + Math.floor(index / 12), month: (index % 12) + 1 }
  })
}



// COMING UP

export function upcoming(place, now, { kinds, count = 3, days = 30 }) {
  const today = dayKey(now, place.timeZone)
  const last = dayKey(new Date(now.getTime() + days * DAY), place.timeZone)
  const { year, month } = localParts(now, place.timeZone)

  return monthsFrom(year, month, 2)
    .flatMap(({ year: y, month: m }) => shownEvents(monthEvents(place, y, m), { kinds, world: false, query: '' }))
    .filter(event => event.day >= today && event.day <= last)
    .slice(0, count)
}
