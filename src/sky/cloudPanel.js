import { wholeHours } from './hours.js'
import { fallOf, moments } from './weather.js'



// HOURS

function reader(raw) {
  if (!raw) return () => null

  const rows = new Map(moments(raw).map((moment, row) => [moment, row]))

  return (field, time) => {
    const row = rows.get(time.getTime())

    return row === undefined ? null : raw.hourly[field]?.[row] ?? null
  }
}

export function cloudHours(night, raw, air) {
  const weather = reader(raw)
  const haze = reader(air)

  const unit = raw?.hourly_units?.temperature_2m

  return wholeHours(night).map(({ time, dark }) => {
    const temp = weather('temperature_2m', time)
    const rain = weather('precipitation_probability', time)

    return {
      time,
      dark,
      cover: weather('cloud_cover', time),
      low: weather('cloud_cover_low', time),
      mid: weather('cloud_cover_mid', time),
      high: weather('cloud_cover_high', time),
      temp,
      dew: weather('dew_point_2m', time),
      rain,
      fall: fallOf(rain, weather('snowfall', time), temp, unit),
      humidity: weather('relative_humidity_2m', time),
      aod: haze('aerosol_optical_depth', time),
    }
  })
}



// BARS

export function barLayers(hour) {
  if (hour.cover === null) return []

  const parts = [['low', hour.low], ['mid', hour.mid], ['high', hour.high]]
  const sum = parts.reduce((total, [, value]) => total + (value ?? 0), 0)

  if (!sum) return hour.cover ? [{ layer: 'low', size: hour.cover }] : []

  return parts
    .filter(([, value]) => value > 0)
    .map(([layer, value]) => ({ layer, size: (value * hour.cover) / sum }))
}



// SUMMARY

export function cloudSummary({ cover, low, mid, high }) {
  if (cover === null) return null

  const known = low !== null && mid !== null && high !== null
  const thin = known && low + mid < 20

  const kind = cover < 20 ? 'Clear' : thin ? (cover < 60 ? 'Mostly clear' : 'High clouds') : cover < 60 ? 'Patchy clouds' : 'Cloudy'

  const line = cover < 20 ? 'A clear view of the stars.'
    : thin ? 'Only thin high clouds: bright stars and planets still shine through.'
    : low >= 50 ? 'Low clouds block nearly everything.'
    : cover >= 90 ? 'A solid deck of clouds; little gets through.'
    : 'Clouds come and go; watch for gaps.'

  return { kind, line }
}



// TRANSPARENCY

const LEVELS = ['Bad', 'Poor', 'Average', 'Good', 'Excellent']

function loss(value, steps) {
  return value === null || value === undefined ? 0 : steps.filter(step => value > step).length
}

export function transparencyWords({ cover, aod, humidity, high }) {
  if (cover === null) return { value: '—', note: null }
  if (cover >= 80) return { value: 'Hidden', note: 'behind the clouds' }

  const score = 5 - loss(aod, [0.1, 0.2, 0.3]) - loss(humidity, [70, 85]) - loss(high, [30, 60])

  return { value: LEVELS[Math.max(1, score) - 1], note: 'how clear the air is' }
}



// DEW

export function dewWords({ temp, dew }, unit) {
  if (temp === null || dew === null) return { value: '—', note: null }

  const gap = temp - dew
  const celsius = unit === '°F' ? (gap * 5) / 9 : gap
  const shown = Math.round(gap)

  return {
    value: celsius < 2.2 ? 'High' : celsius < 4.5 ? 'Some' : 'Low',
    note: shown <= 0 ? 'At the dew point' : `${shown}${unit} above the dew point`,
  }
}



// HAZE

export function hazeWords(aod, status) {
  if (status === 'loading') return 'Loading'
  if (status === 'failed') return 'Not available'
  if (aod === null) return 'Not forecast yet'
  if (aod < 0.1) return 'Very little'
  if (aod < 0.2) return 'Light'
  if (aod < 0.35) return 'Noticeable'
  return 'Heavy'
}
