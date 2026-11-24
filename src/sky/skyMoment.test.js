import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight, observerFor } from './night.js'
import { skyConditions, skyMoment } from './skyMoment.js'



// HELPERS

const HOUR = 60 * 60 * 1000

const LONDON = { ...SAMPLE_PLACE, name: 'London', latitude: 51.5, longitude: -0.13, timeZone: 'Europe/London' }
const TROMSO = { ...SAMPLE_PLACE, name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' }

function conditionsAt(now, clouds = null, falls = null) {
  const night = buildNight(SAMPLE_PLACE, 0, now)

  return { night, conditions: skyConditions({ night, moment: now, observer: observerFor(SAMPLE_PLACE), clouds, falls }) }
}



// MOMENT

test('after dark the sky shows right now', () => {
  const now = new Date('2026-11-24T04:00:00Z')
  expect(skyMoment(buildNight(SAMPLE_PLACE, 0, now), now)).toEqual(now)
})

test('in the afternoon the sky shows the start of full darkness', () => {
  const now = new Date('2026-11-23T20:00:00Z')
  const night = buildNight(SAMPLE_PLACE, 0, now)
  expect(skyMoment(night, now)).toEqual(night.astroDusk)
})

test('just after sunset the sky shows the twilight now', () => {
  const now = new Date('2026-11-23T23:20:00Z')
  expect(skyMoment(buildNight(SAMPLE_PLACE, 0, now), now)).toEqual(now)
})

test('a night without full darkness shows its darkest moment before sunset', () => {
  const now = new Date('2026-06-21T12:00:00Z')
  const night = buildNight(LONDON, 0, now)
  const moment = skyMoment(night, now)
  expect(night.astroDusk).toBeNull()
  expect(night.sun[night.times.findIndex(time => time.getTime() === moment.getTime())]).toBe(Math.min(...night.sun))
})

test('midnight sun shows its darkest moment and polar night shows now', () => {
  const summer = new Date('2026-06-21T12:00:00Z')
  const winter = new Date('2026-12-21T12:00:00Z')
  expect(skyMoment(buildNight(TROMSO, 0, summer), summer)).not.toEqual(summer)
  expect(skyMoment(buildNight(TROMSO, 0, winter), winter)).toEqual(winter)
})



// CONDITIONS

test('conditions read the forecast hour that contains the moment', () => {
  const now = new Date('2026-11-24T04:30:00Z')
  const night = buildNight(SAMPLE_PLACE, 0, now)
  const hour = Math.floor((now - night.start) / HOUR)
  const clouds = Array.from({ length: night.hours }, () => 10)
  const falls = clouds.map(() => null)
  clouds[hour] = 88
  falls[hour] = 'snow'
  expect(conditionsAt(now, clouds, falls).conditions).toMatchObject({ cloudCover: 88, fall: 'snow', morning: false, twilightAllNight: false })
})

test('a missing forecast reads as no clouds and no rain', () => {
  expect(conditionsAt(new Date('2026-11-24T04:30:00Z')).conditions).toMatchObject({ cloudCover: null, fall: null })
})

test('the forecast hour is right across the fall-back clock change', () => {
  const now = new Date('2026-11-01T08:30:00Z')
  const night = buildNight(SAMPLE_PLACE, 0, now)
  const clouds = Array.from({ length: night.hours }, (_, h) => h)
  expect(conditionsAt(now, clouds).conditions.cloudCover).toBe(Math.floor((now - night.start) / HOUR))
})

test('the Moon is measured at the moment, not at midnight', () => {
  const { night, conditions } = conditionsAt(new Date('2026-11-24T01:00:00Z'))
  expect(conditions.moonLit).not.toBe(night.moonLit)
  expect(conditions.moonAlt).toBeGreaterThan(0)
  expect(conditions.morning).toBe(false)
})

test('the hours after midnight count as morning', () => {
  expect(conditionsAt(new Date('2026-11-24T11:30:00Z')).conditions.morning).toBe(true)
})
