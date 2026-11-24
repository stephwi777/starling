import { expect, test } from 'vitest'
import { bandLine } from './bandLine.js'
import { bestWindow, shortVerdict } from './best.js'
import { fallSentence } from './hours.js'



// HELPERS

const ZONE = 'America/Chicago'
const MINUTE = 60 * 1000
const FIVE_PM = new Date('2026-11-18T23:00:00Z').getTime()
const STEPS = Array.from({ length: 85 }, (_, i) => i * 10)

function at(minutes) {
  return new Date(FIVE_PM + minutes * MINUTE)
}

const NIGHT = {
  start: at(0),
  end: at(840),
  times: STEPS.map(at),
  sun: STEPS.map(m => (m < 4 ? 1 : m < 96 ? -10 : m < 749 ? -30 : m < 827 ? -10 : 1)),
  sunset: at(4),
  astroDusk: at(96),
  astroDawn: at(749),
  sunrise: at(827),
}

function hours(byHour) {
  return Array.from({ length: 14 }, (_, h) => byHour(h))
}

const CLEAR = hours(() => 5)

function line(falls, clouds = CLEAR) {
  return bandLine({ night: NIGHT, clouds, falls, best: bestWindow(NIGHT, clouds), timeZone: ZONE })
}



// TESTS

test('no rain keeps the usual sentence', () => {
  expect(line(hours(() => null))).toBe(shortVerdict({ night: NIGHT, clouds: CLEAR, best: bestWindow(NIGHT, CLEAR), timeZone: ZONE }))
  expect(line(null)).toBe(shortVerdict({ night: NIGHT, clouds: CLEAR, best: bestWindow(NIGHT, CLEAR), timeZone: ZONE }))
})

test('rain all night', () => {
  expect(line(hours(() => 'rain'))).toBe('Rain likely all night.')
})

test('snow says snow', () => {
  expect(line(hours(() => 'snow'))).toBe('Snow likely all night.')
})

test('rain, then a clear dark stretch', () => {
  expect(line(hours(h => (h <= 8 ? 'rain' : null)))).toBe('Rain likely until 2am, then clear and dark until 5:29am.')
})

test('a clear dark stretch, then rain', () => {
  expect(line(hours(h => (h >= 7 ? 'rain' : null)))).toBe('Clear and dark until midnight, then rain likely.')
})

test('rain followed by clouds uses the hours card wording', () => {
  const falls = hours(h => (h <= 8 ? 'rain' : null))
  expect(line(falls, hours(() => 90))).toBe(fallSentence(NIGHT, falls, ZONE))
})

test('rain on and off uses the hours card wording', () => {
  const falls = hours(h => (h === 2 || h === 5 ? 'rain' : null))
  expect(line(falls)).toBe('Rain on and off 7pm–11pm.')
})
