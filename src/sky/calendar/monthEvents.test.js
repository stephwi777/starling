import { expect, test } from 'vitest'
import { DEFAULT_KINDS, KINDS } from './kinds.js'
import { leavesOnClose, monthEvents, monthsFrom, shownEvents, upcoming } from './monthEvents.js'
import { cometSeason } from './cometEvents.js'
import { SAMPLE_COMETS } from './cometSample.js'
import { setCometState } from './cometStore.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const ALL = KINDS.map(kind => kind.id)

const february = monthEvents(KC, 2027, 2)



// TESTS

test('a month holds only its own days, in order', () => {
  expect(february.every(event => event.day.startsWith('2027-02'))).toBe(true)
  expect(february.map(event => event.day)).toEqual([...february.map(event => event.day)].sort())
})

test('every event belongs to a known kind and group', () => {
  expect(february.every(event => event.kinds.every(kind => ALL.includes(kind)))).toBe(true)
  expect(new Set(february.map(event => event.group))).toEqual(new Set(['moon', 'eclipse', 'planet', 'sun']))
})

test('the default kinds hide the lesser-known events', () => {
  const shown = shownEvents(february, { kinds: DEFAULT_KINDS, world: false, query: '' })

  expect(shown.some(event => event.kinds.includes('station'))).toBe(false)
  expect(shown.map(event => event.short)).toContain('Jupiter at its best')
})

test('Worldwide adds events that can’t be seen from here', () => {
  const here = shownEvents(february, { kinds: ALL, world: false, query: '' })
  const world = shownEvents(february, { kinds: ALL, world: true, query: '' })

  expect(here.some(event => event.short === 'Annular eclipse')).toBe(false)
  expect(world.some(event => event.short === 'Annular eclipse')).toBe(true)
})

test('search matches names and notes, ignoring case', () => {
  const found = shownEvents(february, { kinds: ALL, world: true, query: 'JUPITER' })

  expect(found.length).toBeGreaterThan(0)
  expect(found.every(event => `${event.name} ${event.note}`.toLowerCase().includes('jupiter'))).toBe(true)
})

test('a favorite shows even when its kind is off', () => {
  const station = february.find(event => event.kinds.includes('station'))
  const shown = shownEvents(february, { kinds: DEFAULT_KINDS, world: false, query: '', favorites: [station.subjects[0].key] })

  expect(shown).toContain(station)
})

test('a favorite still follows Visible from here and search', () => {
  const away = february.find(event => !event.here)
  const favorites = [away.subjects[0].key]

  expect(shownEvents(february, { kinds: [], world: false, query: '', favorites })).not.toContain(away)
  expect(shownEvents(february, { kinds: [], world: true, query: 'zzzz', favorites })).not.toContain(away)
  expect(shownEvents(february, { kinds: [], world: true, query: '', favorites })).toContain(away)
})

test('an event kept open stays shown', () => {
  const station = february.find(event => event.kinds.includes('station'))

  expect(shownEvents(february, { kinds: DEFAULT_KINDS, world: false, query: '', keep: station.id })).toContain(station)
})

test('favorites come first within their day', () => {
  const filters = { kinds: ALL, world: true, query: '' }
  const plain = shownEvents(february, filters)
  const day = plain.find((event, index) => plain[index + 1]?.day === event.day).day
  const second = plain.filter(event => event.day === day)[1]
  const key = second.subjects[0].key
  const favored = shownEvents(february, { ...filters, favorites: [key] })
  const loved = event => event.subjects.some(subject => subject.key === key)

  expect(loved(favored.filter(event => event.day === day)[0])).toBe(true)
  expect(favored.filter(event => !loved(event)).map(event => event.id)).toEqual(plain.filter(event => !loved(event)).map(event => event.id))
})

test('only my favorites shows just the favorites', () => {
  const jupiter = february.find(event => event.short === 'Jupiter at its best')
  const key = jupiter.subjects[0].key
  const shown = shownEvents(february, { kinds: ALL, world: true, query: '', favorites: [key], favoritesOnly: true })

  expect(shown.length).toBeGreaterThan(0)
  expect(shown.every(event => event.subjects.some(subject => subject.key === key))).toBe(true)
})

