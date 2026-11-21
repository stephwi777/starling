import { expect, test } from 'vitest'
import { observerFor } from '../night.js'
import { planetEvents } from './planetEvents.js'
import { monthBounds } from './skyTools.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }

const cache = new Map()

function month(year, number) {
  const key = `${year}-${number}`

  if (!cache.has(key)) {
    const { start, end } = monthBounds(year, number, KC.timeZone)

    cache.set(key, planetEvents(start, end, KC, observerFor(KC)))
  }

  return cache.get(key)
}

const kind = (events, id) => events.filter(event => event.kinds.includes(id))



// TESTS

test('the 2020 Great Conjunction of Jupiter and Saturn shows as a close pair', () => {
  const [pair] = kind(month(2020, 12), 'planet-pair')

  expect(pair).toMatchObject({ day: '2020-12-21', time: 'Evening', name: 'Jupiter and Saturn together', here: true })
  expect(pair.note).toBe('Only 0.1° apart. So close they may look like one bright star.')
})

test('a pre-dawn pairing sits on its morning date', () => {
  const [pair] = kind(month(2025, 8), 'planet-pair')

  expect(pair).toMatchObject({ day: '2025-08-12', time: 'Before dawn', name: 'Venus and Jupiter together' })
})

test('Jupiter is at its best all night on February 10, 2027', () => {
  const [jupiter] = kind(month(2027, 2), 'opposition').filter(event => event.short.startsWith('Jupiter'))

  expect(jupiter).toMatchObject({ day: '2027-02-10', time: 'All night', here: true })
  expect(jupiter.rows.map(([label]) => label)).toEqual(['Best seen', 'Look', 'Brightness', 'In', 'Moon'])
})

test('the Moon passing Jupiter is found with its distance apart', () => {
  const [pass] = kind(month(2026, 12), 'moon-planet').filter(event => event.short.includes('Jupiter'))

  expect(pass).toMatchObject({ day: '2026-12-26', short: 'Moon meets Jupiter' })
  expect(pass.note).toMatch(/^The Moon and Jupiter are 1\.4° apart/)
})

test('Mercury and Venus at their best say which part of the sky to look in', () => {
  const [venus] = kind(month(2027, 1), 'elongation')

  expect(venus).toMatchObject({ short: 'Venus at its best', time: 'Before dawn' })
  expect(venus.note).toMatch(/morning sky, 47° away\. Look low in the east before sunrise\.$/)
})

test('Venus at its brightest and Mars closest to Earth are found', () => {
  expect(kind(month(2026, 11), 'venus-brightest')).toHaveLength(1)
  expect(kind(month(2027, 2), 'mars-closest')[0].note).toMatch(/^Mars comes within 63\.0 million mi of Earth/)
})

test('several nights with four planets up become one parade', () => {
  const [parade] = kind(month(2026, 11), 'parade')

  expect(parade).toMatchObject({ time: 'Before dawn', name: 'Planet parade: 4 planets' })
  expect(parade.note).toMatch(/each night through Nov 30\.$/)
})

test('turning points, conjunctions with the Sun and orbit extremes are listed', () => {
  const events = month(2026, 12)

  expect(kind(events, 'station').map(event => event.name)).toContain('Jupiter starts moving backward')
  expect(kind(month(2027, 1), 'solar-conjunction')[0].name).toBe('Mercury behind the Sun')
  expect(kind(events, 'planet-distance').length).toBeGreaterThan(0)
})
