import { expect, test } from 'vitest'
import { bestWindow, verdict } from './best.js'



// HELPERS

const START = Date.parse('2026-11-14T00:00:00Z')
const STEP = 10 * 60 * 1000
const ZONE = 'America/Chicago'

function makeNight(sun = Array(24).fill(-30), extra = {}) {
  return {
    times: sun.map((_, i) => new Date(START + i * STEP)),
    sun,
    hours: 4,
    astroDusk: new Date(START),
    astroDawn: new Date(START + 4 * 60 * 60 * 1000),
    moonLit: 0.2,
    ...extra,
  }
}

function saturn(alt) {
  return { name: 'Saturn', gear: 1, mag: 0.8, track: Array(24).fill({ alt, az: 180 }) }
}

function say(night, clouds, planets = []) {
  return verdict({ night, clouds, best: bestWindow(night, clouds), planets, timeZone: ZONE })
}



// TESTS

test('without weather the window is all of full darkness', () => {
  const night = makeNight()
  expect(bestWindow(night, null)).toEqual({ from: 0, to: 23 })
  expect(say(night, null)).toBe('Dark from 6pm to 10pm. Check the sky for clouds.')
})

test('clouds end the window at the start of the cloudy hour', () => {
  const night = makeNight()
  expect(bestWindow(night, [0, 0, 0, 80])).toEqual({ from: 0, to: 17 })
  expect(say(night, [0, 0, 0, 80])).toBe('Clear and dark from 6pm to 9pm.')
})

test('a window shorter than 30 minutes does not count', () => {
  const sun = Array(24).fill(-10)
  sun[5] = -20
  sun[6] = -20
  expect(bestWindow(makeNight(sun), null)).toBeNull()
})

test('clouds all night', () => {
  expect(say(makeNight(), [90, 90, 90, 90])).toBe('Cloudy all night. A good night to plan instead.')
})

test('patchy clouds with no clear window', () => {
  expect(say(makeNight(), [50, 45, 50, 45])).toBe('Clouds come and go all night. Watch for clear breaks.')
})

test('a bright Moon is mentioned', () => {
  expect(say(makeNight(undefined, { moonLit: 0.8 }), [0, 0, 0, 0])).toBe('Clear and dark from 6pm to 10pm, but the Moon is bright.')
})

test('the brightest planet up is named', () => {
  expect(say(makeNight(), [0, 0, 0, 0], [saturn(40)])).toBe('Clear and dark from 6pm to 10pm. Saturn is the brightest planet up.')
  expect(say(makeNight(), [0, 0, 0, 0], [saturn(10)])).toBe('Clear and dark from 6pm to 10pm.')
})

test('a night that never gets fully dark says so', () => {
  const night = makeNight(Array(24).fill(-10), { astroDusk: null, astroDawn: null })
  expect(bestWindow(night, null)).toBeNull()
  expect(say(night, null)).toBe('It doesn’t get fully dark tonight.')
})

test('a short dark spell with no weather says to check for clouds', () => {
  const sun = Array(24).fill(-10)
  sun[5] = -20
  sun[6] = -20
  expect(say(makeNight(sun), null)).toBe('Not dark for long tonight. Check the sky for clouds.')
})
