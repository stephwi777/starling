import { STEP, buildNight } from './night.js'
import { clearWindows, windowEdges } from './best.js'
import { trulyDark } from './darkPanel.js'
import { wholeHours } from './hours.js'
import { nightWeather } from './weather.js'
import { clock, shortDay } from './words.js'



// SETTINGS

const HOUR = 60 * 60 * 1000
const PER_HOUR = HOUR / STEP
const COUNT = 7
const MARKS = [[6, '6pm'], [12, 'midnight'], [18, '6am']]
const MOONLIT_WORTH = 0.35

const WET = {
  rain: 'Rain likely',
  snow: 'Snow likely',
}



// ROW

function none(label, words) {
  return { kind: 'none', from: null, to: null, label, words }
}

export function nightRow(night, clouds, timeZone, fall = null) {
  if (night.sun.every(alt => alt > 0)) return none('No night', 'Sun up all night')
  if (!night.sun.some(alt => alt < -18)) return none('No full dark', 'Twilight all night')

  const windows = clearWindows(night, clouds).map(run => {
    const { from, to } = windowEdges(night, run)

    return { from, to }
  })

  if (!windows.length && !clouds) return none('Barely dark', 'Under an hour')

  if (!windows.length) {
    const known = clouds.filter(value => value !== null)
    const average = known.reduce((sum, value) => sum + value, 0) / (known.length || 1)

    const sky = average > 70 ? 'Cloudy all night' : 'Patchy all night'

    return { ...none(WET[fall] ?? sky, sky), fall }
  }

  const kind = clouds ? 'clear' : 'dark'
  const words = windows.map(({ from, to }) => `${clock(from, timeZone)}–${clock(to, timeZone)}`).join(' and ')

  return { kind, from: windows[0].from, to: windows.at(-1).to, label: null, words, windows }
}



// HOUR BLOCKS

const offsetOf = (night, time) => Math.round((time - night.noon) / HOUR)

export function blockRange(nights) {
  const first = Math.min(...nights.map(night => offsetOf(night, night.start)))
  const last = Math.max(...nights.map(night => offsetOf(night, night.end)))

  return { first, count: last - first }
}

function blockKind(night, clouds, windows, hour) {
  const sample = Math.min(hour * PER_HOUR + PER_HOUR / 2, night.times.length - 1)
  const middle = night.start.getTime() + hour * HOUR + HOUR / 2

  if (night.sun[sample] >= -18) return 'twilight'
  if (!clouds) return 'unknown'
  if (clouds[hour] === null || clouds[hour] === undefined || clouds[hour] >= 40) return 'cloudy'

  return windows.some(({ from, to }) => middle >= from.getTime() && middle < to.getTime()) ? 'dark' : 'moonlit'
}

export function nightBlocks(night, clouds, windows, { first, count }) {
  const shift = offsetOf(night, night.start) - first

  return Array.from({ length: count }, (_, block) => {
    const hour = block - shift

    return hour < 0 || hour >= night.hours ? 'twilight' : blockKind(night, clouds, windows, hour)
  })
}

function nightFall(night, falls) {
  const wet = wholeHours(night).map(({ hour }) => falls?.[hour]).filter(Boolean)

  if (wet.includes('snow')) return 'snow'

  return wet.length ? 'rain' : null
}

function darkWords(blocks) {
  const dark = blocks.filter(block => block === 'dark').length

  if (!dark) return 'The Moon is up the whole time.'

  return `About ${dark} ${dark === 1 ? 'hour' : 'hours'} clear and truly dark.`
}



// BEST NIGHT

export function bestIndex(rows) {
  const scores = rows.map(row => (row.kind === 'clear' ? row.blocks.reduce((sum, block) => sum + (block === 'dark' ? 1 : block === 'moonlit' ? MOONLIT_WORTH : 0), 0) : 0))
  const top = Math.max(...scores)

  return top > 0 ? scores.indexOf(top) : null
}



// SEVEN NIGHTS

export function sevenNights(place, raw, now) {
  const nights = Array.from({ length: COUNT }, (_, index) => buildNight(place, index, now))
  const range = blockRange(nights)

  const rows = nights.map((night, index) => {
    const weather = raw ? nightWeather(raw, night) : null
    const clouds = weather?.clouds ?? null
    const row = nightRow(night, clouds, place.timeZone, nightFall(night, weather?.falls))
    const blocks = row.label ? [] : nightBlocks(night, clouds, clouds ? trulyDark(night) : [], range)

    return {
      ...row,
      key: night.noon.getTime(),
      day: index === 0 ? 'Tonight' : shortDay(night.noon, place.timeZone),
      moonAngle: night.moonAngle,
      moonLit: night.moonLit,
      blocks,
      dark: row.kind === 'clear' ? darkWords(blocks) : null,
    }
  })

  const best = bestIndex(rows)

  return {
    nights: rows.map((row, index) => ({ ...row, best: index === best })),
    marks: MARKS.map(([hours, label]) => ({ label, at: (hours - range.first) / range.count })),
  }
}
