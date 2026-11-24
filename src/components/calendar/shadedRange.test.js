import { expect, test } from 'vitest'
import { shadedRange } from './shadedRange.js'



// EVENTS

const ETA = { id: 'eta', group: 'meteor', day: '2027-05-05', range: { from: '2027-04-19', to: '2027-05-28' } }
const MOON = { id: 'moon', group: 'moon', day: '2027-05-05' }
const COMET = { id: 'comet', group: 'comet', day: '2027-05-05', range: { from: '2027-05-01', to: '2027-05-20' } }

const shaded = event => ({ ...event.range, day: event.day, group: event.group })



// TESTS

test('an open card shades its range', () => {
  expect(shadedRange({ picked: COMET, dayEvents: [], narrow: false })).toEqual(shaded(COMET))
})

test('on a phone, the chosen day shades the range of its first event that has one', () => {
  expect(shadedRange({ picked: null, dayEvents: [MOON, ETA, COMET], narrow: true })).toEqual(shaded(ETA))
})

test('on a phone, an open card wins over the chosen day', () => {
  expect(shadedRange({ picked: COMET, dayEvents: [ETA], narrow: true })).toEqual(shaded(COMET))
})

test('a big calendar does not shade from the chosen day', () => {
  expect(shadedRange({ picked: null, dayEvents: [ETA], narrow: false })).toBeNull()
})

test('a day without ranged events shades nothing', () => {
  expect(shadedRange({ picked: MOON, dayEvents: [MOON], narrow: true })).toBeNull()
})