test('only my favorites does nothing while there are no favorites', () => {
  const filters = { kinds: DEFAULT_KINDS, world: false, query: '' }

  expect(shownEvents(february, { ...filters, favorites: [], favoritesOnly: true })).toEqual(shownEvents(february, filters))
})

test('an event un-starred while its card was open leaves once the card closes', () => {
  const jupiter = february.find(event => event.short === 'Jupiter at its best')
  const others = february.find(event => event !== jupiter && event.kinds.includes('full-moon'))
  const filters = { kinds: ALL, world: true, query: '', favorites: [others.subjects[0].key], favoritesOnly: true, keep: jupiter.id }

  expect(leavesOnClose(jupiter, february, filters)).toBe(true)
  expect(leavesOnClose(others, february, filters)).toBe(false)
})

test('months roll over into the next year', () => {
  expect(monthsFrom(2026, 11, 3)).toEqual([{ year: 2026, month: 11 }, { year: 2026, month: 12 }, { year: 2027, month: 1 }])
})

test('a month is remembered instead of worked out again', () => {
  expect(monthEvents(KC, 2027, 2)).toBe(february)
})



// COMING UP

test('coming up lists the next few events from today, in order', () => {
  const soon = upcoming(KC, new Date('2026-11-13T20:00:00Z'), { kinds: DEFAULT_KINDS, count: 10 })

  expect(soon[0].day >= '2026-11-13').toBe(true)
  expect(soon.map(event => event.day)).toEqual([...soon.map(event => event.day)].sort())
  expect(soon.map(event => event.name)).toContain('Leonids peak')
  expect(soon.every(event => event.day <= '2026-12-13')).toBe(true)
})

test('coming up follows the chosen kinds', () => {
  const soon = upcoming(KC, new Date('2026-11-13T20:00:00Z'), { kinds: ['full-moon'], count: 10 })

  expect(soon.map(event => event.name)).toEqual(['Full Beaver Moon'])
})

test('coming up keeps date order and its count with favorites', () => {
  const now = new Date('2026-11-13T20:00:00Z')
  const plain = upcoming(KC, now, { kinds: ALL, count: 20 })
  const soon = upcoming(KC, now, { kinds: DEFAULT_KINDS, favorites: plain.map(event => event.subjects[0].key), count: 3 })

  expect(soon.length).toBe(3)
  expect(soon.map(event => event.day)).toEqual([...soon.map(event => event.day)].sort())
})

test('a favorite never jumps ahead of an earlier event on Coming up', () => {
  const now = new Date('2026-11-13T20:00:00Z')
  const plain = upcoming(KC, now, { kinds: ALL, count: 40 })
  const cut = plain.findIndex((event, index) => plain[index + 1]?.day === event.day && plain.slice(0, index + 1).every(early => early.subjects[0].key !== plain[index + 1].subjects[0].key))
  const later = plain[cut + 1]
  const soon = upcoming(KC, now, { kinds: ALL, favorites: [later.subjects[0].key], count: cut + 1 })

  expect(soon.map(event => event.id)).toEqual(plain.slice(0, cut + 1).map(event => event.id))
})

test('every event has a short name for phone calendars', () => {
  const year = Array.from({ length: 12 }, (_, i) => monthEvents(KC, 2027, i + 1)).flat()

  expect(year.filter(event => !event.tiny)).toEqual([])
  expect(year.every(event => event.tiny.length <= 20)).toBe(true)
}, 30000)



// COMETS

test('comet events join a month once the store has comets', () => {
  setCometState({ comets: SAMPLE_COMETS, status: 'ready', now: new Date('2026-12-01T12:00:00Z') })

  const months = monthsFrom(2026, 12, 12).flatMap(({ year, month }) => monthEvents(KC, year, month))

  setCometState({ comets: [], status: 'loading' })

  expect(months.some(event => event.group === 'comet')).toBe(true)
  expect(monthEvents(KC, 2026, 12).some(event => event.group === 'comet')).toBe(false)
})

test('a deep-linked comet id is stable across refreshes', () => {
  const now = new Date('2026-12-01T12:00:00Z')
  const first = cometSeason(SAMPLE_COMETS, KC, now).map(event => event.id)
  const again = cometSeason(SAMPLE_COMETS.map(comet => ({ ...comet })), KC, now).map(event => event.id)

  expect(again).toEqual(first)
})
