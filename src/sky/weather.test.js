import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight } from './night.js'
import { fallOf, fetchWeather, nightWeather, skyWord, weatherUrl } from './weather.js'



// HELPERS

const night = buildNight(SAMPLE_PLACE, 0, new Date('2026-11-13T20:00:00Z'))

function fakeForecast(overrides = {}) {
  const time = Array.from({ length: 48 }, (_, i) => `2026-11-${13 + Math.floor(i / 24)}T${String(i % 24).padStart(2, '0')}:00`)

  return {
    utc_offset_seconds: -21600,
    hourly_units: { temperature_2m: '°F', wind_speed_10m: 'mp/h', visibility: 'm' },
    hourly: {
      time,
      cloud_cover: time.map((_, i) => i),
      temperature_2m: time.map(() => 38.4),
      wind_speed_10m: time.map(() => 6),
      relative_humidity_2m: time.map(() => 50),
      visibility: time.map(() => 20000),
      wind_speed_250hPa: time.map(() => 20),
      ...overrides,
    },
  }
}



// TESTS

test('US places ask for fahrenheit and mph', () => {
  expect(weatherUrl(SAMPLE_PLACE)).toContain('temperature_unit=fahrenheit')
  expect(weatherUrl(SAMPLE_PLACE)).toContain('wind_speed_unit=mph')
  expect(weatherUrl(SAMPLE_PLACE)).toContain('timezone=America%2FChicago')

  const paris = { ...SAMPLE_PLACE, country: 'FR', timeZone: 'Europe/Paris' }
  expect(weatherUrl(paris)).not.toContain('fahrenheit')
  expect(weatherUrl(paris)).not.toContain('mph')
})

test('the request asks for cloud layers, dew point, rain and the night before', () => {
  const url = weatherUrl(SAMPLE_PLACE)

  for (const field of ['cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high', 'dew_point_2m', 'precipitation_probability']) {
    expect(url).toContain(field)
  }

  expect(url).toContain('past_days=2')
})

test('night hours line up with the local forecast hours', () => {
  const weather = nightWeather(fakeForecast(), night)
  expect(weather.clouds.length).toBe(night.hours)
  expect(weather.clouds[0]).toBe(17)
  expect(weather.clouds[7]).toBe(24)
})

test('the night the clocks fall back gets one forecast hour per night hour', () => {
  const fallBack = buildNight(SAMPLE_PLACE, 0, new Date('2026-10-31T20:00:00Z'))
  const time = Array.from({ length: 48 }, (_, i) => `2026-${i < 24 ? '10-31' : '11-01'}T${String(i % 24).padStart(2, '0')}:00`)
  const forecast = { utc_offset_seconds: -18000, hourly_units: {}, hourly: { time, cloud_cover: time.map((_, i) => i) } }
  const clouds = nightWeather(forecast, fallBack).clouds
  const known = clouds.filter(value => value !== null)

  expect(new Set(known).size).toBe(known.length)
  expect(known.every((value, i) => i === 0 || value === known[i - 1] + 1)).toBe(true)
})

test('missing hours become null, and no hours at all gives null', () => {
  const short = fakeForecast()
  short.hourly.time = short.hourly.time.slice(0, 20)
  expect(nightWeather(short, night).clouds.slice(3, 5)).toEqual([null, null])

  const empty = fakeForecast()
  empty.hourly.time = []
  expect(nightWeather(empty, night)).toBeNull()
})

test('upper air comes hour by hour in metres per second', () => {
  const weather = nightWeather(fakeForecast({
    wind_gusts_10m: Array(48).fill(20),
    wind_speed_850hPa: Array(48).fill(10),
    wind_speed_700hPa: Array(48).fill(10),
    wind_speed_500hPa: Array(48).fill(10),
    wind_direction_850hPa: Array(48).fill(0),
    wind_direction_700hPa: Array(48).fill(0),
    wind_direction_500hPa: Array(48).fill(180),
    wind_direction_250hPa: Array(48).fill(180),
  }), night)

  expect(weather.air.length).toBe(night.hours)
  expect(weather.air[0].jet).toBeCloseTo(8.94, 2)
  expect(weather.air[0].gust).toBeCloseTo(8.94, 2)
  expect(weather.air[0].wind).toBeCloseTo(2.68, 2)
  expect(weather.air[0].shear).toBeCloseTo(8.94, 2)
})

test('upper air without layer details leaves the churning unknown', () => {
  expect(nightWeather(fakeForecast(), night).air[0]).toMatchObject({ shear: null, gust: null })
})

test('temperature and wind are written plainly', () => {
  const weather = nightWeather(fakeForecast(), night)
  expect(weather.temp).toBe('38°F')
  expect(weather.wind).toBe('Light wind, 6 mph')
})

test('seeing comes from jet stream wind and transparency from humidity', () => {
  expect(nightWeather(fakeForecast(), night)).toMatchObject({ seeing: 4, transparency: 4 })

  const rough = fakeForecast({
    wind_speed_250hPa: Array(48).fill(100),
    relative_humidity_2m: Array(48).fill(90),
    visibility: Array(48).fill(5000),
  })
  expect(nightWeather(rough, night)).toMatchObject({ seeing: 2, transparency: 1 })
})

test('sky words for the night strip', () => {
  expect(skyWord([0, 10, 19])).toBe('Clear')
  expect(skyWord([20, 30, 40])).toBe('Patchy')
  expect(skyWord([60, 80, 100])).toBe('Cloudy')
  expect(skyWord([null, null])).toBeNull()
})

test('a failed response throws so the page can show the fallback', async () => {
  const fetcher = async () => ({ ok: false, status: 500 })
  await expect(fetchWeather(SAMPLE_PLACE, undefined, fetcher)).rejects.toThrow()
})

test('a forecast full of gaps gives no readings instead of made-up ones', () => {
  const gaps = fakeForecast({
    cloud_cover: Array(48).fill(null),
    temperature_2m: Array(48).fill(null),
    wind_speed_10m: Array(48).fill(null),
    relative_humidity_2m: Array(48).fill(null),
    visibility: Array(48).fill(null),
    wind_speed_250hPa: Array(48).fill(null),
  })
  expect(nightWeather(gaps, night)).toEqual({ clouds: null, air: null, temps: null, falls: null, temp: null, wind: null, seeing: null, transparency: null })
})



// RAIN, SNOW AND TEMPERATURE

test('an hour is wet from a 50% chance, snowy when snow falls or it freezes', () => {
  expect(fallOf(40, 0, 50, '°F')).toBeNull()
  expect(fallOf(null, 0, 50, '°F')).toBeNull()
  expect(fallOf(50, 0, 50, '°F')).toBe('rain')
  expect(fallOf(70, 0.4, 35, '°F')).toBe('snow')
  expect(fallOf(70, 0, 31, '°F')).toBe('snow')
  expect(fallOf(70, 0, 1, '°C')).toBe('rain')
  expect(fallOf(70, 0, -1, '°C')).toBe('snow')
})

test('night weather gives rounded hourly temperatures and wet hours', () => {
  const weather = nightWeather(fakeForecast({
    precipitation_probability: Array.from({ length: 48 }, (_, i) => (i === 23 ? 80 : 10)),
  }), night)
  const wet = weather.falls.flatMap((fall, h) => (fall ? [[h, fall]] : []))

  expect(weather.temps[0]).toBe(38)
  expect(wet).toEqual([[weather.falls.indexOf('rain'), 'rain']])
})

test('dry nights have no wet hours', () => {
  expect(nightWeather(fakeForecast(), night).falls).toBeNull()
})
