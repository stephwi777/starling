import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight, observerFor } from './night.js'
import { trackObject } from './tracks.js'
import { MOON, PLANETS } from './catalog/planets.js'
import { DEEP_SKY } from './catalog/deepSky.js'



// HELPERS

const night = buildNight(SAMPLE_PLACE, 0, new Date('2026-11-13T20:00:00Z'))
const observer = observerFor(SAMPLE_PLACE)

function planet(name) {
  return trackObject(PLANETS.find(item => item.name === name), night, observer)
}

function hourCst(date) {
  return (date.getUTCHours() + 18) % 24
}



// TESTS

test('Saturn is visible, best in the evening', () => {
  const saturn = planet('Saturn')
  expect(saturn.visible).toBe(true)
  expect(saturn.reason).toBe('')
  expect(hourCst(night.times[saturn.bestIndex])).toBeGreaterThanOrEqual(20)
  expect(hourCst(night.times[saturn.bestIndex])).toBeLessThan(22)
})

test('an object that never rises is below the horizon all night', () => {
  const omega = trackObject(DEEP_SKY.find(item => item.id === 'C80'), night, observer)
  expect(omega.visible).toBe(false)
  expect(omega.reason).toBe('below the horizon all night')
})

test('Mercury is too close to the Sun', () => {
  const mercury = planet('Mercury')
  expect(mercury.visible).toBe(false)
  expect(mercury.reason).toBe('too close to the Sun')
})

test('the Moon sets close to the Naval Observatory time', () => {
  const moon = trackObject(MOON, night, observer)
  const minutes = Math.abs(night.times[moon.set] - new Date('2026-11-14T02:17:00Z')) / 60000
  expect(minutes).toBeLessThanOrEqual(10)
})

test('there is one cell per hour, each level 0 to 3', () => {
  const saturn = planet('Saturn')
  expect(saturn.cells.length).toBe(night.hours)
  expect(saturn.cells.every(cell => cell.level >= 0 && cell.level <= 3)).toBe(true)
})

test('telescope objects need more height than naked-eye ones', () => {
  const dark = { ...night, times: night.times.slice(0, 2), sun: [-30, -30], hours: 1 }
  const low = { name: 'Low', kind: 'galaxy', ra: 0, dec: 0, mag: 9 }
  const fake = { ...observer }
  const track = [{ alt: 12, az: 90 }, { alt: 12, az: 90 }]
  expect(trackObject({ ...low, gear: 3 }, dark, fake, track).visible).toBe(false)
  expect(trackObject({ ...low, gear: 1 }, dark, fake, track).visible).toBe(true)
})
