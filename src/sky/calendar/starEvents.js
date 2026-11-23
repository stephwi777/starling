import * as Astronomy from 'astronomy-engine'
import { DEEP_SKY } from '../catalog/deepSky.js'
import { HINTS } from '../catalog/hints.js'
import { STARS } from '../catalog/stars.js'
import { localNoon, localParts } from '../night.js'
import { clock, where } from '../words.js'
import {
  DAY,
  HOUR,
  MINUTE,
  bodyRows,
  dayKey,
  degrees,
  horizon,
  minima,
  moonLit,
  nightKey,
  refine,
  separation,
  sunDistance,
  timeWord,
  viewed,
  windowWords,
} from './skyTools.js'



// SETTINGS

const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']

const MOON_LIMIT = 3
const PLANET_LIMIT = 2
const INSIDE = 1
const SUN_CLEAR = 15
const MOON_SUN_CLEAR = 12

const CORE_HIGH = 10
const CORE_DARK = -18
const CORE_STEP = 30 * MINUTE
const CORE_NEED = 30 * MINUTE
const FAR = 1000

const TARGETS = [
  { id: 'M45', short: 'Pleiades', label: 'the Pleiades', cluster: true, body: Astronomy.Body.Star1 },
  { id: 'M44', short: 'Beehive', label: 'the Beehive', cluster: true, body: Astronomy.Body.Star2 },
  { id: 'Aldebaran', short: 'Aldebaran', label: 'Aldebaran', body: Astronomy.Body.Star3 },
  { id: 'Regulus', short: 'Regulus', label: 'Regulus', body: Astronomy.Body.Star4 },
  { id: 'Spica', short: 'Spica', label: 'Spica', body: Astronomy.Body.Star5 },
  { id: 'Antares', short: 'Antares', label: 'Antares', body: Astronomy.Body.Star6 },
]

const CORE = { body: Astronomy.Body.Star7, ra: 17.7611, dec: -29.0078 }

const saved = new Map()



// SKY SETUP

TARGETS.forEach(target => {
  const { ra, dec } = [...STARS, ...DEEP_SKY].find(object => object.id === target.id)

  Astronomy.DefineStar(target.body, ra, dec, FAR)
})

Astronomy.DefineStar(CORE.body, CORE.ra, CORE.dec, FAR)



// HELPERS

function base(kinds, group, date, place, extra) {
  return {
    id: `${kinds[0]}-${date.getTime()}-${extra.short}`,
    kinds,
    group,
    date,
    day: dayKey(date, place.timeZone),
    time: clock(date, place.timeZone),
    here: true,
    where: null,
    rows: [],
    tags: [],
    ...extra,
  }
}

function passes(body, target, start, end, step, limit, clear) {
  const apart = date => separation(body, target.body, date)

  return minima(start.getTime(), end.getTime(), step, apart, limit)
    .map(rough => refine(rough, apart, step * 2, step / 6))
    .filter(({ date }) => sunDistance(body, date) > clear && separation('Sun', target.body, date) > clear)
}



// MOON NEAR A STAR

function moonNote(target, value, date) {
  const washed = target.cluster && Astronomy.Illumination('Moon', date).phase_fraction > 0.5

  return [
    `The Moon passes ${degrees(value)} from ${target.label}.`,
    HINTS[target.id],
    washed && 'The bright Moon can drown out the fainter stars, so try binoculars.',
  ].filter(Boolean).join(' ')
}

function moonStarEvents(start, end, place, observer) {
  return TARGETS.flatMap(target => passes('Moon', target, start, end, HOUR, MOON_LIMIT, MOON_SUN_CLEAR).map(({ date, value }) => {
    const view = viewed(['Moon', target.body], date, place, observer, 'Below your horizon after dark.')
    const rows = view.window ? bodyRows('Moon', view.window, observer, place.timeZone).filter(([label]) => label !== 'Brightness') : []

    return base(['moon-star'], 'moon', date, place, {
      icon: `sky:${target.id}`,
      subjects: [{ key: `moon-star:${target.id}`, label: `every time the Moon passes ${target.label}` }],
      short: `Moon near ${target.short}`,
      tiny: target.short,
      name: `Moon near ${target.label}`,
      note: moonNote(target, value, date),
      ...view,
      rows,
    })
  }))
}



// PLANET NEAR A STAR

function planetNote(planet, target, value) {
  if (target.cluster && value < INSIDE) return `${planet} sits among the stars of ${target.label}, ${degrees(value)} from its center. Binoculars show it best.`
  if (value < INSIDE) return `${planet} passes only ${degrees(value)} from ${target.label}. They fit together in binoculars.`

  return `${planet} passes ${degrees(value)} from ${target.label}, closer than a finger held at arm’s length. ${HINTS[target.id] ?? ''}`.trim()
}

