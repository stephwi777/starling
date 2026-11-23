import { localParts, observerFor } from '../night.js'
import { cometSeason } from './cometEvents.js'
import { cometState } from './cometStore.js'
import { eclipseEvents } from './eclipseEvents.js'
import { isFavorite } from './favorites.js'
import { moonEvents } from './moonEvents.js'
import { planetEvents } from './planetEvents.js'
import { sunEvents } from './seasonEvents.js'
import { showerEvents } from './showerEvents.js'
import { starEvents } from './starEvents.js'
import { DAY, dayKey, monthBounds, monthKey } from './skyTools.js'



// CACHE

const saved = new Map()
const LIMIT = 48



// MONTH EVENTS

function cometEvents(place, { comets, now }) {
  return comets.length ? cometSeason(comets, place, now) : []
}

function compute(place, year, month, comets) {
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
    ...starEvents(from, to, place, observer),
    ...sunEvents(from, to, place),
    ...cometEvents(place, comets),
  ]
    .filter(event => event.day.startsWith(key))
    .sort((a, b) => a.day.localeCompare(b.day) || a.date - b.date)
}

export function monthEvents(place, year, month, comets = cometState()) {
  const key = `${place.latitude},${place.longitude},${place.timeZone},${place.country}|${year}-${month}|c${comets.version}`

  if (!saved.has(key)) {
    if (saved.size >= LIMIT) saved.delete(saved.keys().next().value)
    saved.set(key, compute(place, year, month, comets))
  }

  return saved.get(key)
}



// FILTER

export function shownEvents(events, { kinds, world, query, favorites = [], keep = null }) {
  const words = query.trim().toLowerCase()
  const loved = event => isFavorite(event, favorites)

  return events
    .filter(event => (
      (event.kinds.some(kind => kinds.includes(kind)) || loved(event) || event.id === keep)
      && (world || event.here)
      && (!words || `${event.name} ${event.tags.join(' ')} ${event.note}`.toLowerCase().includes(words))
    ))
    .sort((a, b) => (a.day === b.day ? loved(b) - loved(a) : a.day < b.day ? -1 : 1))
}



// MONTHS AHEAD

export function monthsFrom(year, month, count) {
  return Array.from({ length: count }, (_, i) => {
    const index = month - 1 + i

    return { year: year + Math.floor(index / 12), month: (index % 12) + 1 }
  })
}



// COMING UP

export function upcoming(place, now, { kinds, favorites = [], count = 3, days = 30 }) {
  const today = dayKey(now, place.timeZone)
  const last = dayKey(new Date(now.getTime() + days * DAY), place.timeZone)
  const { year, month } = localParts(now, place.timeZone)

  return monthsFrom(year, month, 2)
    .flatMap(({ year: y, month: m }) => shownEvents(monthEvents(place, y, m), { kinds, favorites, world: false, query: '' }))
    .filter(event => event.day >= today && event.day <= last)
    .sort((a, b) => (a.day === b.day ? a.date - b.date : a.day < b.day ? -1 : 1))
    .slice(0, count)
}
