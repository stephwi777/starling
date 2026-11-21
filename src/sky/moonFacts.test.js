import { expect, test } from 'vitest'
import { localNoon } from './night.js'
import { clock } from './words.js'
import { distanceWords, fullMoonWords, litSide, moonAt, nightName, phaseName, riseAndSet } from './moonFacts.js'



// HELPERS

const KC = { latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }

function noonOf(month, day) {
  return localNoon(2026, month, day, KC.timeZone)
}



// PHASES

test('phase names follow the angle', () => {
  expect([3, 45, 90, 122, 180, 220, 270, 300, 355].map(phaseName)).toEqual([
    'New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full Moon',
    'Waning gibbous', 'Last quarter', 'Waning crescent', 'New Moon',
  ])
})

test('the Moon at midnight tonight', () => {
  const moon = moonAt(new Date('2026-11-20T06:00:00Z'))

  expect(Math.round(moon.lit * 100)).toBe(77)
  expect(moon.km).toBeCloseTo(382381, -1)
})



// RISE AND SET

test('rise and set for a night match the Naval Observatory', () => {
  const nov19 = riseAndSet(KC, noonOf(11, 19))

  expect(clock(nov19.rise, KC.timeZone)).toBe('1:59pm')
  expect(clock(nov19.set, KC.timeZone)).toBe('2:32am')
  expect(clock(riseAndSet(KC, noonOf(12, 1)).rise, KC.timeZone)).toBe('1:03am')
})

test('a night without a moonrise or moonset', () => {
  expect(riseAndSet(KC, noonOf(11, 14)).rise).toBe(null)
  expect(riseAndSet(KC, noonOf(11, 29)).set).toBe(null)
})



// WORDS

test('next full Moon counts nights', () => {
  const words = day => fullMoonWords(noonOf(11, day), KC.timeZone)

  expect([15, 16, 19, 22, 23, 24].map(words)).toEqual(['Nov 24', '7 days', '4 days', 'Tomorrow', 'Tonight', 'Dec 23'])
})

test('distance in miles for the US and kilometers elsewhere', () => {
  expect(distanceWords(382381, 'US')).toBe('237,601 mi')
  expect(distanceWords(382381, 'FR')).toBe('382,381 km')
})

test('night names', () => {
  expect(nightName(noonOf(11, 19), KC.timeZone)).toBe('Thursday night, November 19')
})



// LIT SIDE

test('quarter Moons are lit on the side seen from each hemisphere', () => {
  expect(litSide('first-quarter', false)).toBe('right')
  expect(litSide('last-quarter', false)).toBe('left')
  expect(litSide('first-quarter', true)).toBe('left')
  expect(litSide('last-quarter', true)).toBe('right')
})
