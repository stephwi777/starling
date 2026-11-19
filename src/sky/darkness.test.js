import { expect, test } from 'vitest'
import { darkNow, darknessWords } from './darkness.js'



// HELPERS

const ZONE = 'America/Chicago'
const MINUTE = 60 * 1000
const FIVE_PM = new Date('2026-11-18T23:00:00Z').getTime()
const STEPS = Array.from({ length: 85 }, (_, i) => i * 10)

function at(minutes) {
  return new Date(FIVE_PM + minutes * MINUTE)
}

function night(sunAt, extra = {}) {
  return {
    times: STEPS.map(at),
    sun: STEPS.map(sunAt),
    astroDusk: at(96),
    astroDawn: at(749),
    ...extra,
  }
}



// TESTS

test('an ordinary night names when it gets fully dark and until when', () => {
  const words = darknessWords(night(m => (m < 96 || m >= 749 ? -10 : -30)), ZONE)
  expect(words).toEqual({ value: '6:36pm', line: 'Fully dark until 5:29am.' })
})

test('a night that never gets fully dark', () => {
  const words = darknessWords(night(() => -10, { astroDusk: null, astroDawn: null }), ZONE)
  expect(words).toEqual({ value: 'No full dark', line: 'Twilight lasts all night.' })
})

test('a night that is fully dark the whole time', () => {
  const words = darknessWords(night(() => -30, { astroDusk: null, astroDawn: null }), ZONE)
  expect(words).toEqual({ value: 'All night', line: 'Fully dark all night.' })
})

test('a night when the Sun never sets', () => {
  const words = darknessWords(night(() => 5, { astroDusk: null, astroDawn: null }), ZONE)
  expect(words).toEqual({ value: 'Daylight', line: 'The Sun doesn’t set tonight.' })
})



// NOW

const ORDINARY = night(m => (m < 4 ? 2 : m < 96 || m >= 749 ? -10 : -30))

test('no words when it is not tonight', () => {
  expect(darkNow(ORDINARY, null)).toBe(null)
})

test('before sunset the Sun is still up', () => {
  expect(darkNow(ORDINARY, 0)).toBe('The Sun is still up.')
})

test('evening twilight', () => {
  expect(darkNow(ORDINARY, 5)).toBe('Evening twilight now.')
})

test('fully dark with hours left', () => {
  expect(darkNow(ORDINARY, 60)).toBe('Fully dark now, 2 hours left.')
})

test('fully dark with one hour left', () => {
  expect(darkNow(ORDINARY, 68)).toBe('Fully dark now, 1 hour left.')
})

test('fully dark with minutes left', () => {
  expect(darkNow(ORDINARY, 71)).toBe('Fully dark now, 39 minutes left.')
})

test('morning twilight', () => {
  expect(darkNow(ORDINARY, 78)).toBe('Morning twilight now.')
})

test('twilight on a night that never gets fully dark', () => {
  expect(darkNow(night(() => -10, { astroDusk: null, astroDawn: null }), 40)).toBe('Twilight now.')
})
