import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { hourScore, seeingRows, seeingWords, shearOf } from './seeing.js'



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

function calm(jet, extra = {}) {
  return jet === null ? null : { jet, shear: 0, gust: 0, wind: 0, ...extra }
}

function hours(pick) {
  return Array.from({ length: 15 }, (_, hour) => calm(pick(hour)))
}

function words(air, options = {}) {
  return seeingWords({ night: night(), air, status: 'ready', timeZone: ZONE, ...options })
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
  const result = seeingWords({ night: night(() => 5), air: hours(() => 5), status: 'ready', timeZone: ZONE })

  expect(result).toEqual({ score: 0, value: 'No night', line: 'The Sun doesn’t set tonight.', best: null })
})



// CAUSES

test('gusty ground wind lowers the score', () => {
  expect(hourScore(calm(5, { gust: 12 }))).toBe(3)
  expect(words(Array.from({ length: 15 }, () => calm(5, { gust: 12 }))).value).toBe('Average')
})

test('churning air layers lower the score', () => {
  expect(hourScore(calm(5, { shear: 12 }))).toBe(4)
  expect(hourScore(calm(5, { shear: 20 }))).toBe(3)
})

test('the score never drops below one', () => {
  expect(hourScore(calm(60, { shear: 30, gust: 20 }))).toBe(1)
})

test('layers blowing opposite ways count as churning', () => {
  expect(shearOf([10, 10], [0, 180])).toBeCloseTo(20)
  expect(shearOf([10, 15], [90, 90])).toBeCloseTo(5)
  expect(shearOf([10, null], [90, 90])).toBeNull()
})



// ROWS

test('rows name each cause in plain words', () => {
  const rows = seeingRows({ jet: 15, shear: 4, gust: 7.2, wind: 3 }, 'US')

  expect(rows.jet).toEqual({ value: 'Light', note: '34 mph, 34,000 ft up' })
  expect(rows.layers).toEqual({ value: 'Smooth', note: 'moving together' })
  expect(rows.ground).toEqual({ value: 'Gusty', note: '7 mph, gusts 16' })
})

test('rows use km/h outside the US', () => {
  expect(seeingRows({ jet: 15, shear: 20, gust: 12, wind: 5 }, 'FR')).toEqual({
    jet: { value: 'Light', note: '54 km/h, 10 km up' },
    layers: { value: 'Churning', note: 'tumbling into each other' },
    ground: { value: 'Very gusty', note: '18 km/h, gusts 43' },
  })
})

test('unknown layers are shown as unknown', () => {
  expect(seeingRows({ jet: 15, shear: null, gust: null, wind: 3 }, SAMPLE_PLACE.country)).toMatchObject({
    layers: { value: '—', note: null },
    ground: { value: '—', note: '7 mph' },
  })
})
