import { expect, test } from 'vitest'
import { cloudBars, cloudWords } from './clouds.js'



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

function words(clouds, options = {}) {
  return cloudWords({ night: night(), clouds, status: 'ready', timeZone: ZONE, ...options })
}



// WORDS

test('the same sky all night', () => {
  expect(words(hours(() => 5))).toEqual({ value: 'Clear all night', line: 'A clear view of the stars.' })
  expect(words(hours(() => 40))).toEqual({ value: 'Patchy all night', line: 'Stars will peek through gaps.' })
  expect(words(hours(() => 90))).toEqual({ value: 'Cloudy all night', line: 'Clouds will hide most stars.' })
})

test('one change during the night lasts until dawn', () => {
  expect(words(hours(hour => (hour < 8 ? 5 : 40)))).toEqual({ value: 'Clear till 1am', line: 'Then patchy until dawn.' })
})

test('a second change names when the middle stretch ends', () => {
  expect(words(hours(hour => (hour >= 6 && hour < 9 ? 80 : 5)))).toEqual({ value: 'Clear till 11pm', line: 'Then cloudy until 2am.' })
})

test('a mixed rest of the night is described by its most common sky', () => {
  const mixed = [5, 5, 5, 5, 5, 5, 5, 90, 90, 40, 90, 40, 90, 90, 5]

  expect(words(mixed)).toEqual({ value: 'Clear till midnight', line: 'Then mostly cloudy until dawn.' })
})

test('a tie between patchy and cloudy leans cloudy', () => {
  const tied = [5, 5, 5, 5, 5, 5, 5, 40, 90, 40, 90, 40, 90, 5, 5]

  expect(words(tied).line).toBe('Then mostly cloudy until dawn.')
})

test('clouds during twilight are left out', () => {
  expect(words(hours(hour => (hour === 1 ? 90 : 5))).value).toBe('Clear all night')
})

test('a night that never gets fully dark uses every hour', () => {
  const twilight = night(m => (m < 4 ? 2 : -10), { astroDusk: null, astroDawn: null })
  const result = cloudWords({ night: twilight, clouds: hours(hour => (hour === 1 ? 90 : 5)), status: 'ready', timeZone: ZONE })

  expect(result).toEqual({ value: 'Cloudy till 7pm', line: 'Then clear until dawn.' })
})

test('missing hours are skipped', () => {
  expect(words(hours(hour => (hour === 4 ? null : 5))).value).toBe('Clear all night')
})

test('while the forecast loads', () => {
  expect(words(null, { status: 'loading' })).toEqual({ value: 'Loading', line: 'Getting the cloud forecast.' })
})

test('when the forecast is missing', () => {
  const missing = { value: 'No forecast', line: 'It isn’t available right now.' }

  expect(words(null, { status: 'failed' })).toEqual(missing)
  expect(words(hours(() => null))).toEqual(missing)
})

test('a night when the Sun never sets', () => {
  const result = cloudWords({ night: night(() => 5), clouds: hours(() => 5), status: 'ready', timeZone: ZONE })

  expect(result).toEqual({ value: 'No night', line: 'The Sun doesn’t set tonight.' })
})



// BARS

test('one bar for each hour between sunset and sunrise', () => {
  const bars = cloudBars(night(), hours(hour => hour * 5), null)

  expect(bars.map(bar => bar.cover)).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65])
  expect(bars.some(bar => bar.now)).toBe(false)
})

test('bars know their kind of sky', () => {
  const bars = cloudBars(night(), hours(hour => [5, 40, 90, null][hour % 4]), null)

  expect(bars.slice(0, 4).map(bar => bar.kind)).toEqual(['patchy', 'cloudy', null, 'clear'])
})

test('the bar for the current hour is marked', () => {
  const bars = cloudBars(night(), hours(() => 5), 32)

  expect(bars.findIndex(bar => bar.now)).toBe(4)
})

test('bars wait without a forecast', () => {
  const bars = cloudBars(night(), null, null)

  expect(bars).toHaveLength(13)
  expect(bars.every(bar => bar.cover === null)).toBe(true)
})
