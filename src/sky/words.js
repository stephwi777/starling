// TIMES

const formats = new Map()

function format(timeZone, options) {
  const key = `${timeZone}${JSON.stringify(options)}`

  if (!formats.has(key)) {
    formats.set(key, new Intl.DateTimeFormat('en-US', { timeZone, ...options }))
  }

  return formats.get(key)
}

function tidy(text) {
  return text.replace(':00', '').replace(' PM', 'pm').replace(' AM', 'am')
}

export function clock(date, timeZone) {
  return tidy(format(timeZone, { hour: 'numeric', minute: '2-digit' }).format(date))
}

export function hourLabel(date, timeZone) {
  return tidy(format(timeZone, { hour: 'numeric' }).format(date))
}



// DIRECTIONS

const POINTS = ['north', 'north-northeast', 'northeast', 'east-northeast', 'east', 'east-southeast', 'southeast', 'south-southeast', 'south', 'south-southwest', 'southwest', 'west-southwest', 'west', 'west-northwest', 'northwest', 'north-northwest']
const SHORT_POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

function point(az) {
  return Math.round(az / 22.5) % 16
}

export function compass(az) {
  return POINTS[point(az)]
}

export function shortCompass(az) {
  return SHORT_POINTS[point(az)]
}



// HEIGHTS

export function height(alt) {
  if (alt < 10) return 'on the horizon'
  if (alt < 25) return 'low'
  if (alt < 55) return 'halfway up'
  if (alt < 75) return 'high'
  return 'nearly overhead'
}

export function fists(alt) {
  const count = Math.max(1, Math.round(alt / 10))

  return count === 1 ? '1 fist up' : `${count} fists up`
}

export function where(alt, az) {
  if (alt >= 75) return 'Nearly overhead'

  const word = height(alt)

  return `${word[0].toUpperCase()}${word.slice(1)} in the ${compass(az)}`
}
