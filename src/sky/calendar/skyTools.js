import * as Astronomy from 'astronomy-engine'
import { localNoon, localParts } from '../night.js'
import { clock, height, wideCompass } from '../words.js'



// SETTINGS

export const MINUTE = 60 * 1000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

const SCAN = 10 * MINUTE
const DARK_SUN = -6
const LOW = 5
const ALL_NIGHT = 8 * HOUR



// DAYS

const pad = number => String(number).padStart(2, '0')

export function dayKey(date, timeZone) {
  const { year, month, day } = localParts(date, timeZone)

  return `${year}-${pad(month)}-${pad(day)}`
}

export function nightKey(date, timeZone) {
  return dayKey(new Date(date.getTime() - 12 * HOUR), timeZone)
}

function shortDay(key) {
  const [year, month, day] = key.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(Date.UTC(year, month - 1, day, 12))
}

export function dayRange({ from, to }) {
  const [fromMonth, fromDay] = shortDay(from).split(' ')
  const [toMonth, toDay] = shortDay(to).split(' ')

  return fromMonth === toMonth ? `${fromMonth} ${fromDay}–${toDay}` : `${fromMonth} ${fromDay}–${toMonth} ${toDay}`
}

export function monthKey(year, month) {
  return `${year}-${pad(month)}`
}

export function monthBounds(year, month, timeZone) {
  const next = month === 12 ? [year + 1, 1] : [year, month + 1]

  return {
    start: new Date(localNoon(year, month, 1, timeZone).getTime() - 12 * HOUR),
    end: new Date(localNoon(next[0], next[1], 1, timeZone).getTime() - 12 * HOUR),
  }
}



// POSITIONS

export function horizon(body, date, observer) {
  const equator = Astronomy.Equator(body, date, observer, true, true)
  const spot = Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal')

  return { alt: spot.altitude, az: spot.azimuth, ra: equator.ra, dec: equator.dec }
}

export function separation(a, b, date) {
  return Astronomy.AngleBetween(Astronomy.GeoVector(a, date, true), Astronomy.GeoVector(b, date, true))
}

export function sunDistance(body, date) {
  return Astronomy.AngleFromSun(body, date)
}



// VIEWING WINDOW

function isViewable(bodies, date, observer) {
  return horizon('Sun', date, observer).alt < DARK_SUN && bodies.every(body => horizon(body, date, observer).alt >= LOW)
}

export function viewWindow(bodies, around, observer, span = 14 * HOUR) {
  const runs = []
  let run = null

  for (let time = around.getTime() - span; time <= around.getTime() + span; time += SCAN) {
    const good = isViewable(bodies, new Date(time), observer)

    if (good && !run) run = { from: time, to: time }
    if (good) run.to = time
    if (!good && run) {
      runs.push(run)
      run = null
    }
  }

  if (run) runs.push(run)
  if (!runs.length) return null

  const target = around.getTime()
  const gap = ({ from, to }) => (target < from ? from - target : target > to ? target - to : 0)
  const chosen = runs.reduce((best, next) => (gap(next) < gap(best) ? next : best))

  return { from: new Date(chosen.from), to: new Date(chosen.to) }
}

export function bestMoment(bodies, window, observer) {
  let best = window.from
  let top = -90

  for (let time = window.from.getTime(); time <= window.to.getTime(); time += SCAN) {
    const lowest = Math.min(...bodies.map(body => horizon(body, new Date(time), observer).alt))

    if (lowest > top) {
      top = lowest
      best = new Date(time)
    }
  }

  return best
}



// CLOSEST APPROACH

export function minima(from, to, step, value, limit) {
  const found = []
  let before = value(new Date(from - step))
  let now = value(new Date(from))

  for (let time = from; time < to; time += step) {
    const after = value(new Date(time + step))

    if (now < limit && now <= before && now < after) found.push(new Date(time))
    before = now
    now = after
  }

  return found
}

export function refine(around, value, span = 3 * HOUR, step = 10 * MINUTE) {
  let best = around
  let low = value(around)

  for (let time = around.getTime() - span; time <= around.getTime() + span; time += step) {
    const next = value(new Date(time))

    if (next < low) {
      low = next
      best = new Date(time)
    }
  }

  return { date: best, value: low }
}

export function degrees(value) {
  return `${Number(value.toFixed(1))}°`
}



// TIME WORDS

