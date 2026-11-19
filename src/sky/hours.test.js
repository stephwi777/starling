import { expect, test } from 'vitest'
import { hourCells, hoursSummary } from './hours.js'



// HELPERS

const ZONE = 'America/Chicago'
const MINUTE = 60 * 1000
const FIVE_PM = new Date('2026-11-18T23:00:00Z').getTime()
const STEPS = Array.from({ length: 85 }, (_, i) => i * 10)

function at(minutes) {
  return new Date(FIVE_PM + minutes * MINUTE)
}

function makeNight({ dark = true } = {}) {
  const sunAt = m => (m < 4 ? 1 : m < 96 ? -10 : m < 749 ? (dark ? -30 : -10) : m < 827 ? -10 : 1)

  return {
    start: at(0),
    end: at(840),
    times: STEPS.map(at),
    sun: STEPS.map(sunAt),
    sunset: at(4),
    astroDusk: dark ? at(96) : null,
    astroDawn: dark ? at(749) : null,
    sunrise: at(827),
  }
}

function makeMoon(altAt) {
  return { track: STEPS.map(m => ({ alt: altAt(m) })) }
}

function clouds(byHour) {
  return Array.from({ length: 14 }, (_, h) => byHour(h))
}

const NIGHT = makeNight()
const DOWN = makeMoon(() => -20)
const SETS = makeMoon(m => (m < 460 ? 30 : -5))
const RISES = makeMoon(m => (m < 310 ? -5 : 30))
const BOTH = makeMoon(m => (m < 190 || m >= 520 ? -5 : 30))
const CLEAR = clouds(() => 5)

function summary(options) {
  return hoursSummary({ night: NIGHT, moon: DOWN, clouds: CLEAR, showers: [], status: 'ready', timeZone: ZONE, ...options })
}

function leonids(highest, peak = 660) {
  return { name: 'Leonids', zhr: 15, daysFromPeak: 1, track: STEPS.map(m => ({ alt: highest - Math.abs(m - peak) / 10 })) }
}



// HOURLY ROW

test('whole hours run from the first after sunset to the last before sunrise', () => {
  const hours = hourCells({ night: NIGHT, moon: DOWN, clouds: CLEAR, timeZone: ZONE }).filter(cell => !cell.moment)
  expect(hours[0].label).toBe('6pm')
  expect(hours.at(-1).label).toBe('6am')
  expect(hours).toHaveLength(13)
})

test('a moment seconds after the hour replaces that hour instead of doubling it', () => {
  const night = { ...NIGHT, astroDusk: new Date(at(120).getTime() + 20 * 1000) }
  const sevens = hourCells({ night, moon: DOWN, clouds: CLEAR, timeZone: ZONE }).filter(cell => cell.label === '7pm')

  expect(sevens).toHaveLength(1)
  expect(sevens[0]).toMatchObject({ moment: true, word: 'Fully dark' })
})

test('hours while the sky is still bright say Twilight', () => {
  const hours = hourCells({ night: NIGHT, moon: DOWN, clouds: CLEAR, timeZone: ZONE }).filter(cell => !cell.moment)
  expect(hours[0]).toMatchObject({ kind: 'twilight', word: 'Twilight' })
  expect(hours.at(-1)).toMatchObject({ kind: 'twilight', word: 'Twilight' })
})

test('dark hours follow the cloud cover', () => {
  const cover = clouds(h => (h === 8 ? 30 : h === 9 ? 80 : 5))
  const hours = hourCells({ night: NIGHT, moon: DOWN, clouds: cover, timeZone: ZONE }).filter(cell => !cell.moment)
  const word = label => hours.find(cell => cell.label === label).word
  expect(word('7pm')).toBe('Clear')
  expect(word('1am')).toBe('Patchy')
  expect(word('2am')).toBe('Cloudy')
})

test('without a forecast, dark hours say Dark', () => {
  const hours = hourCells({ night: NIGHT, moon: DOWN, clouds: null, timeZone: ZONE }).filter(cell => !cell.moment)
  expect(hours[1]).toMatchObject({ label: '7pm', kind: 'dark', word: 'Dark' })
})

test('a missing forecast hour says Dark', () => {
  const cover = clouds(h => (h === 2 ? null : 5))
  const hours = hourCells({ night: NIGHT, moon: DOWN, clouds: cover, timeZone: ZONE }).filter(cell => !cell.moment)
  expect(hours[1]).toMatchObject({ label: '7pm', kind: 'dark' })
})

test('moments appear at their exact times, in order', () => {
  const moments = hourCells({ night: NIGHT, moon: SETS, clouds: CLEAR, timeZone: ZONE }).filter(cell => cell.moment)
  expect(moments.map(cell => `${cell.label} ${cell.word}`)).toEqual([
    '5:04pm Sunset',
    '6:36pm Fully dark',
    '12:40am Moonset',
    '5:29am Twilight',
    '6:47am Sunrise',
  ])
})

test('a Moon that rises and sets in one night shows both', () => {
  const kinds = hourCells({ night: NIGHT, moon: BOTH, clouds: CLEAR, timeZone: ZONE }).filter(cell => cell.moment).map(cell => cell.kind)
  expect(kinds).toContain('moonrise')
  expect(kinds).toContain('moonset')
})

