import { expect, test } from 'vitest'
import { monthEvents } from './monthEvents.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }

const year = y => Array.from({ length: 12 }, (_, i) => monthEvents(KC, y, i + 1)).flat()
const all2027 = year(2027)
const keys = events => new Set(events.flatMap(event => event.subjects.map(subject => subject.key)))



// TESTS

test('every event has a subject', () => {
  expect(all2027.every(event => event.subjects?.length > 0 && event.subjects.every(subject => subject.key && subject.label))).toBe(true)
})

test('subject keys never include a date', () => {
  expect(all2027.flatMap(event => event.subjects).filter(subject => !subject.key.startsWith('comet:') && /\d{4}/.test(subject.key))).toEqual([])
})

test('the same subject keeps its key from year to year', () => {
  const next = keys(year(2028))

  for (const key of ['shower:Geminids', 'full-moon', 'season:dec_solstice', 'best:Jupiter']) {
    expect(keys(all2027).has(key), key).toBe(true)
    expect(next.has(key), key).toBe(true)
  }
})

test('a supermoon Full Moon is both, Full Moon first', () => {
  const superFull = all2027.find(event => event.kinds.includes('supermoon'))

  expect(superFull.subjects.map(subject => subject.key).slice(0, 2)).toEqual(['full-moon', 'supermoon'])
})

test('planet pairs use sorted names', () => {
  const pair = all2027.find(event => event.kinds.includes('planet-pair'))
  const names = pair.subjects[0].key.slice(5).split('+')

  expect(pair.subjects[0].key.startsWith('pair:')).toBe(true)
  expect(names).toEqual([...names].sort())
})
