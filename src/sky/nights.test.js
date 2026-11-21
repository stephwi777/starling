import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { bestIndex, blockRange, nightBlocks, nightRow, sevenNights } from './nights.js'



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
    noon: at(-300),
    start: at(0),
    end: at(840),
    times: STEPS.map(at),
    sun: STEPS.map(sunAt),
    astroDusk: at(96),
    astroDawn: at(749),
    hours: 14,
    ...extra,
  }
}

function hours(pick) {
  return Array.from({ length: 15 }, (_, hour) => pick(hour))
}

function row(clouds, options) {
  return nightRow(night(undefined, options), clouds, ZONE)
}



// CLEAR WINDOW

test('a clear night shows the whole dark window', () => {
  expect(row(hours(() => 5))).toEqual({ kind: 'clear', from: at(96), to: at(749), label: null, words: '6:36pm–5:29am', windows: [{ from: at(96), to: at(749) }] })
})

test('clouds rolling in end the window', () => {
  expect(row(hours(hour => (hour < 8 ? 5 : 90)))).toMatchObject({ kind: 'clear', words: '6:36pm–1am' })
})

test('every clear stretch is kept, not just the longest', () => {
  const twice = row(hours(hour => (hour === 2 || hour === 3 || hour === 10 || hour === 11 ? 5 : 90)))

  expect(twice.words).toBe('7pm–9pm and 3am–5am')
  expect(twice.windows).toHaveLength(2)
})

test('a short window is still a clear window', () => {
  expect(row(hours(hour => (hour === 9 || hour === 10 ? 5 : 90)))).toMatchObject({ kind: 'clear', words: '2am–4am' })
})



// NO WINDOW

test('a cloudy night has no clear hours', () => {
  expect(row(hours(() => 90))).toEqual({ kind: 'none', from: null, to: null, label: 'Cloudy all night', words: 'Cloudy all night', fall: null })
  expect(row(hours(() => 50))).toMatchObject({ label: 'Patchy all night', words: 'Patchy all night' })
})

test('a cloudy wet night says rain or snow is likely', () => {
  expect(nightRow(night(), hours(() => 90), ZONE, 'rain')).toMatchObject({ label: 'Rain likely', words: 'Cloudy all night', fall: 'rain' })
  expect(nightRow(night(), hours(() => 90), ZONE, 'snow')).toMatchObject({ label: 'Snow likely' })
})

test('without a forecast the bar shows dark hours only', () => {
  expect(row(null)).toMatchObject({ kind: 'dark', words: '6:36pm–5:29am' })
})

test('a night that never gets fully dark', () => {
  const twilight = nightRow(night(() => -10, { astroDusk: null, astroDawn: null }), hours(() => 5), ZONE)

  expect(twilight).toMatchObject({ kind: 'none', label: 'No full dark', words: 'Twilight all night' })
})

test('a night when the Sun never sets', () => {
  const midnightSun = nightRow(night(() => 5, { astroDusk: null, astroDawn: null }), hours(() => 5), ZONE)

  expect(midnightSun).toMatchObject({ kind: 'none', label: 'No night', words: 'Sun up all night' })
})



// SCALE

test('every night shares one grid of hours from the earliest start to the latest end', () => {
  const late = night(undefined, { start: at(60), end: at(900) })

  expect(blockRange([night(), late])).toEqual({ first: 5, count: 15 })
})



// HOUR BLOCKS

const RANGE = { first: 5, count: 14 }
const MOON_SETS = [{ from: at(420), to: at(900) }]

test('each hour block says twilight, cloudy, moonlit or truly dark', () => {
  const blocks = nightBlocks(night(), hours(hour => (hour === 8 ? 90 : 5)), MOON_SETS, RANGE)

  expect(blocks).toEqual(['twilight', 'twilight', 'moonlit', 'moonlit', 'moonlit', 'moonlit', 'moonlit', 'dark', 'cloudy', 'dark', 'dark', 'dark', 'twilight', 'twilight'])
})

test('without a forecast dark hours are unknown', () => {
  expect(nightBlocks(night(), null, [], RANGE).slice(2, 4)).toEqual(['unknown', 'unknown'])
})

test('hours outside a night’s own span are twilight on the shared grid', () => {
  const blocks = nightBlocks(night(), hours(() => 5), MOON_SETS, { first: 4, count: 16 })

  expect(blocks[0]).toBe('twilight')
  expect(blocks[3]).toBe('moonlit')
  expect(blocks.at(-1)).toBe('twilight')
})



// SEVEN NIGHTS

function clearForecast() {
  const time = Array.from({ length: 9 * 24 }, (_, i) => {
    const day = String(19 + Math.floor(i / 24)).padStart(2, '0')

    return `2026-11-${day}T${String(i % 24).padStart(2, '0')}:00`
  })

  return { utc_offset_seconds: -21600, hourly_units: {}, hourly: { time, cloud_cover: time.map(() => 5) } }
}

test('seven nights from tonight with real Moon phases', () => {
  const { nights } = sevenNights(SAMPLE_PLACE, clearForecast(), new Date('2026-11-19T21:00:00Z'))

  expect(nights.map(entry => entry.day)).toEqual(['Tonight', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'])
  expect(nights.every(entry => entry.kind === 'clear')).toBe(true)
  expect(nights[6].moonLit).toBeGreaterThan(nights[0].moonLit)
  expect(new Set(nights.map(entry => entry.blocks.length)).size).toBe(1)
})

test('a night dark before its track begins fills the whole track', () => {
  const tromso = { name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' }
  const time = Array.from({ length: 10 * 24 }, (_, i) => `2026-12-${20 + Math.floor(i / 24)}T${String(i % 24).padStart(2, '0')}:00`)
  const forecast = { utc_offset_seconds: 3600, hourly_units: {}, hourly: { time, cloud_cover: time.map(() => 5) } }
  const { nights } = sevenNights(tromso, forecast, new Date('2026-12-21T13:00:00Z'))

  expect(nights[0].words).toBe('4:56pm–6:29am')
  expect(nights[0].blocks.filter(block => block === 'twilight').length).toBeLessThan(4)
})

test('seven nights without a forecast show dark hours', () => {
  const { nights } = sevenNights(SAMPLE_PLACE, null, new Date('2026-11-19T21:00:00Z'))

  expect(nights.every(entry => entry.kind === 'dark')).toBe(true)
  expect(nights[0].blocks).toContain('unknown')
})



// MOONLIGHT AND BEST NIGHT

test('the best night has the most truly dark time, with moonlit time worth less', () => {
  const clear = (dark, moonlit) => ({ kind: 'clear', blocks: [...Array(dark).fill('dark'), ...Array(moonlit).fill('moonlit')] })

  expect(bestIndex([clear(2, 6), clear(5, 0), { kind: 'none', blocks: [] }])).toBe(1)
  expect(bestIndex([clear(0, 4), clear(0, 6)])).toBe(1)
  expect(bestIndex([{ kind: 'none', blocks: [] }, { kind: 'dark', blocks: ['unknown'] }])).toBeNull()
})

test('seven nights mark one best night and place the scale marks', () => {
  const { nights, marks } = sevenNights(SAMPLE_PLACE, clearForecast(), new Date('2026-11-19T21:00:00Z'))

  expect(nights.filter(entry => entry.best)).toHaveLength(1)
  expect(nights[0].blocks).toContain('dark')
  expect(marks.map(mark => mark.label)).toEqual(['6pm', 'midnight', '6am'])
  expect(marks[0].at).toBeLessThan(marks[1].at)
  expect(marks[1].at).toBeLessThan(marks[2].at)
})