test('a night without full darkness has no Fully dark or Dawn', () => {
  const kinds = hourCells({ night: makeNight({ dark: false }), moon: DOWN, clouds: CLEAR, timeZone: ZONE }).map(cell => cell.kind)
  expect(kinds).not.toContain('fully-dark')
  expect(kinds).not.toContain('dawn')
})

test('cells are in time order', () => {
  const times = hourCells({ night: NIGHT, moon: BOTH, clouds: CLEAR, timeZone: ZONE }).map(cell => cell.time.getTime())
  expect(times).toEqual([...times].sort((a, b) => a - b))
})



// CLOUD SENTENCE

test('clear all night', () => {
  expect(summary({})).toBe('Clear all night.')
})

test('cloudy all night', () => {
  expect(summary({ clouds: clouds(() => 90) })).toBe('Cloudy all night.')
})

test('patchy all night', () => {
  expect(summary({ clouds: clouds(() => 40) })).toBe('Patchy clouds all night.')
})

test('patchy clouds roll in', () => {
  expect(summary({ clouds: clouds(h => (h >= 8 ? 30 : 5)) })).toBe('Patchy clouds roll in around 1am.')
})

test('clouds roll in', () => {
  expect(summary({ clouds: clouds(h => (h >= 8 ? 90 : 5)) })).toBe('Clouds roll in around 1am.')
})

test('clouds clear', () => {
  expect(summary({ clouds: clouds(h => (h >= 6 ? 5 : 90)) })).toBe('Clouds clear around 11pm.')
})

test('clouds thicken', () => {
  expect(summary({ clouds: clouds(h => (h >= 9 ? 90 : 40)) })).toBe('Clouds thicken around 2am.')
})

test('clouds start to break', () => {
  expect(summary({ clouds: clouds(h => (h >= 9 ? 40 : 90)) })).toBe('Clouds start to break around 2am.')
})

test('missing forecast hours never count as a change', () => {
  expect(summary({ clouds: clouds(h => (h === 5 ? null : 5)) })).toBe('Clear all night.')
})

test('twilight clouds are left out when the night gets fully dark', () => {
  expect(summary({ clouds: clouds(h => (h <= 1 ? 90 : 5)) })).toBe('Clear all night.')
})

test('a night without full darkness uses every hour', () => {
  expect(summary({ night: makeNight({ dark: false }), clouds: clouds(h => (h >= 8 ? 90 : 5)) })).toBe('Clouds roll in around 1am.')
})

test('while the forecast loads', () => {
  expect(summary({ clouds: null, status: 'loading' })).toBe('Checking the forecast…')
})

test('when the forecast fails', () => {
  expect(summary({ clouds: null, status: 'failed' })).toBe('The forecast isn’t available right now, so clouds aren’t shown.')
})



// SECOND SENTENCE

test('a good shower waits for the Moon to set', () => {
  expect(summary({ moon: SETS, showers: [leonids(60)] })).toBe('Clear all night. Leonid meteors are best after the Moon sets at 12:40am.')
})

test('a good shower without moonlight is best when its radiant is highest', () => {
  expect(summary({ showers: [leonids(60)] })).toBe('Clear all night. Leonid meteors are best around 4am.')
})

test('an evening shower is best in the evening, even before the Moon sets', () => {
  expect(summary({ showers: [leonids(60, 180)] })).toBe('Clear all night. Leonid meteors are best around 8pm.')
  expect(summary({ moon: SETS, showers: [leonids(60, 180)] })).toBe('Clear all night. Leonid meteors are best around 8pm.')
})

test('a weak shower is not mentioned', () => {
  const taurids = { name: 'Northern Taurids', zhr: 5, daysFromPeak: 6, track: STEPS.map(() => ({ alt: 60 })) }
  expect(summary({ moon: SETS, showers: [taurids] })).toBe('Clear all night. The Moon sets at 12:40am, leaving darker skies.')
})

test('the Moon rising', () => {
  expect(summary({ moon: RISES })).toBe('Clear all night. The Moon rises at 10:10pm.')
})



// EDGES

test('a Moon that sets after dawn does not promise darker skies', () => {
  const late = makeMoon(m => (m < 790 ? 30 : -5))
  expect(summary({ moon: late })).toBe('Clear all night.')
  expect(summary({ moon: late, showers: [leonids(60)] })).toBe('Clear all night. Leonid meteors are best around 4am.')
})

test('no hours while the Sun stays up', () => {
  const day = { ...makeNight(), sun: STEPS.map(() => 5), sunset: null, sunrise: null, astroDusk: null, astroDawn: null }
  expect(hourCells({ night: day, moon: SETS, clouds: CLEAR, timeZone: ZONE })).toEqual([])
  expect(summary({ night: day, moon: SETS })).toBe('The Sun doesn’t set tonight.')
})

test('a night with no sunset or sunrise keeps the hours at both ends', () => {
  const polar = { ...makeNight(), sun: STEPS.map(() => -30), sunset: null, sunrise: null }
  const hours = hourCells({ night: polar, moon: DOWN, clouds: CLEAR, timeZone: ZONE }).filter(cell => !cell.moment)
  expect(hours[0].label).toBe('5pm')
  expect(hours.at(-1).label).toBe('7am')
})
