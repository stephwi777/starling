import { STEP } from './night.js'
import { moonCrossings } from './moon.js'
import { meteorRate } from './meteors.js'
import { clock } from './words.js'



// SETTINGS

const HOUR = 60 * 60 * 1000
const PER_HOUR = HOUR / STEP
const GOOD_SHOWER = 8



// WORDS

const MOMENTS = {
  'sunset': 'Sunset',
  'fully-dark': 'Fully dark',
  'moonrise': 'Moonrise',
  'moonset': 'Moonset',
  'dawn': 'Twilight',
  'sunrise': 'Sunrise',
}

const SKIES = {
  twilight: 'Twilight',
  clear: 'Clear',
  patchy: 'Patchy',
  cloudy: 'Cloudy',
  dark: 'Dark',
}

const ALL_NIGHT = {
  clear: 'Clear all night.',
  patchy: 'Patchy clouds all night.',
  cloudy: 'Cloudy all night.',
}

const CHANGES = {
  'clear patchy': 'Patchy clouds roll in',
  'clear cloudy': 'Clouds roll in',
  'patchy clear': 'Clouds clear',
  'cloudy clear': 'Clouds clear',
  'patchy cloudy': 'Clouds thicken',
  'cloudy patchy': 'Clouds start to break',
}

const UNAVAILABLE = 'The forecast isn’t available right now, so clouds aren’t shown.'



// HELPERS

export function cloudKind(cover) {
  if (cover === null || cover === undefined) return null
  if (cover < 20) return 'clear'
  if (cover < 60) return 'patchy'
  return 'cloudy'
}

export function wholeHours(night) {
  const afterSunset = time => !night.sunset || time > night.sunset
  const beforeSunrise = time => !night.sunrise || time < night.sunrise

  return night.times.flatMap((time, i) => (
    i % PER_HOUR === 0 && afterSunset(time) && beforeSunrise(time) && night.sun[i] < 0
      ? [{ hour: i / PER_HOUR, time, dark: night.sun[i] < -18 }]
      : []
  ))
}

function whileDark(time, night) {
  const end = night.astroDawn ?? night.sunrise

  return time && (!end || time < end) ? time : null
}

function showerName(shower) {
  return `${shower.name.replace(/s$/, '')} meteors`
}



// HOURLY ROW

export function hourCells({ night, moon, clouds, timeZone }) {
  if (!wholeHours(night).length) return []

  const { rise, set } = moonCrossings(moon, night)

  const hours = wholeHours(night).map(({ hour, time, dark }) => {
    const kind = dark ? cloudKind(clouds?.[hour]) ?? 'dark' : 'twilight'

    return { time, label: clock(time, timeZone), kind, word: SKIES[kind], moment: false }
  })

  const moments = [
    ['sunset', night.sunset],
    ['fully-dark', night.astroDusk],
    ['moonrise', rise],
    ['moonset', set],
    ['dawn', night.astroDawn],
    ['sunrise', night.sunrise],
  ]
    .filter(([, time]) => time)
    .map(([kind, time]) => ({ time, label: clock(time, timeZone), kind, word: MOMENTS[kind], moment: true }))

  return [...moments, ...hours].sort((a, b) => a.time - b.time)
}



// SUMMARY

function cloudSentence({ night, clouds, status, timeZone }) {
  if (!clouds) return status === 'loading' ? 'Checking the forecast…' : UNAVAILABLE

  const hours = wholeHours(night)
  const pool = hours.some(hour => hour.dark) ? hours.filter(hour => hour.dark) : hours
  const known = pool
    .map(hour => ({ time: hour.time, kind: cloudKind(clouds[hour.hour]) }))
    .filter(hour => hour.kind)

  if (!known.length) return UNAVAILABLE

  const start = known[0].kind
  const change = known.find(hour => hour.kind !== start)

  if (!change) return ALL_NIGHT[start]

  return `${CHANGES[`${start} ${change.kind}`]} around ${clock(change.time, timeZone)}.`
}

function extraSentence({ night, moon, showers, timeZone }) {
  const crossings = moonCrossings(moon, night)
  const rise = whileDark(crossings.rise, night)
  const set = whileDark(crossings.set, night)

  const shower = showers
    .map(item => ({ item, rate: Math.max(...item.track.map(point => meteorRate(item, point.alt))) }))
    .filter(entry => entry.rate >= GOOD_SHOWER)
    .sort((a, b) => b.rate - a.rate)[0]

  if (shower && set) return `${showerName(shower.item)} are best after the Moon sets at ${clock(set, timeZone)}.`
  if (shower) return `${showerName(shower.item)} are best after midnight.`
  if (set) return `The Moon sets at ${clock(set, timeZone)}, leaving darker skies.`
  if (rise) return `The Moon rises at ${clock(rise, timeZone)}.`

  return null
}

export function hoursSummary(options) {
  if (!wholeHours(options.night).length) return 'The Sun doesn’t set tonight.'

  return [cloudSentence(options), extraSentence(options)].filter(Boolean).join(' ')
}
