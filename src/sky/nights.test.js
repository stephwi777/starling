import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { nightRow, nightScale, sevenNights } from './nights.js'



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
  expect(row(hours(() => 5))).toEqual({ kind: 'clear', from: at(96), to: at(749), label: null, words: '6:36pm–5:29am' })
})

test('clouds rolling in end the window', () => {
  expect(row(hours(hour => (hour < 8 ? 5 : 90)))).toMatchObject({ kind: 'clear', words: '6:36pm–1am' })
})

test('a window under three hours is short', () => {
  expect(row(hours(hour => (hour === 9 || hour === 10 ? 5 : 90)))).toMatchObject({ kind: 'short', words: '2am–4am' })
})



// NO WINDOW

test('a cloudy night has no clear hours', () => {
  expect(row(hours(() => 90))).toEqual({ kind: 'none', from: null, to: null, label: 'No clear hours', words: 'Cloudy all night' })
  expect(row(hours(() => 50))).toMatchObject({ label: 'No clear hours', words: 'Patchy all night' })
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

test('every night shares one track from the earliest start to the latest end', () => {
  const early = night()
  const late = night(undefined, { start: at(60), end: at(900) })
  const scale = nightScale([early, late])

  expect(scale(early, early.start)).toBe(0)
  expect(scale(late, late.end)).toBe(1)
  expect(scale(early, at(450))).toBeCloseTo(0.5)
})



// SEVEN NIGHTS

function clearForecast() {
  const time = Array.from({ length: 9 * 24 }, (_, i) => {
    const day = String(19 + Math.floor(i / 24)).padStart(2, '0')

    return `2026-11-${day}T${String(i % 24).padStart(2, '0')}:00`
  })

  return { hourly_units: {}, hourly: { time, cloud_cover: time.map(() => 5) } }
}

test('seven nights from tonight with real Moon phases', () => {
  const nights = sevenNights(SAMPLE_PLACE, clearForecast(), new Date('2026-11-19T21:00:00Z'))

  expect(nights.map(entry => entry.day)).toEqual(['Tonight', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'])
  expect(nights.every(entry => entry.kind === 'clear')).toBe(true)
  expect(nights[6].moonLit).toBeGreaterThan(nights[0].moonLit)
  expect(nights.every(entry => entry.left >= 0 && entry.left + entry.width <= 1)).toBe(true)
})

test('a night dark before its track begins fills the whole track', () => {
  const tromso = { name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' }
  const time = Array.from({ length: 10 * 24 }, (_, i) => `2026-12-${20 + Math.floor(i / 24)}T${String(i % 24).padStart(2, '0')}:00`)
  const forecast = { hourly_units: {}, hourly: { time, cloud_cover: time.map(() => 5) } }
  const nights = sevenNights(tromso, forecast, new Date('2026-12-21T13:00:00Z'))

  expect(nights[0].words).toBe('4:56pm–6:28am')
  expect(nights.every(entry => entry.left >= 0 && entry.left + entry.width <= 1)).toBe(true)
  expect(nights[0].width).toBeGreaterThan(0.95)
})

test('seven nights without a forecast show dark hours', () => {
  const nights = sevenNights(SAMPLE_PLACE, null, new Date('2026-11-19T21:00:00Z'))

  expect(nights.every(entry => entry.kind === 'dark')).toBe(true)
})
