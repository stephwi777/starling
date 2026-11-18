import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { daytimeLine, skyNow } from './skyNow.js'



// HELPERS

function fakeForecast(cover) {
  return { hourly: { time: ['2026-11-13T11:00', '2026-11-13T12:00'], cloud_cover: [5, cover] } }
}



// TESTS

test('noon in Kansas City has the Sun well up', () => {
  expect(skyNow(SAMPLE_PLACE, new Date('2026-11-13T18:00:00Z'), null).sunAlt).toBeGreaterThan(20)
})

test('2am in Kansas City is fully dark', () => {
  expect(skyNow(SAMPLE_PLACE, new Date('2026-11-14T08:00:00Z'), null).sunAlt).toBeLessThan(-18)
})

test('cloud cover comes from the matching local forecast hour', () => {
  expect(skyNow(SAMPLE_PLACE, new Date('2026-11-13T18:20:00Z'), fakeForecast(77)).cloudCover).toBe(77)
  expect(skyNow(SAMPLE_PLACE, new Date('2026-11-13T18:20:00Z'), null).cloudCover).toBeNull()
})

test('the Moon reports its phase and brightness', () => {
  const sky = skyNow(SAMPLE_PLACE, new Date('2026-11-14T02:00:00Z'), null)
  expect(sky.moonLit).toBeGreaterThan(0.1)
  expect(sky.moonLit).toBeLessThan(0.3)
  expect(sky.moonAngle).toBeLessThan(90)
})

test('the daytime line points to tonight', () => {
  const sunset = new Date('2026-11-13T23:04:00Z')
  expect(daytimeLine(sunset, 'Clear', 'America/Chicago')).toBe('The Sun sets at 5:04pm. Tonight looks clear!')
  expect(daytimeLine(sunset, 'Patchy', 'America/Chicago')).toBe('The Sun sets at 5:04pm. Tonight looks patchy.')
  expect(daytimeLine(sunset, 'Cloudy', 'America/Chicago')).toBe('The Sun sets at 5:04pm. Tonight looks cloudy.')
  expect(daytimeLine(sunset, null, 'America/Chicago')).toBe('The Sun sets at 5:04pm. Check back after dark!')
})
