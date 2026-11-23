import { expect, test } from 'vitest'
import { observerFor } from '../night.js'
import { eclipseEvents } from './eclipseEvents.js'
import { monthBounds } from './skyTools.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const MADRID = { name: 'Madrid', latitude: 40.4, longitude: -3.7, timeZone: 'Europe/Madrid', country: 'ES' }
const LONDON = { name: 'London', latitude: 51.5, longitude: -0.12, timeZone: 'Europe/London', country: 'GB' }

function month(year, number, place = KC) {
  const { start, end } = monthBounds(year, number, place.timeZone)

  return eclipseEvents(start, end, place, observerFor(place))
}

const row = (event, label) => event.rows.find(([name]) => name === label)?.[1]



// LUNAR

test('the March 2026 total lunar eclipse is visible from Kansas City with its totality times', () => {
  const [eclipse] = month(2026, 3).filter(event => event.kinds.includes('lunar-eclipse'))

  expect(eclipse).toMatchObject({ day: '2026-03-03', name: 'Total lunar eclipse', here: true })
  expect(row(eclipse, 'Totality')).toBe('5:04am–6:03am')
  expect(row(eclipse, 'Moon')).toBe('Sets mid-eclipse at 6:51am')
})

test('a lunar eclipse that starts before moonrise says when the Moon rises', () => {
  const [eclipse] = month(2027, 2).filter(event => event.kinds.includes('lunar-eclipse'))

  expect(eclipse).toMatchObject({ name: 'Penumbral lunar eclipse', here: true })
  expect(row(eclipse, 'Moon')).toBe('Rises mid-eclipse at 6:01pm')
})

test('a lunar eclipse that runs into sunrise says when the Sun rises', () => {
  const [eclipse] = month(2026, 3).filter(event => event.kinds.includes('lunar-eclipse'))

  expect(row(eclipse, 'Sun')).toBe('Rises mid-eclipse at 6:48am')
})

test('totality after sunrise is marked as not seen from here', () => {
  const [eclipse] = month(2025, 3, LONDON).filter(event => event.kinds.includes('lunar-eclipse'))

  expect(eclipse).toMatchObject({ name: 'Total lunar eclipse', here: true })
  expect(row(eclipse, 'Totality')).toMatch(/, not seen from here$/)
  expect(row(eclipse, 'Sun')).toBe('Rises mid-eclipse at 6:16am')
})

test('a lunar eclipse with the Moon up only in daylight is not visible from here', () => {
  const [eclipse] = month(2031, 6).filter(event => event.kinds.includes('lunar-eclipse'))

  expect(eclipse.here).toBe(false)
})



// SOLAR

test('the April 2024 eclipse was partial from Kansas City, 89% covered', () => {
  const [eclipse] = month(2024, 4).filter(event => event.kinds.includes('solar-eclipse'))

  expect(eclipse).toMatchObject({ day: '2024-04-08', name: 'Partial solar eclipse', here: true })
  expect(eclipse.time).toBe('1:55pm')
  expect(row(eclipse, 'Covered')).toBe('89% of the Sun')
  expect(eclipse.note).toMatch(/It’s total near North America\./)
})

test('an eclipse not visible from here says where it is centered', () => {
  const [eclipse] = month(2027, 2).filter(event => event.kinds.includes('solar-eclipse'))

  expect(eclipse).toMatchObject({ name: 'Annular solar eclipse', here: false, where: 'Centered over South America.' })
})

test('a nearly total partial eclipse never rounds up to 100%', () => {
  const [eclipse] = month(2026, 8, MADRID).filter(event => event.kinds.includes('solar-eclipse'))

  expect(row(eclipse, 'Covered')).toBe('99.9% of the Sun')
})

test('a solar eclipse that runs past sunset says when the Sun sets', () => {
  const [eclipse] = month(2026, 8, MADRID).filter(event => event.kinds.includes('solar-eclipse'))

  expect(row(eclipse, 'Sun')).toBe('Sets mid-eclipse at 9:16pm')
})

test('a solar eclipse with the Sun up throughout has no Sun line', () => {
  const [eclipse] = month(2024, 4).filter(event => event.kinds.includes('solar-eclipse'))

  expect(row(eclipse, 'Sun')).toBeUndefined()
})



// TRANSITS

test('the 2032 Mercury transit happens while the Sun is down in Kansas City', () => {
  const [transit] = month(2032, 11).filter(event => event.kinds.includes('transit'))

  expect(transit).toMatchObject({ day: '2032-11-13', short: 'Mercury transit', name: 'Mercury crosses the Sun', here: false })
  expect(row(transit, 'Begins')).toBe('12:42am')
})
