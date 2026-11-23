import { expect, test } from 'vitest'
import { observerFor } from '../night.js'
import { showerEvents } from './showerEvents.js'
import { monthBounds } from './skyTools.js'
import { starEvents } from './starEvents.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const SYDNEY = { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney', country: 'AU' }
const OSLO = { name: 'Oslo', latitude: 59.91, longitude: 10.75, timeZone: 'Europe/Oslo', country: 'NO' }

function month(year, number, place = KC) {
  const { start, end } = monthBounds(year, number, place.timeZone)

  return starEvents(start, end, place, observerFor(place))
}

function season(year, place) {
  return Array.from({ length: 12 }, (_, i) => month(year, i + 1, place))
    .flat()
    .filter(event => event.kinds.includes('milky-way'))
    .map(event => [event.name, event.day])
}

const named = (events, name) => events.find(event => event.name === name)



// MOON AND PLANETS NEAR STARS

test('Mars passes through the Beehive on June 2, 2023', () => {
  const event = named(month(2023, 6), 'Mars in the Beehive')

  expect(event.day).toBe('2023-06-02')
  expect(event.group).toBe('planet')
  expect(event.icon).toBe('planet:Mars')
})

test('Venus passes through the Pleiades on April 3, 2020', () => {
  expect(named(month(2020, 4), 'Venus in the Pleiades').day).toBe('2020-04-03')
})

test('the Moon passes the Pleiades in January 2027 and the card shows the cluster', () => {
  const event = named(month(2027, 1), 'Moon near the Pleiades')

  expect(event.group).toBe('moon')
  expect(event.icon).toBe('sky:M45')
  expect(event.note).toMatch(/^The Moon passes \d/)
})

test('a pass that happens in daylight here only shows worldwide', () => {
  const event = named(month(2027, 8), 'Moon near Regulus')

  expect(event.here).toBe(false)
  expect(event.where).toBe('Below your horizon after dark.')
})



// MILKY WAY SEASON

test('the Milky Way season runs from February to October in Kansas City', () => {
  expect(season(2027, KC)).toEqual([
    ['Milky Way season begins', '2027-02-14'],
    ['Milky Way season ends', '2027-10-14'],
  ])
})

test('the season starts earlier in the south', () => {
  const [begins] = season(2027, SYDNEY)

  expect(begins[1] < '2027-02-01').toBe(true)
})

test('there is no Milky Way season where the core never clears the horizon', () => {
  expect(season(2027, OSLO)).toEqual([])
})



// ALPHA CAPRICORNIDS

test('the Alpha Capricornids peak with the Southern Delta Aquariids at the end of July', () => {
  const { start, end } = monthBounds(2027, 7, KC.timeZone)
  const peaks = showerEvents(start, end, KC, observerFor(KC)).map(event => [event.name, event.day])

  expect(peaks).toContainEqual(['Alpha Capricornids peak', '2027-07-30'])
})
