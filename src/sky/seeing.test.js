import { expect, test } from 'vitest'
import { seeingWords } from './seeing.js'



// HELPERS

const ZONE = 'America/Chicago'
const MINUTE = 60 * 1000
const FIVE_PM = new Date('2026-11-18T23:00:00Z').getTime()
const STEPS = Array.from({ length: 85 }, (_, i) => i * 10)

function at(minutes) {
  return new Date(FIVE_PM + minutes * MINUTE)
}

function night(sunAt = m => (m < 4 ? 2 : m < 96 || m >= 749 ? -10 : -30), extra = {}) {
  return {
    times: STEPS.map(at),
    sun: STEPS.map(sunAt),
    sunset: at(4),
    sunrise: at(840),
    astroDusk: at(96),
    astroDawn: at(749),
    ...extra,
  }
}

function hours(pick) {
  return Array.from({ length: 15 }, (_, hour) => pick(hour))
}

function words(jets, options = {}) {
  return seeingWords({ night: night(), jets, status: 'ready', timeZone: ZONE, ...options })
}



// SCALE

test('calm high winds give steady air', () => {
  expect(words(hours(() => 6))).toEqual({ score: 5, value: 'Excellent', line: 'Very steady air. Great for telescopes!', best: null })
  expect(words(hours(() => 15))).toEqual({ score: 4, value: 'Good', line: 'Steady air. Good for telescopes.', best: null })
})

test('faster high winds make stars twinkle', () => {
  expect(words(hours(() => 25))).toEqual({ score: 3, value: 'Average', line: 'Stars will twinkle a little.', best: null })
  expect(words(hours(() => 35))).toEqual({ score: 2, value: 'Poor', line: 'Stars will twinkle a lot.', best: null })
  expect(words(hours(() => 60))).toEqual({ score: 1, value: 'Bad', line: 'Shaky air will blur the view.', best: null })
})

test('the night is judged by its average', () => {
  expect(words(hours(hour => (hour < 7 ? 15 : 25))).value).toBe('Average')
})



// STEADIEST

test('a night that changes a lot names its steadiest hour', () => {
  expect(words(hours(hour => (hour === 10 ? 5 : 35))).best).toBe('Steadiest around 3am.')
})

test('small changes are not mentioned', () => {
  expect(words(hours(hour => (hour === 10 ? 15 : 25))).best).toBe(null)
})

test('twilight hours are left out', () => {
  expect(words(hours(hour => (hour === 1 ? 5 : 35)))).toMatchObject({ value: 'Poor', best: null })
})



// MISSING

test('missing hours are skipped', () => {
  expect(words(hours(hour => (hour === 4 ? null : 15))).value).toBe('Good')
})

test('while the forecast loads', () => {
  expect(words(null, { status: 'loading' })).toEqual({ score: 0, value: 'Loading', line: 'Getting the seeing forecast.', best: null })
})

test('when the forecast is missing', () => {
  const missing = { score: 0, value: 'No forecast', line: 'It isn’t available right now.', best: null }

  expect(words(null, { status: 'failed' })).toEqual(missing)
  expect(words(hours(() => null))).toEqual(missing)
})

test('a night when the Sun never sets', () => {
  const result = seeingWords({ night: night(() => 5), jets: hours(() => 5), status: 'ready', timeZone: ZONE })

  expect(result).toEqual({ score: 0, value: 'No night', line: 'The Sun doesn’t set tonight.', best: null })
})
