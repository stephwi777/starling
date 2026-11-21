import { expect, test } from 'vitest'
import { observerFor } from '../night.js'
import { sunEvents } from './seasonEvents.js'
import { showerEvents } from './showerEvents.js'
import { monthBounds } from './skyTools.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const SYDNEY = { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney', country: 'AU' }

function range(year, month, place = KC) {
  return monthBounds(year, month, place.timeZone)
}



// SEASONS

test('the December 2026 solstice is the longest night in the north', () => {
  const { start, end } = range(2026, 12)
  const [solstice] = sunEvents(start, end, KC).filter(event => event.kinds.includes('season'))

  expect(solstice).toMatchObject({ day: '2026-12-21', time: '2:50pm', name: 'December solstice' })
  expect(solstice.note).toMatch(/^Longest night of the year/)
})

test('the same solstice is the longest day in the south', () => {
  const { start, end } = range(2026, 12, SYDNEY)
  const [solstice] = sunEvents(start, end, SYDNEY).filter(event => event.kinds.includes('season'))

  expect(solstice.note).toMatch(/^Longest day of the year/)
})

test('Earth is closest to the Sun in early January', () => {
  const { start, end } = range(2027, 1)
  const [close] = sunEvents(start, end, KC).filter(event => event.kinds.includes('earth-distance'))

  expect(close).toMatchObject({ day: '2027-01-02', short: 'Earth closest to Sun' })
  expect(close.rows[0][1]).toMatch(/million mi$/)
})



// SHOWERS

test('December has the Geminids as a major shower and the Ursids as a minor one', () => {
  const { start, end } = range(2026, 12)
  const showers = showerEvents(start, end, KC, observerFor(KC))

  expect(showers.map(event => [event.short, event.kinds[0], event.day, event.here])).toEqual([
    ['Geminids peak', 'major-shower', '2026-12-13', true],
    ['Ursids peak', 'minor-shower', '2026-12-22', true],
  ])
})

test('a shower whose radiant never rises high enough is not visible from here', () => {
  const { start, end } = range(2027, 1, SYDNEY)
  const [quadrantids] = showerEvents(start, end, SYDNEY, observerFor(SYDNEY))

  expect(quadrantids).toMatchObject({ short: 'Quadrantids peak', here: false, where: 'Best seen from the Northern Hemisphere.' })
})

test('showers spanning the new year show the right active dates', () => {
  const { start, end } = range(2027, 1)
  const [quadrantids] = showerEvents(start, end, KC, observerFor(KC))

  expect(quadrantids.rows.find(([label]) => label === 'Active')[1]).toBe('Dec 28 to Jan 12')
})
