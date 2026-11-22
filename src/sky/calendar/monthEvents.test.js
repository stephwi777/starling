import { expect, test } from 'vitest'
import { DEFAULT_KINDS, KINDS } from './kinds.js'
import { monthEvents, monthsFrom, shownEvents, upcoming } from './monthEvents.js'



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
  expect(soon.map(event => event.short)).toContain('Leonids peak')
  expect(soon.every(event => event.day <= '2026-12-13')).toBe(true)
})

test('coming up follows the chosen kinds', () => {
  const soon = upcoming(KC, new Date('2026-11-13T20:00:00Z'), { kinds: ['full-moon'], count: 10 })

  expect(soon.map(event => event.short)).toEqual(['Full Beaver Moon'])
})

test('every event has a short name for phone calendars', () => {
  const year = Array.from({ length: 12 }, (_, i) => monthEvents(KC, 2027, i + 1)).flat()

  expect(year.filter(event => !event.tiny)).toEqual([])
  expect(year.every(event => event.tiny.length <= 20)).toBe(true)
})
