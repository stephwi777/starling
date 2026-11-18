import { expect, test } from 'vitest'
import { comingUp } from './comingUp.js'



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

test('the Leonids peak and the full moon are coming up', () => {
  const events = comingUp(NOW, { count: 10 })
  const leonids = events.find(event => event.name === 'Leonids peak')
  const full = events.find(event => event.kind === 'full-moon')
  expect(leonids.note).toBe('Up to 15 meteors an hour')
  expect(full.name).toBe('Full moon')
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
