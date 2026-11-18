import { expect, test } from 'vitest'
import { monthConstellation } from './monthConstellation.js'



// HELPERS

const NORTH = { latitude: 39.1, timeZone: 'America/Chicago' }
const SOUTH = { latitude: -33.9, timeZone: 'Australia/Sydney' }



// TESTS

test('November in the north is Cassiopeia', () => {
  expect(monthConstellation(new Date('2026-11-18T20:00:00Z'), NORTH).name).toBe('Cassiopeia')
})

test('January in the north is Orion', () => {
  expect(monthConstellation(new Date('2027-01-10T20:00:00Z'), NORTH).name).toBe('Orion')
})

test('every month in the north has its own constellation', () => {
  const names = Array.from({ length: 12 }, (_, month) => monthConstellation(new Date(Date.UTC(2027, month, 15, 18)), NORTH).name)
  expect(new Set(names).size).toBe(12)
})

test('the month follows the place, not the visitor', () => {
  expect(monthConstellation(new Date('2026-12-01T03:00:00Z'), NORTH).name).toBe('Cassiopeia')
})

test('southern places never get a far northern constellation', () => {
  const names = Array.from({ length: 12 }, (_, month) => monthConstellation(new Date(Date.UTC(2027, month, 15, 8)), SOUTH).name)
  expect(names).not.toContain('Cassiopeia')
  expect(names).not.toContain('Big Dipper')
  expect(names[5]).toBe('Scorpius')
})
