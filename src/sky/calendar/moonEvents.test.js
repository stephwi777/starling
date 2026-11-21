import { expect, test } from 'vitest'
import { observerFor } from '../night.js'
import { fullMoonName, moonEvents } from './moonEvents.js'
import { monthBounds } from './skyTools.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const SYDNEY = { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney', country: 'AU' }

function month(year, number, place = KC) {
  const { start, end } = monthBounds(year, number, place.timeZone)

  return moonEvents(start, end, place, observerFor(place))
}

const find = (events, kind) => events.filter(event => event.kinds.includes(kind))



// TESTS

test('December 2026 has a New Moon and a full Cold supermoon', () => {
  const events = month(2026, 12)
  const [full] = find(events, 'full-moon')
  const [fresh] = find(events, 'new-moon')

  expect(fresh).toMatchObject({ day: '2026-12-08', time: '6:53pm', name: 'New Moon' })
  expect(full).toMatchObject({ day: '2026-12-23', time: '7:29pm', short: 'Full Cold Moon', name: 'Full Cold Moon · Supermoon' })
  expect(full.kinds).toEqual(['full-moon', 'supermoon'])
  expect(full.here).toBe(true)
})

test('the second full Moon in a month is a Blue Moon', () => {
  const fulls = find(month(2026, 5), 'full-moon')

  expect(fulls.map(event => event.day)).toEqual(['2026-05-01', '2026-05-31'])
  expect(fulls[1].kinds).toContain('blue-moon')
  expect(fulls[0].kinds).not.toContain('blue-moon')
})

test('quarters, closest and farthest, and node crossings are their own kinds', () => {
  const events = month(2026, 12)

  expect(find(events, 'quarter-moon').map(event => event.short)).toEqual(['Last quarter', 'First quarter', 'Last quarter'])
  expect(find(events, 'moon-distance').map(event => event.short)).toEqual(['Moon farthest', 'Moon closest'])
  expect(find(events, 'moon-node').length).toBeGreaterThan(0)
})

test('the full Moon nearest the September equinox is the Harvest Moon, then the Hunter’s Moon', () => {
  const september = find(month(2026, 9), 'full-moon')[0]
  const october = find(month(2026, 10), 'full-moon')[0]

  expect(fullMoonName(september.date, KC)).toBe('Harvest')
  expect(fullMoonName(october.date, KC)).toBe('Hunter’s')
})

test('southern places get no northern Moon names', () => {
  expect(find(month(2026, 12, SYDNEY), 'full-moon')[0].short).toBe('Full Moon')
})
