import { expect, test } from 'vitest'
import { clock } from './words.js'
import { chosenIndex, monthMoons, nearestNotch, notchesFor, rulerLabel, rulerNights, sameTimeIndex, tonightIndex } from './moonNights.js'



// HELPERS

const KC = { latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const NOW = new Date('2026-11-19T21:00:00Z')
const NIGHTS = rulerNights(KC, NOW)
const NOTCHES = notchesFor(NIGHTS, KC.timeZone)

function findNight(month, day) {
  return NIGHTS.findIndex(night => night.month === month && night.day === day)
}

function notchAt(iso) {
  return NOTCHES.findIndex(notch => notch.time.toISOString() === iso)
}



// NIGHTS

test('three months of nights around tonight', () => {
  expect(NIGHTS).toHaveLength(92)
  expect([NIGHTS[0].month, NIGHTS[0].day, NIGHTS.at(-1).month, NIGHTS.at(-1).day]).toEqual([10, 1, 12, 31])
  expect(NIGHTS[tonightIndex(NIGHTS, KC, NOW)].day).toBe(19)
})



// NOTCHES

test('a night has twelve 2-hour notches from noon, with midnight in the middle', () => {
  const tonight = NOTCHES.filter(notch => notch.night === tonightIndex(NIGHTS, KC, NOW))

  expect(tonight.map(notch => clock(notch.time, KC.timeZone))).toEqual(['noon', '2pm', '4pm', '6pm', '8pm', '10pm', 'midnight', '2am', '4am', '6am', '8am', '10am'])
  expect(tonight.map(notch => notch.kind).filter(kind => kind !== 'plain')).toEqual(['noon', 'midnight'])
})

test('the night the clocks fall back keeps even local hours', () => {
  const night = NOTCHES.filter(notch => notch.night === findNight(10, 31))
  const midnight = night.find(notch => notch.kind === 'midnight')
  const twoAm = night.find(notch => clock(notch.time, KC.timeZone) === '2am')

  expect(night).toHaveLength(12)
  expect(twoAm.time - midnight.time).toBe(3 * 60 * 60 * 1000)
})

test('the nearest notch to a moment', () => {
  expect(NOTCHES[nearestNotch(NOTCHES, new Date('2026-11-20T06:40:00Z'))].time.toISOString()).toBe('2026-11-20T06:00:00.000Z')
})

test('the chosen moment survives the ruler being rebuilt', () => {
  const home = nearestNotch(NOTCHES, NIGHTS[tonightIndex(NIGHTS, KC, NOW)].midnight)

  expect(chosenIndex(NOTCHES, home, null)).toBe(home)
  expect(NOTCHES[chosenIndex(NOTCHES, home, new Date('2026-11-25T06:00:00Z'))].time.toISOString()).toBe('2026-11-25T06:00:00.000Z')
  expect(chosenIndex(NOTCHES, home, new Date('2027-06-01T06:00:00Z'))).toBe(NOTCHES.length - 1)
  expect(chosenIndex(NOTCHES, home, new Date('2026-01-01T06:00:00Z'))).toBe(0)
})

test('changing nights keeps the time of night', () => {
  const fourAm = sameTimeIndex(NOTCHES, NIGHTS, notchAt('2026-11-20T10:00:00.000Z'), findNight(11, 24))
  const eightPm = sameTimeIndex(NOTCHES, NIGHTS, notchAt('2026-11-25T02:00:00.000Z'), findNight(10, 31))

  expect(NOTCHES[fourAm].time.toISOString()).toBe('2026-11-25T10:00:00.000Z')
  expect(NOTCHES[eightPm].time.toISOString()).toBe('2026-11-01T01:00:00.000Z')
})



// CALENDAR

test('a month of Moons for the calendar', () => {
  const moons = monthMoons(NIGHTS, 2026, 11)

  expect(moons).toHaveLength(30)
  expect(moons[18].day).toBe(19)
  expect(Math.round(moons[18].lit * 100)).toBe(77)
})

test('ruler labels', () => {
  expect(rulerLabel(NIGHTS[findNight(11, 19)], true, KC.timeZone)).toBe('Tonight')
  expect(rulerLabel(NIGHTS[findNight(11, 18)], false, KC.timeZone)).toBe('Wed')
  expect(rulerLabel(NIGHTS[findNight(12, 1)], false, KC.timeZone)).toBe('Dec 1')
})
