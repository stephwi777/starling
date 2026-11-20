import { expect, test } from 'vitest'
import { darknessWords } from './darkness.js'



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
