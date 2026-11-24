import { expect, test, vi } from 'vitest'
import { KINDS } from './kinds.js'
import { PAUSE, matchSearch, runSearch, searchStart } from './nextMatch.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const ALL = KINDS.map(kind => kind.id)
const NONE = { comets: [], version: 'test', now: new Date('2026-11-23T12:00:00Z') }
const filters = query => ({ kinds: ALL, world: false, query })

function run(search) {
  const steps = [...search]

  return { steps, last: steps.at(-1) }
}



// TESTS

test('search starts the month after the one on screen', () => {
  expect(searchStart({ year: 2026, month: 12 }, { year: 2026, month: 11 })).toEqual({ year: 2027, month: 1 })
})

test('search never starts in the past', () => {
  expect(searchStart({ year: 2025, month: 3 }, { year: 2026, month: 11 })).toEqual({ year: 2026, month: 11 })
})

test('search stops at the first month with a match', () => {
  const { steps, last } = run(matchSearch(KC, { year: 2026, month: 11 }, filters('Perseids'), NONE))

  expect(last.match.name).toBe('Perseids peak')
  expect(last.match.day.startsWith('2027-08')).toBe(true)
  expect(steps.length).toBeLessThan(11)
}, 30000)

test('search gives up after 36 months', () => {
  const { steps, last } = run(matchSearch(KC, { year: 2026, month: 11 }, filters('zzzz'), NONE))

  expect(steps).toHaveLength(36)
  expect(last).toEqual({ match: null, done: true })
}, 30000)

test('search follows only my favorites', () => {
  const key = 'shower:Geminids'
  const { last } = run(matchSearch(KC, { year: 2026, month: 11 }, { ...filters('peak'), favorites: [key], favoritesOnly: true }, NONE))

  expect(last.match.subjects.some(subject => subject.key === key)).toBe(true)
})

test('two searches never share their place', () => {
  const first = matchSearch(KC, { year: 2026, month: 11 }, filters('Perseids'), NONE)
  const second = matchSearch(KC, { year: 2026, month: 11 }, filters('Geminids'), NONE)

  first.next()
  expect(run(second).last.match.name).toBe('Geminids peak')
  expect(run(first).last.match.name).toBe('Perseids peak')
})

test('search from an earlier month never offers a day that has passed', () => {
  const start = searchStart({ year: 2026, month: 9 }, { year: 2026, month: 11 })
  const { last } = run(matchSearch(KC, start, filters('New Moon'), NONE, 36, '2026-11-23'))

  expect(last.match.day >= '2026-11-23').toBe(true)
}, 30000)



// STEPPING

function* fake(steps) {
  yield* steps
}

test('the search waits for a pause in typing before it starts', () => {
  vi.useFakeTimers()
  const seen = []

  runSearch(fake([{ match: null }, { match: { name: 'Perseids peak' } }]), result => seen.push(result.status))
  vi.advanceTimersByTime(PAUSE - 1)
  expect(seen).toEqual([])
  vi.advanceTimersByTime(1)
  vi.runAllTimers()
  expect(seen).toEqual(['looking', 'found'])
  vi.useRealTimers()
})

test('a cancelled search never reports back', () => {
  vi.useFakeTimers()
  const seen = []
  const cancel = runSearch(fake([{ match: null }, { match: null }, { match: { name: 'Geminids peak' } }]), result => seen.push(result.status))

  vi.advanceTimersByTime(PAUSE)
  cancel()
  vi.runAllTimers()
  expect(seen).toEqual(['looking'])
  vi.useRealTimers()
})

test('a search that runs out says none', () => {
  vi.useFakeTimers()
  const seen = []

  runSearch(fake([{ match: null }, { match: null, done: true }]), result => seen.push(result.status))
  vi.runAllTimers()
  expect(seen).toEqual(['looking', 'none'])
  vi.useRealTimers()
})
