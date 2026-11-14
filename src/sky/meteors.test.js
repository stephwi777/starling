import { expect, test } from 'vitest'
import { activeShowers, meteorRate } from './meteors.js'



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
  expect(quadrantids.daysFromPeak).toBe(4)
})

test('the rate is zero with the radiant down and highest at the peak', () => {
  const shower = { zhr: 100, daysFromPeak: 0 }
  expect(meteorRate(shower, -5)).toBe(0)
  expect(meteorRate(shower, 90)).toBe(100)
  expect(meteorRate({ ...shower, daysFromPeak: 5 }, 90)).toBeLessThan(50)
})