function planetStarEvents(start, end, place, observer) {
  return PLANETS.flatMap(planet => TARGETS.flatMap(target => passes(planet, target, start, end, 6 * HOUR, PLANET_LIMIT, SUN_CLEAR).map(({ date, value }) => {
    const view = viewed([planet, target.body], date, place, observer, 'Below your horizon after dark.')
    const inside = target.cluster && value < INSIDE
    const words = `${planet} ${inside ? 'in' : 'near'}`

    return base(['planet-star'], 'planet', date, place, {
      icon: `planet:${planet}`,
      subjects: [{ key: `planet-star:${planet}+${target.id}`, label: `every time ${planet} passes ${target.label}` }],
      short: `${words} ${target.short}`,
      tiny: `${planet} & ${target.short}`,
      name: `${words} ${target.label}`,
      note: planetNote(planet, target, value),
      ...view,
      rows: view.window ? bodyRows(planet, view.window, observer, place.timeZone) : [],
    })
  })))
}



// MILKY WAY SEASON

function coreNight(year, month, day, place, observer) {
  const noon = localNoon(year, month, day, place.timeZone).getTime()
  const seen = []

  for (let time = noon + 4 * HOUR; time <= noon + 20 * HOUR; time += CORE_STEP) {
    const date = new Date(time)

    if (horizon('Sun', date, observer).alt < CORE_DARK && horizon(CORE.body, date, observer).alt >= CORE_HIGH) seen.push(date)
  }

  if (seen.length * CORE_STEP < CORE_NEED) return null

  return { from: seen[0], to: seen[seen.length - 1] }
}

function dayAfter(year, month, day, count, timeZone) {
  const { year: y, month: m, day: d } = localParts(new Date(localNoon(year, month, day, timeZone).getTime() + count * DAY), timeZone)

  return [y, m, d]
}

function firstSeen(year, place, observer, forward) {
  const weeks = Array.from({ length: 53 }, (_, i) => dayAfter(year, 1, 1, i * 7, place.timeZone)).filter(([y]) => y === year)
  const order = forward ? weeks : [...weeks].reverse()
  const found = order.findIndex(([y, m, d]) => coreNight(y, m, d, place, observer))

  if (found <= 0) return null

  const [y, m, d] = order[found - 1]
  const step = forward ? 1 : -1

  for (let count = step; Math.abs(count) <= 7; count += step) {
    const [ny, nm, nd] = dayAfter(y, m, d, count, place.timeZone)
    const night = coreNight(ny, nm, nd, place, observer)

    if (night) return night
  }

  return null
}

function seasonEvent(night, starts, place, observer) {
  const best = starts ? night.to : night.from
  const spot = horizon(CORE.body, best, observer)
  const time = timeWord(night, place.timeZone)

  return base(['milky-way'], 'sun', best, place, {
    icon: 'milky-way',
    subjects: [{ key: 'milky-way', label: 'every Milky Way season' }],
    short: starts ? 'Milky Way season begins' : 'Milky Way season ends',
    tiny: 'Milky Way',
    name: starts ? 'Milky Way season begins' : 'Milky Way season ends',
    note: starts
      ? 'The bright heart of the Milky Way is back, rising before dawn. Each week it shows up a little earlier in the night.'
      : 'Your last good look this year at the bright heart of the Milky Way, low in the sky after dark. It returns before dawn early next year.',
    day: time === 'Before dawn' ? dayKey(night.from, place.timeZone) : nightKey(night.from, place.timeZone),
    time,
    window: night,
    rows: [
      ['Best seen', windowWords(night, place.timeZone)],
      ['Look', `${where(spot.alt, spot.az)} around ${clock(best, place.timeZone)}`],
      ['In', 'Sagittarius'],
      ['Moon', moonLit(best)],
    ],
  })
}

function seasonOf(year, place, observer) {
  const key = `${place.latitude},${place.longitude},${place.timeZone}|${year}`

  if (!saved.has(key)) {
    const first = firstSeen(year, place, observer, true)
    const last = firstSeen(year, place, observer, false)

    saved.set(key, [first && seasonEvent(first, true, place, observer), last && seasonEvent(last, false, place, observer)].filter(Boolean))
  }

  return saved.get(key)
}

function milkyWayEvents(start, end, place, observer) {
  const years = new Set([localParts(start, place.timeZone).year, localParts(end, place.timeZone).year])

  return [...years].flatMap(year => seasonOf(year, place, observer)).filter(event => event.date >= start && event.date < end)
}



// STAR EVENTS

export function starEvents(start, end, place, observer) {
  return [
    ...moonStarEvents(start, end, place, observer),
    ...planetStarEvents(start, end, place, observer),
    ...milkyWayEvents(start, end, place, observer),
  ]
}
