import { buildNight } from './night.js'
import { bestWindow, windowEdges } from './best.js'
import { nightWeather } from './weather.js'
import { clock, shortDay } from './words.js'



// SETTINGS

const HOUR = 60 * 60 * 1000
const SHORT = 3 * HOUR
const COUNT = 7



// ROW

function none(label, words) {
  return { kind: 'none', from: null, to: null, label, words }
}

export function nightRow(night, clouds, timeZone) {
  if (night.sun.every(alt => alt > 0)) return none('No night', 'Sun up all night')
  if (!night.sun.some(alt => alt < -18)) return none('No full dark', 'Twilight all night')

  const best = bestWindow(night, clouds)

  if (!best && !clouds) return none('Barely dark', 'Under an hour')

  if (!best) {
    const known = clouds.filter(value => value !== null)
    const average = known.reduce((sum, value) => sum + value, 0) / (known.length || 1)

    return none('No clear hours', average > 70 ? 'Cloudy all night' : 'Patchy all night')
  }

  const { from, to } = windowEdges(night, best)
  const kind = !clouds ? 'dark' : to - from < SHORT ? 'short' : 'clear'

  return { kind, from, to, label: null, words: `${clock(from, timeZone)}–${clock(to, timeZone)}` }
}



// SCALE

export function nightScale(nights) {
  const offset = (night, time) => time - night.noon
  const first = Math.min(...nights.map(night => offset(night, night.start)))
  const last = Math.max(...nights.map(night => offset(night, night.end)))

  return (night, time) => {
    const inside = Math.min(Math.max(time, night.start), night.end)

    return (offset(night, inside) - first) / (last - first)
  }
}



// SEVEN NIGHTS

export function sevenNights(place, raw, now) {
  const nights = Array.from({ length: COUNT }, (_, index) => buildNight(place, index, now))
  const scale = nightScale(nights)

  return nights.map((night, index) => {
    const clouds = raw ? nightWeather(raw, night)?.clouds ?? null : null
    const row = nightRow(night, clouds, place.timeZone)
    const left = row.from ? scale(night, row.from) : null

    return {
      ...row,
      key: night.noon.getTime(),
      day: index === 0 ? 'Tonight' : shortDay(night.noon, place.timeZone),
      moonAngle: night.moonAngle,
      moonLit: night.moonLit,
      left,
      width: row.to ? scale(night, row.to) - left : null,
    }
  })
}
