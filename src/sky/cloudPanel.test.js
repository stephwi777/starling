import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildNight } from './night.js'
import { barLayers, cloudHours, cloudSummary, dewWords, hazeWords, transparencyWords } from './cloudPanel.js'
import { panelNights, sameHour, startHour } from './panelNights.js'



// HELPERS

const NOW = new Date('2026-11-19T20:00:00Z')
const HOUR = 60 * 60 * 1000
const night = buildNight(SAMPLE_PLACE, 0, NOW)

function fakeRaw(field, value) {
  const time = Array.from({ length: 72 }, (_, i) => `2026-11-${19 + Math.floor(i / 24)}T${String(i % 24).padStart(2, '0')}:00`)

  return {
    utc_offset_seconds: -21600,
    hourly: { time, [field]: time.map((_, i) => value(i)) },
  }
}

function sky(cover, low, mid, high) {
  return { cover, low, mid, high }
}



// NIGHTS

test('the strip runs from the night before tonight to six nights ahead', () => {
  const { nights, tonight } = panelNights(SAMPLE_PLACE, NOW)

  expect(nights).toHaveLength(8)
  expect(tonight).toBe(1)
  expect(nights[1].noon).toEqual(night.noon)
  expect(nights[0].noon.getTime()).toBe(night.noon.getTime() - 24 * HOUR)
})



// HOURS

test('each hour from sunset to sunrise picks up its forecast values', () => {
  const raw = fakeRaw('cloud_cover_low', i => i)
  const hours = cloudHours(night, raw, null)

  expect(hours[0].time.getTime()).toBe(Date.UTC(2026, 10, 20, 0))
  expect(hours[0].low).toBe(18)
  expect(hours.at(-1).low).toBe(31)
  expect(hours[0].cover).toBeNull()
  expect(hours[0].aod).toBeNull()
})

test('hours with a likely chance of rain are marked wet', () => {
  const hours = cloudHours(night, fakeRaw('precipitation_probability', i => (i === 19 ? 70 : 10)), null)

  expect(hours.map(hour => hour.fall)).toEqual(hours.map((_, i) => (i === 1 ? 'rain' : null)))
})

test('haze values come from the air-quality forecast', () => {
  const air = fakeRaw('aerosol_optical_depth', () => 0.12)

  expect(cloudHours(night, null, air)[0].aod).toBe(0.12)
})

test('a night with no dark hours has no hours to show', () => {
  const noNight = { ...night, sun: night.sun.map(() => 5) }

  expect(cloudHours(noNight, null, null)).toEqual([])
})



// STARTING HOUR

test('tonight opens at the hour that contains now', () => {
  const hours = cloudHours(night, null, null)
  const now = new Date(hours[3].time.getTime() + 20 * 60 * 1000)

  expect(startHour(hours, now)).toBe(3)
})

test('before the night starts it opens on the first fully dark hour', () => {
  const hours = cloudHours(night, null, null)

  expect(startHour(hours, NOW)).toBe(hours.findIndex(hour => hour.dark))
})

test('changing night keeps the time of night and clamps to shorter nights', () => {
  const hours = cloudHours(night, null, null)
  const later = buildNight(SAMPLE_PLACE, 1, NOW)
  const laterHours = cloudHours(later, null, null)

  expect(sameHour(hours[4].time - night.noon, later, laterHours)).toBe(4)
  expect(sameHour(30 * HOUR, later, laterHours)).toBe(laterHours.length - 1)
})



// BARS

test('layer sizes share out the total cover', () => {
  const layers = barLayers(sky(100, 0, 100, 20))
  const total = layers.reduce((sum, layer) => sum + layer.size, 0)

  expect(layers.map(layer => layer.layer)).toEqual(['mid', 'high'])
  expect(total).toBeCloseTo(100)
})

test('cover without layer details still fills the bar', () => {
  expect(barLayers(sky(50, null, null, null))).toEqual([{ layer: 'low', size: 50 }])
  expect(barLayers(sky(null, 10, 10, 10))).toEqual([])
})



// SUMMARY

test('the summary names the sky and what it means', () => {
  expect(cloudSummary(sky(10, 5, 0, 5))).toEqual({ kind: 'Clear', line: 'A clear view of the stars.' })
  expect(cloudSummary(sky(40, 5, 5, 40))).toEqual({ kind: 'Mostly clear', line: 'Only thin high clouds: bright stars and planets still shine through.' })
  expect(cloudSummary(sky(90, 5, 5, 90))).toEqual({ kind: 'High clouds', line: 'Only thin high clouds: bright stars and planets still shine through.' })
  expect(cloudSummary(sky(40, 30, 0, 10))).toEqual({ kind: 'Patchy clouds', line: 'Clouds come and go; watch for gaps.' })
  expect(cloudSummary(sky(100, 0, 100, 20))).toEqual({ kind: 'Cloudy', line: 'A solid deck of clouds; little gets through.' })
  expect(cloudSummary(sky(70, 60, 0, 0))).toEqual({ kind: 'Cloudy', line: 'Low clouds block nearly everything.' })
  expect(cloudSummary(sky(null, null, null, null))).toBeNull()
})

test('unknown layers never claim thin high clouds', () => {
  expect(cloudSummary(sky(40, null, null, null)).kind).toBe('Patchy clouds')
})



// TRANSPARENCY

test('transparency counts haze, damp air and thin high cloud', () => {
  expect(transparencyWords({ cover: 85 })).toEqual({ value: 'Hidden', note: 'behind the clouds' })
  expect(transparencyWords({ cover: 10, aod: 0.05, humidity: 50, high: 0 }).value).toBe('Excellent')
  expect(transparencyWords({ cover: 10, aod: 0.25, humidity: 90, high: 70 }).value).toBe('Bad')
  expect(transparencyWords({ cover: 10, aod: null, humidity: 75, high: 0 }).value).toBe('Good')
  expect(transparencyWords({ cover: null }).value).toBe('—')
})



// DEW

test('dew risk comes from the gap to the dew point', () => {
  expect(dewWords({ temp: 40, dew: 37 }, '°F')).toEqual({ value: 'High', note: '3°F above the dew point' })
  expect(dewWords({ temp: 10, dew: 7 }, '°C').value).toBe('Some')
  expect(dewWords({ temp: 50, dew: 30 }, '°F').value).toBe('Low')
  expect(dewWords({ temp: 5, dew: 5 }, '°C').note).toBe('At the dew point')
  expect(dewWords({ temp: null, dew: 5 }, '°C')).toEqual({ value: '—', note: null })
})



// HAZE

test('haze words follow the optical depth and the request', () => {
  expect(hazeWords(0.05, 'ready')).toBe('Very little')
  expect(hazeWords(0.15, 'ready')).toBe('Light')
  expect(hazeWords(0.3, 'ready')).toBe('Noticeable')
  expect(hazeWords(0.5, 'ready')).toBe('Heavy')
  expect(hazeWords(null, 'ready')).toBe('Not forecast yet')
  expect(hazeWords(null, 'loading')).toBe('Loading')
  expect(hazeWords(null, 'failed')).toBe('Not available')
})
