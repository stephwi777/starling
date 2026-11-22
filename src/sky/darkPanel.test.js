import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight, observerFor } from './night.js'
import { darkSpan } from './darkness.js'
import { STEP_COUNT, atWords, darkVerdict, hoursWords, darkLine, moonTimes, sampleKind, skyPath, moonlessWindows } from './darkPanel.js'



// HELPERS

const ZONE = 'America/Chicago'
const HOUR = 60 * 60 * 1000
const OSLO = { ...SAMPLE_PLACE, latitude: 59.91, longitude: 10.75, timeZone: 'Europe/Oslo', country: 'NO' }
const TROMSO = { ...SAMPLE_PLACE, latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo', country: 'NO' }

function nightOf(date, place = SAMPLE_PLACE) {
  return buildNight(place, 0, new Date(`${date}T20:00:00Z`))
}



// SKY PATH

test('the sky path samples every 10 minutes from noon to noon', () => {
  const night = nightOf('2026-11-19')
  const path = skyPath(observerFor(SAMPLE_PLACE), night.noon)

  expect(STEP_COUNT).toBe(145)
  expect(path.sun).toHaveLength(145)
  expect(path.times[0]).toEqual(night.noon)
  expect(path.times.at(-1) - path.times[0]).toBe(24 * HOUR)
  expect(Math.min(...path.sun)).toBeLessThan(-60)
})



// MOONLESS

test('a setting Moon leaves moonless hours after it sets', () => {
  const night = nightOf('2026-11-19')
  const windows = moonlessWindows(night)

  expect(darkLine(night, windows, ZONE)).toBe('Moon sets at 2:32am; moonless until 5:34am.')
  expect(darkVerdict(night, windows, ZONE)).toEqual({ value: '3 hr 2 min', line: 'Moonless, 2:32am–5:34am' })
})

test('near full Moon there are no moonless hours', () => {
  const night = nightOf('2026-11-23')
  const windows = moonlessWindows(night)

  expect(windows).toEqual([])
  expect(darkLine(night, windows, ZONE)).toBe('Moon up all night; fully dark until 5:37am.')
  expect(darkVerdict(night, windows, ZONE)).toEqual({ value: 'No moonless hours', line: 'The 100% lit Moon is up all night.' })
})

test('a rising Moon ends the moonless hours', () => {
  const night = nightOf('2026-12-03')
  const windows = moonlessWindows(night)

  expect(windows[0].from).toEqual(darkSpan(night).from)
  expect(darkLine(night, windows, ZONE)).toBe('Moon rises at 3:11am; fully dark until 5:46am.')
})

test('around new Moon the whole dark span is moonless', () => {
  const night = nightOf('2026-12-09')
  const windows = moonlessWindows(night)

  expect(windows).toEqual([darkSpan(night)])
  expect(darkLine(night, windows, ZONE)).toBe('Moonless all night, until 5:51am.')
  expect(darkVerdict(night, windows, ZONE).value).toBe('11 hr 19 min')
})

test('midsummer nights far north never get fully dark', () => {
  const oslo = nightOf('2026-06-21', OSLO)
  const tromso = nightOf('2026-06-21', TROMSO)

  expect(moonlessWindows(oslo)).toEqual([])
  expect(darkLine(oslo, [], OSLO.timeZone)).toBeNull()
  expect(darkVerdict(oslo, [], OSLO.timeZone).value).toBe('No full dark')
  expect(darkVerdict(tromso, [], TROMSO.timeZone).value).toBe('No night')
})



// WORDS

test('hours read in hours and minutes', () => {
  expect(hoursWords(3 * HOUR)).toBe('3 hr')
  expect(hoursWords(3 * HOUR + 10 * 60 * 1000)).toBe('3 hr 10 min')
  expect(hoursWords(40 * 60 * 1000)).toBe('40 min')
})

test('each moment is day, twilight, moonlit or dark', () => {
  expect(sampleKind(5, -10)).toBe('day')
  expect(sampleKind(-10, 20)).toBe('twilight')
  expect(sampleKind(-30, 5)).toBe('moonlit')
  expect(sampleKind(-30, -5)).toBe('dark')
})

test('the chosen moment is described in words', () => {
  const time = new Date('2026-11-20T03:30:00Z')

  expect(atWords(time, -51, 30, ZONE)).toBe('9:30pm · Fully dark, Moon up · Sun 51° down')
  expect(atWords(time, -8, -5, ZONE)).toBe('9:30pm · Nautical twilight · Sun 8° down')
  expect(atWords(time, 12, -5, ZONE)).toBe('9:30pm · Daylight · Sun 12° up')
})

test('Moon times are listed in order', () => {
  expect(moonTimes(SAMPLE_PLACE, nightOf('2026-11-19').noon, ZONE)).toBe('rises 1:59pm · sets 2:32am')
  expect(moonTimes(SAMPLE_PLACE, nightOf('2026-12-03').noon, ZONE)).toBe('sets 1:40pm · rises 3:11am')
})
