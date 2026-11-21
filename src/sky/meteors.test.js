import { expect, test } from 'vitest'
import { SHOWERS } from './catalog/showers.js'
import { activeShowers, meteorRate, nextShower, peakTime } from './meteors.js'



// TESTS

test('the Taurids and Leonids are active in mid-November', () => {
  const names = activeShowers(new Date('2026-11-14T03:00:00Z')).map(shower => shower.name)
  expect(names).toEqual(['Southern Taurids', 'Northern Taurids', 'Leonids'])
})

test('the Geminids are not active yet in mid-November', () => {
  const names = activeShowers(new Date('2026-11-14T03:00:00Z')).map(shower => shower.name)
  expect(names).not.toContain('Geminids')
})

test('the Quadrantids span the new year', () => {
  expect(activeShowers(new Date('2027-01-02T10:00:00Z')).map(shower => shower.name)).toContain('Quadrantids')
  expect(activeShowers(new Date('2026-12-30T10:00:00Z')).map(shower => shower.name)).toContain('Quadrantids')
})

test('days from peak are counted across years', () => {
  const [quadrantids] = activeShowers(new Date('2026-12-30T10:00:00Z')).filter(shower => shower.name === 'Quadrantids')
  expect(quadrantids.daysFromPeak).toBe(5)
})

test('the rate is zero with the radiant down and highest at the peak', () => {
  const shower = { zhr: 100, daysFromPeak: 0 }
  expect(meteorRate(shower, -5)).toBe(0)
  expect(meteorRate(shower, 90)).toBe(100)
  expect(meteorRate({ ...shower, daysFromPeak: 5 }, 90)).toBeLessThan(50)
})



// PEAKS

const HOUR = 60 * 60 * 1000
const byName = name => SHOWERS.find(shower => shower.name === name)

test('peaks land within an hour of the published 2026 times', () => {
  const published = [
    ['Quadrantids', '2026-01-03T21:00Z'],
    ['Lyrids', '2026-04-22T19:40Z'],
    ['Draconids', '2026-10-09T01:00Z'],
    ['Leonids', '2026-11-17T23:49Z'],
    ['Geminids', '2026-12-14T14:00Z'],
  ]

  for (const [name, time] of published) {
    expect(Math.abs(peakTime(byName(name), 2026) - new Date(time))).toBeLessThan(HOUR)
  }
})

test('the next strong shower comes from the real peak times', () => {
  expect(nextShower(new Date('2026-12-01T00:00Z'))).toMatchObject({ name: 'Geminids' })
})
