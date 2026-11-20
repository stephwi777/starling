import { expect, test } from 'vitest'
import * as Astronomy from 'astronomy-engine'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight } from './night.js'
import { fixedTracker, ofDate } from './fastSky.js'



// HELPERS

const night = buildNight(SAMPLE_PLACE, 0, new Date('2026-11-19T20:00:00Z'))
const SOUTH = { ...SAMPLE_PLACE, latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney' }

const OBJECTS = [
  { name: 'Sirius', ra: 6.7525, dec: -16.7161, mag: -1.46 },
  { name: 'Polaris', ra: 2.5302, dec: 89.2641, mag: 1.98 },
  { name: 'Acrux', ra: 12.4433, dec: -63.0991, mag: 0.76 },
  { name: 'Andromeda Galaxy', ra: 0.7123, dec: 41.2692, mag: 3.4 },
]

function exact(object, time, observer) {
  const rotation = Astronomy.Rotation_EQJ_EQD(time)
  const place = ofDate(object.ra, object.dec, rotation)
  const horizon = Astronomy.Horizon(time, observer, place.ra, place.dec, 'normal')

  return { alt: horizon.altitude, az: horizon.azimuth }
}

function gap(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180)
}



// TESTS

test('the fast track matches the full calculation all night', () => {
  for (const place of [SAMPLE_PLACE, SOUTH]) {
    const sky = buildNight(place, 0, new Date('2026-11-19T20:00:00Z'))
    const track = fixedTracker(sky, sky.observer)

    for (const object of OBJECTS) {
      track(object).track.forEach((point, i) => {
        const truth = exact(object, sky.times[i], sky.observer)

        expect(Math.abs(point.alt - truth.alt)).toBeLessThan(0.1)
        if (truth.alt > -5 && Math.abs(truth.alt) < 85) expect(gap(point.az, truth.az)).toBeLessThan(0.1)
      })
    }
  }
})

test('precession moves J2000 positions to the date', () => {
  const now = ofDate(OBJECTS[0].ra, OBJECTS[0].dec, Astronomy.Rotation_EQJ_EQD(night.midnight))

  expect(now.ra).toBeGreaterThan(OBJECTS[0].ra)
  expect(Math.abs(now.ra - OBJECTS[0].ra) * 15).toBeLessThan(0.5)
})

test('a fast track has everything the slow one does', () => {
  const tracked = fixedTracker(night, night.observer)(OBJECTS[0])

  expect(tracked).toMatchObject({ name: 'Sirius', visible: true })
  expect(tracked.track).toHaveLength(night.times.length)
  expect(tracked.cells).toHaveLength(night.hours)
})
