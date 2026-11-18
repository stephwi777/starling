import { expect, test } from 'vitest'
import { comingUp, eventDay, litSide } from './comingUp.js'



// HELPERS

const NOW = new Date('2026-11-13T20:00:00Z')
const DAY = 24 * 60 * 60 * 1000



// TESTS

test('three events, in date order, within 30 days', () => {
  const events = comingUp(NOW)
  expect(events.length).toBe(3)
  events.forEach((event, i) => {
    expect(event.date - NOW).toBeGreaterThan(0)
    expect(event.date - NOW).toBeLessThanOrEqual(30 * DAY)
    if (i > 0) expect(event.date >= events[i - 1].date).toBe(true)
  })
})

test('the Leonids peak and the Full Moon are coming up', () => {
  const events = comingUp(NOW, { count: 10 })
  const leonids = events.find(event => event.name === 'Leonids peak')
  const full = events.find(event => event.kind === 'full-moon')
  expect(leonids.note).toBe('Up to 15 meteors an hour')
  expect(full.name).toBe('Full Moon')
  expect(full.date.toISOString().slice(0, 10)).toBe('2026-11-24')
})

test('nothing past 30 days, so the Geminids peak is left out', () => {
  const events = comingUp(NOW, { count: 10 })
  expect(events.every(event => event.date <= new Date('2026-12-13T20:00:00Z'))).toBe(true)
  expect(events.some(event => event.name === 'Geminids peak')).toBe(false)
})

test('a short window can be empty without crashing', () => {
  expect(comingUp(new Date('2026-11-26T00:00:00Z'), { days: 1 })).toEqual([])
})

test('a shower peak is a calendar day that reads the same in every time zone', () => {
  const leonids = comingUp(NOW, { count: 10 }).find(event => event.name === 'Leonids peak')
  expect(leonids.allDay).toBe(true)
  expect(eventDay(leonids, 'America/Los_Angeles')).toBe('Nov 17')
  expect(eventDay(leonids, 'Pacific/Honolulu')).toBe('Nov 17')
  expect(eventDay(leonids, 'Pacific/Auckland')).toBe('Nov 17')
})

test('a shower stays listed through its whole peak day', () => {
  const lateOnPeakDay = new Date('2026-11-17T20:00:00Z')
  expect(comingUp(lateOnPeakDay, { count: 10 }).some(event => event.name === 'Leonids peak')).toBe(true)
})

test('Moon phases are shown in the place time zone', () => {
  const full = comingUp(NOW, { count: 10 }).find(event => event.kind === 'full-moon')
  expect(eventDay(full, 'America/Chicago')).toBe('Nov 24')
})

test('quarter Moons are lit on the side seen from each hemisphere', () => {
  expect(litSide('first-quarter', false)).toBe('right')
  expect(litSide('last-quarter', false)).toBe('left')
  expect(litSide('first-quarter', true)).toBe('left')
  expect(litSide('last-quarter', true)).toBe('right')
})
