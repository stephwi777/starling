import * as Astronomy from 'astronomy-engine'
import { darkSpan } from './darkness.js'
import { riseAndSet } from './moonFacts.js'
import { clock } from './words.js'



// SETTINGS

const STEP = 10 * 60 * 1000
const MINUTE = 60 * 1000
const DAY = 24 * 60 * 60 * 1000

export const STEP_COUNT = 145



// ALTITUDE

function altitude(body, date, observer) {
  const equator = Astronomy.Equator(body, date, observer, true, true)

  return Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal').altitude
}



// SKY PATH

export function skyPath(observer, noon) {
  const times = Array.from({ length: STEP_COUNT }, (_, i) => new Date(noon.getTime() + i * STEP))

  return {
    times,
    sun: times.map(time => altitude('Sun', time, observer)),
    moon: times.map(time => altitude('Moon', time, observer)),
  }
}



// TRULY DARK

function moonEvents(observer, from, to) {
  const events = []

  for (const direction of [1, -1]) {
    let start = from

    while (start < to) {
      const found = Astronomy.SearchRiseSet('Moon', observer, direction, start, (to - start) / DAY)

      if (!found || found.date >= to) break

      events.push(found.date)
      start = new Date(found.date.getTime() + MINUTE)
    }
  }

  return events.sort((a, b) => a - b)
}

export function trulyDark(night) {
  const span = darkSpan(night)

  if (!span) return []

  const edges = [span.from, ...moonEvents(night.observer, span.from, span.to), span.to]
  const windows = []

  for (let i = 0; i < edges.length - 1; i++) {
    const from = edges[i]
    const to = edges[i + 1]
    const middle = new Date((from.getTime() + to.getTime()) / 2)

    if (to - from < MINUTE || altitude('Moon', middle, night.observer) >= 0) continue

    const last = windows.at(-1)

    if (last && last.to.getTime() === from.getTime()) last.to = to
    else windows.push({ from, to })
  }

  return windows
}



// WORDS

export function hoursWords(ms) {
  const minutes = Math.round(ms / MINUTE)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (!hours) return `${rest} min`

  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}

function ranges(windows, timeZone) {
  return windows.map(({ from, to }) => `${clock(from, timeZone)}–${clock(to, timeZone)}`).join(' and ')
}

function total(windows) {
  return windows.reduce((sum, { from, to }) => sum + (to - from), 0)
}

function same(a, b) {
  return Math.abs(a - b) < MINUTE
}



// MOON LINE

export function moonLine(night, windows, timeZone) {
  const span = darkSpan(night)

  if (!span) return null
  if (!windows.length) return 'The Moon is up all night.'

  if (windows.length === 1) {
    const { from, to } = windows[0]
    const atDusk = same(from, span.from)
    const atDawn = same(to, span.to)

    if (atDusk && atDawn) return 'No Moon during the dark hours.'
    if (atDawn) return `Moon sets at ${clock(from, timeZone)}; truly dark after.`
    if (atDusk) return `Moon rises at ${clock(to, timeZone)}; truly dark until then.`
  }

  return `Truly dark ${ranges(windows, timeZone)}.`
}



// VERDICT

export function darkVerdict(night, windows, timeZone) {
  if (night.sun.every(alt => alt > 0)) return { value: 'No night', line: 'The Sun doesn’t set this night.' }
  if (!darkSpan(night)) return { value: 'No full dark', line: 'Twilight lasts all night.' }
  if (!windows.length) return { value: 'No truly dark hours', line: `The ${Math.round(night.moonLit * 100)}% lit Moon is up all night.` }

  return { value: hoursWords(total(windows)), line: `truly dark, ${ranges(windows, timeZone)}` }
}



// MOMENTS

export function sampleKind(sun, moon) {
  if (sun > 0) return 'day'
  if (sun > -18) return 'twilight'

  return moon > 0 ? 'moonlit' : 'dark'
}

function stage(sun, moon) {
  const kind = sampleKind(sun, moon)

  if (kind === 'day') return 'Daylight'
  if (kind === 'moonlit') return 'Fully dark, Moon up'
  if (kind === 'dark') return 'Truly dark'
  if (sun > -6) return 'Civil twilight'
  if (sun > -12) return 'Nautical twilight'

  return 'Astronomical twilight'
}

export function atWords(time, sun, moon, timeZone) {
  const where = sun > 0 ? `Sun ${Math.round(sun)}° up` : `Sun ${Math.round(-sun)}° down`

  return `${clock(time, timeZone)} · ${stage(sun, moon)} · ${where}`
}



// MOON TIMES

export function moonTimes(place, noon, timeZone) {
  const { rise, set } = riseAndSet(place, noon)
  const events = [rise && { time: rise, word: 'rises' }, set && { time: set, word: 'sets' }].filter(Boolean)

  if (!events.length) return 'no rise or set'

  return events
    .sort((a, b) => a.time - b.time)
    .map(({ time, word }) => `${word} ${clock(time, timeZone)}`)
    .join(' · ')
}
