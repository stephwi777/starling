import { expect, test } from 'vitest'
import { clock, compass, dayName, fists, height, hourLabel, shortCompass, where } from './words.js'



// TESTS

test('clock uses the place time zone and drops :00', () => {
  expect(clock(new Date('2026-11-14T03:15:00Z'), 'America/Chicago')).toBe('9:15pm')
  expect(clock(new Date('2026-11-14T03:15:00Z'), 'Europe/Paris')).toBe('4:15am')
  expect(clock(new Date('2026-11-14T03:00:00Z'), 'America/Chicago')).toBe('9pm')
})

test('clock says midnight and noon in words', () => {
  expect(clock(new Date('2026-11-14T06:00:00Z'), 'America/Chicago')).toBe('midnight')
  expect(clock(new Date('2026-11-14T18:00:00Z'), 'America/Chicago')).toBe('noon')
  expect(clock(new Date('2026-11-14T06:30:00Z'), 'America/Chicago')).toBe('12:30am')
})

test('dayName gives the weekday and date in the place time zone', () => {
  expect(dayName(new Date('2026-11-19T18:00:00Z'), 'America/Chicago')).toBe('Thursday, November 19')
  expect(dayName(new Date('2026-11-19T18:00:00Z'), 'Pacific/Kiritimati')).toBe('Friday, November 20')
})

test('hourLabel shows just the hour', () => {
  expect(hourLabel(new Date('2026-11-14T06:00:00Z'), 'America/Chicago')).toBe('12am')
})

test('compass gives sixteen written-out points', () => {
  expect(compass(0)).toBe('north')
  expect(compass(359)).toBe('north')
  expect(compass(202.5)).toBe('south-southwest')
  expect(shortCompass(225)).toBe('SW')
})

test('height words follow the bands', () => {
  expect(height(5)).toBe('on the horizon')
  expect(height(20)).toBe('low')
  expect(height(40)).toBe('halfway up')
  expect(height(60)).toBe('high')
  expect(height(80)).toBe('nearly overhead')
})

test('fists round to whole fists, at least one', () => {
  expect(fists(4)).toBe('1 fist up')
  expect(fists(44)).toBe('4 fists up')
})

test('where combines height and direction', () => {
  expect(where(20, 225)).toBe('Low in the southwest')
  expect(where(80, 10)).toBe('Nearly overhead')
})