export function timeWord(window, timeZone) {
  const fromHour = localParts(window.from, timeZone).hour
  const toHour = localParts(window.to, timeZone).hour

  if (window.to - window.from >= ALL_NIGHT) return 'All night'
  if (fromHour < 12) return 'Before dawn'
  if (toHour >= 12) return 'Evening'

  return 'Late night'
}

export function windowWords(window, timeZone) {
  if (window.to - window.from < 30 * MINUTE) return `Around ${clock(window.from, timeZone)}`

  return `${clock(window.from, timeZone)}–${clock(window.to, timeZone)}`
}



// VIEWED FROM HERE

export function viewed(bodies, around, place, observer, why) {
  const window = viewWindow(bodies, around, observer)

  if (!window) return { here: false, where: why, rows: [] }

  const time = timeWord(window, place.timeZone)

  return {
    here: true,
    where: null,
    day: time === 'Before dawn' ? dayKey(window.from, place.timeZone) : nightKey(window.from, place.timeZone),
    time,
    window,
  }
}



// FACTS

export function brightness(mag) {
  if (mag <= -3) return 'Brightest after the Moon'
  if (mag <= -1.5) return 'Brighter than any star'
  if (mag <= 0.5) return 'Very bright'
  if (mag <= 2.5) return 'Easy to see by eye'
  if (mag <= 6) return 'Faint; find a dark place'
  if (mag <= 8) return 'Needs binoculars'

  return 'Needs a telescope'
}

const SPELLINGS = { Bootes: 'Boötes' }

export function spelled(name) {
  return SPELLINGS[name] ?? name
}

export function constellation(body, date, observer) {
  const { ra, dec } = horizon(body, date, observer)

  return spelled(Astronomy.Constellation(ra, dec).name)
}

export function moonLit(date) {
  return `${Math.round(Astronomy.Illumination('Moon', date).phase_fraction * 100)}% lit`
}

export function skyWords({ alt, az }) {
  if (alt >= 75) return 'nearly overhead'

  const word = alt < 10 ? 'very low' : alt >= 25 && alt < 55 ? 'midway up' : height(alt)

  return `${word} ${wideCompass(az)}`
}

export function look(spot) {
  const words = skyWords(spot)

  return `${words[0].toUpperCase()}${words.slice(1)}`
}

export function bodyRows(body, window, observer, timeZone) {
  const best = bestMoment([body], window, observer)
  const spot = horizon(body, best, observer)

  return [
    ['Best seen', windowWords(window, timeZone)],
    ['Look', look(spot)],
    ['Brightness', brightness(Astronomy.Illumination(body, best).mag)],
    ['In', constellation(body, best, observer)],
    ['Moon', moonLit(best)],
  ]
}



// REGIONS

const REGIONS = [
  ['Antarctica', lat => lat < -62],
  ['the Arctic', lat => lat > 72],
  ['Central America', (lat, lon) => lat >= 7 && lat < 22 && lon >= -95 && lon < -60],
  ['the Middle East', (lat, lon) => lat >= 12 && lat < 42 && lon >= 35 && lon < 63],
  ['North America', (lat, lon) => lat >= 15 && lon >= -170 && lon < -52],
  ['South America', (lat, lon) => lat < 13 && lat >= -56 && lon >= -82 && lon < -34],
  ['Europe', (lat, lon) => lat >= 36 && lon >= -25 && lon < 45],
  ['Africa', (lat, lon) => lat < 37 && lat >= -35 && lon >= -18 && lon < 52],
  ['Asia', (lat, lon) => lat >= 0 && lon >= 45],
  ['Southeast Asia', (lat, lon) => lat >= -11 && lat < 0 && lon >= 95 && lon < 141],
  ['Australia', (lat, lon) => lat >= -45 && lat < -10 && lon >= 112 && lon < 155],
]

function ocean(lat, lon) {
  const side = lat >= 0 ? 'North' : 'South'

  if (lon >= -70 && lon < 20) return `the ${side} Atlantic`
  if (lon >= 20 && lon < 120 && lat < 10) return 'the Indian Ocean'

  return `the ${side} Pacific`
}

export function regionOf(lat, lon) {
  const wrapped = ((lon + 540) % 360) - 180
  const found = REGIONS.find(([, inside]) => inside(lat, wrapped))

  return found ? found[0] : ocean(lat, wrapped)
}

export function underBody(body, date) {
  const equator = Astronomy.Equator(body, date, new Astronomy.Observer(0, 0, 0), true, true)
  const lon = (equator.ra - Astronomy.SiderealTime(date)) * 15

  return { lat: equator.dec, lon: ((lon + 540) % 360) - 180 }
}
