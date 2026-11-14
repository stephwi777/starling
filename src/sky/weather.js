// REQUEST

const FIELDS = ['cloud_cover', 'temperature_2m', 'wind_speed_10m', 'relative_humidity_2m', 'visibility', 'wind_speed_250hPa']

export function weatherUrl(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    hourly: FIELDS.join(','),
    forecast_days: 8,
    timezone: place.timeZone,
  })

  if (place.country === 'US') {
    params.set('temperature_unit', 'fahrenheit')
    params.set('wind_speed_unit', 'mph')
  }

  return `https://api.open-meteo.com/v1/forecast?${params}`
}

export async function fetchWeather(place, signal, fetcher = fetch) {
  const response = await fetcher(weatherUrl(place), { signal })

  if (!response.ok) throw new Error(`Weather request failed with ${response.status}`)

  return response.json()
}



// LOCAL HOURS

function hourKey(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
  }).formatToParts(date)

  const value = type => parts.find(part => part.type === type).value

  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:00`
}

function average(values) {
  const known = values.filter(value => value !== null && value !== undefined)

  return known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : null
}



// WORDS

function windWords(speed, unit) {
  const kmh = unit === 'mp/h' ? speed * 1.609 : speed
  const word = kmh < 8 ? 'Calm' : kmh < 20 ? 'Light wind' : kmh < 32 ? 'Breezy' : 'Windy'

  return `${word}, ${Math.round(speed)} ${unit === 'mp/h' ? 'mph' : 'km/h'}`
}

function seeingScore(jet, unit) {
  const metres = unit === 'mp/h' ? jet / 2.237 : jet / 3.6

  if (metres < 20) return 4
  if (metres < 35) return 3
  if (metres < 50) return 2
  return 1
}

function transparencyScore(humidity, visibility, unit) {
  const metres = unit === 'ft' ? visibility * 0.3048 : visibility
  const score = humidity < 60 ? 4 : humidity < 80 ? 3 : 2

  return Math.max(1, metres < 10000 ? score - 1 : score)
}

export function skyWord(clouds) {
  const mean = average(clouds)

  if (mean === null) return null
  if (mean < 20) return 'Clear'
  if (mean < 60) return 'Patchy'
  return 'Cloudy'
}



// NIGHT WEATHER

export function nightWeather(raw, night, timeZone) {
  const { hourly, hourly_units: units } = raw
  const rows = Array.from({ length: night.hours }, (_, h) => hourly.time.indexOf(hourKey(new Date(night.start.getTime() + h * 3600000), timeZone)))

  if (rows.every(row => row === -1)) return null

  const pick = field => rows.map(row => (row === -1 ? null : hourly[field]?.[row] ?? null))
  const evening = rows.find((row, h) => h >= 4 && row !== -1) ?? rows.find(row => row !== -1)
  const clouds = pick('cloud_cover')
  const temp = hourly.temperature_2m?.[evening] ?? null
  const wind = hourly.wind_speed_10m?.[evening] ?? null
  const jet = average(pick('wind_speed_250hPa'))
  const humidity = average(pick('relative_humidity_2m'))
  const visibility = average(pick('visibility'))

  return {
    clouds: clouds.some(value => value !== null) ? clouds : null,
    temp: temp === null ? null : `${Math.round(temp)}${units.temperature_2m}`,
    wind: wind === null ? null : windWords(wind, units.wind_speed_10m),
    seeing: jet === null ? null : seeingScore(jet, units.wind_speed_10m),
    transparency: humidity === null ? null : transparencyScore(humidity, visibility ?? Infinity, units.visibility),
  }
}
