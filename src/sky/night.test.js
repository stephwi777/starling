import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight, upcomingNights } from './night.js'



// HELPERS

const NOW = new Date('2026-11-13T20:00:00Z')

const FAIRBANKS = { ...SAMPLE_PLACE, name: 'Fairbanks', latitude: 64.84, longitude: -147.72, timeZone: 'America/Anchorage' }

function minutesApart(a, b) {
  return Math.abs(a.getTime() - new Date(b).getTime()) / 60000
}



// TESTS

test('sunset, civil dusk and sunrise match the Naval Observatory', () => {
  const night = buildNight(SAMPLE_PLACE, 0, NOW)
  expect(minutesApart(night.sunset, '2026-11-13T23:05:00Z')).toBeLessThan(2)
  expect(minutesApart(night.civilDusk, '2026-11-13T23:34:00Z')).toBeLessThan(2)
  expect(minutesApart(night.sunrise, '2026-11-14T13:00:00Z')).toBeLessThan(2)
})

test('the night runs on whole hours in ten-minute steps', () => {
  const night = buildNight(SAMPLE_PLACE, 0, NOW)
  expect(night.start.toISOString()).toBe('2026-11-13T23:00:00.000Z')
  expect(night.end.toISOString()).toBe('2026-11-14T14:00:00.000Z')
  expect(night.hours).toBe(15)
  expect(night.times[1] - night.times[0]).toBe(10 * 60 * 1000)
  expect(night.times.at(-1).toISOString()).toBe('2026-11-14T14:00:00.000Z')
  expect(night.sun.length).toBe(night.times.length)
})

test('the Moon is a thin crescent', () => {
  const night = buildNight(SAMPLE_PLACE, 0, NOW)
  expect(night.moonLit).toBeGreaterThan(0.15)
  expect(night.moonLit).toBeLessThan(0.22)
  expect(night.moonAngle).toBeLessThan(90)
})

test('2am still belongs to the night that began the evening before', () => {
  const night = buildNight(SAMPLE_PLACE, 0, new Date('2026-11-14T08:00:00Z'))
  expect(night.start.toISOString()).toBe('2026-11-13T23:00:00.000Z')
})

test('later nights start on later evenings', () => {
  const night = buildNight(SAMPLE_PLACE, 3, NOW)
  expect(night.start.toISOString()).toBe('2026-11-16T23:00:00.000Z')
})

test('a far-north summer night has no full darkness and does not break', () => {
  const night = buildNight(FAIRBANKS, 0, new Date('2026-06-21T20:00:00Z'))
  expect(night.astroDusk).toBeNull()
  expect(night.nauticalDusk).toBeNull()
  expect(night.times.length).toBeGreaterThan(0)
})

test('upcoming nights list seven evenings with Moon phases', () => {
  const nights = upcomingNights(SAMPLE_PLACE, NOW, 7)
  expect(nights.length).toBe(7)
  expect(nights[0]).toMatchObject({ index: 0, date: '2026-11-13' })
  expect(nights[6].date).toBe('2026-11-19')
  expect(nights[1].moonAngle).toBeGreaterThan(nights[0].moonAngle)
})

test('3am in Auckland still belongs to the night before', () => {
  const auckland = { ...SAMPLE_PLACE, name: 'Auckland', latitude: -36.85, longitude: 174.76, timeZone: 'Pacific/Auckland' }
  expect(upcomingNights(auckland, new Date('2026-11-13T14:00:00Z'), 1)[0].date).toBe('2026-11-13')
})

test('a polar night finds this evening’s darkness, not tomorrow’s', () => {
  const tromso = { ...SAMPLE_PLACE, name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' }
  const night = buildNight(tromso, 0, new Date('2026-12-15T11:00:00Z'))
  const hours = (night.astroDawn - night.astroDusk) / 3600000
  expect(night.sunset).toBeNull()
  expect(night.astroDusk.toISOString().slice(0, 10)).toBe('2026-12-15')
  expect(hours).toBeGreaterThan(10)
  expect(hours).toBeLessThan(16)
})
