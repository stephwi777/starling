import { expect, test } from 'vitest'
import { moonTiming, nextFull } from './moon.js'
import { buildNight } from './night.js'
import { SAMPLE_PLACE } from '../place/placeStorage.js'



// HELPERS

const ZONE = 'America/Chicago'
const HOUR = 60 * 60 * 1000
const FIVE_PM = new Date('2026-11-18T23:00:00Z').getTime()
const TIMES = [0, 1, 2, 3, 4].map(hour)
const NIGHT = { times: TIMES, sunset: TIMES[0], sunrise: TIMES[4] }
const NOW = new Date('2026-11-18T20:00:00Z')

function moon(alts) {
  return { track: alts.map(alt => ({ alt })) }
}

function hour(n) {
  return new Date(FIVE_PM + n * HOUR)
}

function nightAt(index) {
  return buildNight(SAMPLE_PLACE, index, NOW)
}



// TIMING

test('up at sunset and sets during the night', () => {
  expect(moonTiming(moon([5, 3, 1, -1, -3]), NIGHT, ZONE)).toBe('Sets at 8pm')
})

test('rises during the night', () => {
  expect(moonTiming(moon([-3, -1, 2, 4, 6]), NIGHT, ZONE)).toBe('Rises at 7pm')
})

test('rises and sets during the night', () => {
  expect(moonTiming(moon([-3, 2, 4, -1, -2]), NIGHT, ZONE)).toBe('Up 6pm to 8pm')
})

test('sets and rises again says when it sets', () => {
  expect(moonTiming(moon([3, -1, -2, 1, 2]), NIGHT, ZONE)).toBe('Sets at 6pm')
})

test('up all night', () => {
  expect(moonTiming(moon([5, 9, 12, 8, 3]), NIGHT, ZONE)).toBe('Up all night')
})

test('not up tonight', () => {
  expect(moonTiming(moon([-5, -9, -12, -8, -3]), NIGHT, ZONE)).toBe('Not up tonight')
})

test('a Moon that sets before sunset is not up tonight', () => {
  const night = { ...NIGHT, sunset: new Date(hour(0).getTime() + 20 * 60 * 1000) }
  expect(moonTiming(moon([2, -1, -2, -3, -4]), night, ZONE)).toBe('Not up tonight')
})

test('a Moon that rises after sunrise is not up tonight', () => {
  const night = { ...NIGHT, sunrise: new Date(hour(3).getTime() + 30 * 60 * 1000) }
  expect(moonTiming(moon([-1, -2, -3, -4, 2]), night, ZONE)).toBe('Not up tonight')
})



// FULL MOON

test('names the date of the next full Moon', () => {
  expect(nextFull(nightAt(0), ZONE)).toBe('Full Nov 24')
})

test('a full Moon the next morning counts as tonight', () => {
  expect(nextFull(nightAt(5), ZONE)).toBe('Full tonight!')
})

test('the night after a full Moon names the next one', () => {
  expect(nextFull(nightAt(6), ZONE)).toBe('Full Dec 23')
})
