import { expect, test } from 'vitest'
import { statusAt } from './status.js'



// HELPERS

const START = Date.parse('2026-11-14T00:00:00Z')
const ZONE = 'America/Chicago'

const night = {
  times: [0, 1, 2, 3, 4].map(i => new Date(START + i * 60 * 60 * 1000)),
  sun: [-3, -20, -20, -20, -20],
}

function object(alts, extra = {}) {
  return { track: alts.map(alt => ({ alt, az: 180 })), rise: null, set: null, visible: true, reason: '', ...extra }
}



// TESTS

test('an object up in the dark gives fists and a direction', () => {
  expect(statusAt(object([40, 40, 40, 40, 40]), 1, night, ZONE)).toEqual({ title: 'Up, 4 fists up', detail: 'Halfway up in the south', up: true })
})

test('an object up in twilight says the sky is still bright', () => {
  expect(statusAt(object([40, 40, 40, 40, 40]), 0, night, ZONE).title).toBe('Up, sky still bright')
})

test('an object that rises later gives the rise time and direction', () => {
  expect(statusAt(object([-5, -5, -5, 10, 20], { rise: 3 }), 1, night, ZONE)).toEqual({ title: 'Rises 9pm', detail: 'in the south', up: false })
})

test('an object that already set gives the set time', () => {
  expect(statusAt(object([10, -5, -5, -5, -5], { set: 1 }), 2, night, ZONE).title).toBe('Set at 7pm')
})

test('an object that never rises gives the reason', () => {
  expect(statusAt(object([-5, -5, -5, -5, -5], { visible: false, reason: 'below the horizon all night' }), 2, night, ZONE)).toEqual({ title: 'Below the horizon', detail: 'below the horizon all night', up: false })
})
