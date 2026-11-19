import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight } from './night.js'
import { fetchWeather, nightWeather, skyWord, weatherUrl } from './weather.js'



// HELPERS

const night = buildNight(SAMPLE_PLACE, 0, new Date('2026-11-13T20:00:00Z'))

function fakeForecast(overrides = {}) {
  const time = Array.from({ length: 48 }, (_, i) => `2026-11-${13 + Math.floor(i / 24)}T${String(i % 24).padStart(2, '0')}:00`)

  return {
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

test('night hours line up with the local forecast hours', () => {
  const weather = nightWeather(fakeForecast(), night, SAMPLE_PLACE.timeZone)
  expect(weather.clouds.length).toBe(night.hours)
  expect(weather.clouds[0]).toBe(17)
  expect(weather.clouds[7]).toBe(24)
})

test('missing hours become null, and no hours at all gives null', () => {
  const short = fakeForecast()
  short.hourly.time = short.hourly.time.slice(0, 20)
  expect(nightWeather(short, night, SAMPLE_PLACE.timeZone).clouds.slice(3, 5)).toEqual([null, null])

  const empty = fakeForecast()
  empty.hourly.time = []
  expect(nightWeather(empty, night, SAMPLE_PLACE.timeZone)).toBeNull()
})

test('jet stream speeds come hour by hour in metres per second', () => {
  const weather = nightWeather(fakeForecast(), night, SAMPLE_PLACE.timeZone)
  expect(weather.jets.length).toBe(night.hours)
  expect(weather.jets[0]).toBeCloseTo(8.94, 2)
})

test('temperature and wind are written plainly', () => {
  const weather = nightWeather(fakeForecast(), night, SAMPLE_PLACE.timeZone)
  expect(weather.temp).toBe('38°F')
  expect(weather.wind).toBe('Light wind, 6 mph')
})

test('seeing comes from jet stream wind and transparency from humidity', () => {
  expect(nightWeather(fakeForecast(), night, SAMPLE_PLACE.timeZone)).toMatchObject({ seeing: 4, transparency: 4 })

  const rough = fakeForecast({
    wind_speed_250hPa: Array(48).fill(100),
    relative_humidity_2m: Array(48).fill(90),
    visibility: Array(48).fill(5000),
  })
  expect(nightWeather(rough, night, SAMPLE_PLACE.timeZone)).toMatchObject({ seeing: 2, transparency: 1 })
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
  expect(nightWeather(gaps, night, SAMPLE_PLACE.timeZone)).toEqual({ clouds: null, jets: null, temp: null, wind: null, seeing: null, transparency: null })
})
