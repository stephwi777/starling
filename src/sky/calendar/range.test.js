import { expect, test } from 'vitest'
import { parseComets } from './cometOrbit.js'
import { cometSeason } from './cometEvents.js'
import { monthEvents } from './monthEvents.js'
import { dayRange } from './skyTools.js'
import { LEMMON } from './__fixtures__/cometLines.js'



// PLACES

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }



// WORDS

test('a range in one month names the month once', () => {
  expect(dayRange({ from: '2027-04-14', to: '2027-04-30' })).toBe('Apr 14–30')
})

test('a range across months names both', () => {
  expect(dayRange({ from: '2027-07-17', to: '2027-08-24' })).toBe('Jul 17–Aug 24')
})



// SHOWERS

test('a shower’s range is its active period', () => {
  const perseids = monthEvents(KC, 2027, 8).find(event => event.name === 'Perseids peak')

  expect(perseids.range).toEqual({ from: '2027-07-17', to: '2027-08-24' })
  expect(perseids.rows.find(([label]) => label === 'Active')[1]).toBe('Jul 17–Aug 24')
})

test('a shower active over New Year starts the year before', () => {
  const quadrantids = monthEvents(KC, 2027, 1).find(event => event.name === 'Quadrantids peak')

  expect(quadrantids.range).toEqual({ from: '2026-12-28', to: '2027-01-12' })
})



// COMETS

test('every card of a comet shares the nights it can be seen from here', () => {
  const events = cometSeason(parseComets(LEMMON), KC, new Date('2025-09-15T12:00:00Z'))
  const [arrives, , last] = events

  expect(events.every(event => event.range === arrives.range)).toBe(true)
  expect(arrives.range.from).toBe(arrives.day)
  expect(arrives.range.to).toBe(last.day)
  expect(arrives.rows[0]).toEqual(['Visible', dayRange(arrives.range)])
})
