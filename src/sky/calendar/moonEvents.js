import * as Astronomy from 'astronomy-engine'
import { distanceWords } from '../moonFacts.js'
import { localParts } from '../night.js'
import { clock } from '../words.js'
import { DAY, dayKey } from './skyTools.js'



// SETTINGS

const SUPER_KM = 361900
const MICRO_KM = 405000
const HARVEST_REACH = 20 * DAY

const NAMES = ['Wolf', 'Snow', 'Worm', 'Pink', 'Flower', 'Strawberry', 'Buck', 'Sturgeon', 'Corn', 'Hunter’s', 'Beaver', 'Cold']



// HELPERS

function moonKm(date) {
  return Astronomy.GeoMoon(date).Length() * Astronomy.KM_PER_AU
}

function sameMonth(a, b, timeZone) {
  const one = localParts(a, timeZone)
  const two = localParts(b, timeZone)

  return one.year === two.year && one.month === two.month
}

function moonrise(date, observer) {
  const rise = Astronomy.SearchRiseSet('Moon', observer, 1, new Date(date.getTime() - DAY / 2), 1)

  return rise?.date ?? null
}

function base(kinds, date, place, extra) {
  return {
    id: `${kinds[0]}-${date.getTime()}`,
    kinds,
    group: 'moon',
    date,
    day: dayKey(date, place.timeZone),
    time: clock(date, place.timeZone),
    here: true,
    where: null,
    tags: [],
    ...extra,
  }
}



// FULL MOON NAME

function harvestFull(year) {
  const equinox = Astronomy.Seasons(year).sep_equinox.date
  const before = Astronomy.SearchMoonPhase(180, new Date(equinox.getTime() - HARVEST_REACH), 40)

  return [before.date, Astronomy.SearchMoonPhase(180, new Date(before.date.getTime() + DAY), 40).date]
    .reduce((best, next) => (Math.abs(next - equinox) < Math.abs(best - equinox) ? next : best))
}

export function fullMoonName(date, place) {
  if (place.latitude < 0) return null

  const { year, month } = localParts(date, place.timeZone)
  const harvest = harvestFull(year)

  if (Math.abs(date - harvest) < DAY) return 'Harvest'
  if (date > harvest && date - harvest < 35 * DAY) return 'Hunter’s'

  return NAMES[month - 1]
}



// FULL AND NEW

function fullEvent(date, previous, place, observer) {
  const km = moonKm(date)
  const name = fullMoonName(date, place)
  const blue = previous && sameMonth(previous, date, place.timeZone)
  const tags = [km < SUPER_KM && 'Supermoon', km > MICRO_KM && 'Micromoon', blue && 'Blue Moon'].filter(Boolean)
  const kinds = ['full-moon', km < SUPER_KM && 'supermoon', km > MICRO_KM && 'micromoon', blue && 'blue-moon'].filter(Boolean)
  const short = name ? `Full ${name} Moon` : 'Full Moon'
  const rise = moonrise(date, observer)

  const notes = [
    'Rises around sunset and shines all night.',
    km < SUPER_KM && 'A supermoon: the Moon is near its closest, so it looks a little bigger and brighter than usual.',
    km > MICRO_KM && 'A micromoon: the Moon is near its farthest, so it looks a little smaller than usual.',
    blue && 'A Blue Moon: the second full Moon this month.',
  ].filter(Boolean)

  return base(kinds, date, place, {
    icon: 'full-moon',
    short,
    name: short,
    tags,
    note: notes.join(' '),
    rows: [
      ['Full at', `${clock(date, place.timeZone)}`],
      ['Moonrise', rise ? clock(rise, place.timeZone) : 'No moonrise'],
      ['Distance', distanceWords(km, place.country)],
    ],
  })
}

function newEvent(date, previous, place) {
  const black = previous && sameMonth(previous, date, place.timeZone)

  return base(['new-moon', black && 'black-moon'].filter(Boolean), date, place, {
    icon: 'new-moon',
    short: black ? 'Black Moon' : 'New Moon',
    name: 'New Moon',
    tags: black ? ['Black Moon'] : [],
    note: `The Moon is lost in the Sun’s glare, so the nights are at their darkest. Great for faint galaxies and the Milky Way.${black ? ' A Black Moon: the second new Moon this month.' : ''}`,
    rows: [['New at', clock(date, place.timeZone)]],
  })
}

function quarterEvent(date, first, place) {
  return base(['quarter-moon'], date, place, {
    icon: first ? 'first-quarter' : 'last-quarter',
    short: first ? 'First quarter' : 'Last quarter',
    name: first ? 'First quarter Moon' : 'Last quarter Moon',
    note: first ? 'Half lit and high in the evening sky. Craters stand out along the edge of the shadow.' : 'Half lit, rising around midnight and high at dawn.',
    rows: [['Exact at', clock(date, place.timeZone)]],
  })
}



// PHASES

function phaseEvents(start, end, place, observer) {
  const events = []
  const last = { 0: null, 2: null }
  let quarter = Astronomy.SearchMoonQuarter(new Date(start.getTime() - 32 * DAY))

  while (quarter.time.date < end) {
    const date = quarter.time.date
    const inside = date >= start

    if (quarter.quarter === 0 && inside) events.push(newEvent(date, last[0], place))
    if (quarter.quarter === 2 && inside) events.push(fullEvent(date, last[2], place, observer))
    if ((quarter.quarter === 1 || quarter.quarter === 3) && inside) events.push(quarterEvent(date, quarter.quarter === 1, place))
    if (quarter.quarter in last) last[quarter.quarter] = date

    quarter = Astronomy.NextMoonQuarter(quarter)
  }

  return events
}



// DISTANCE

function distanceEvents(start, end, place) {
  const events = []
  let apsis = Astronomy.SearchLunarApsis(start)

  while (apsis.time.date < end) {
    const close = apsis.kind === 0

    events.push(base(['moon-distance'], apsis.time.date, place, {
      icon: close ? 'moon-close' : 'moon-far',
      short: close ? 'Moon closest' : 'Moon farthest',
      name: close ? 'Moon at its closest' : 'Moon at its farthest',
      note: close ? 'The Moon reaches the nearest point of its orbit (perigee).' : 'The Moon reaches the farthest point of its orbit (apogee).',
      rows: [['Distance', distanceWords(apsis.dist_km, place.country)]],
    }))

    apsis = Astronomy.NextLunarApsis(apsis)
  }

  return events
}



// NODES

function nodeEvents(start, end, place) {
  const events = []
  let node = Astronomy.SearchMoonNode(start)

  while (node.time.date < end) {
    events.push(base(['moon-node'], node.time.date, place, {
      icon: 'moon-node',
      short: 'Moon crosses Sun’s path',
      name: 'Moon crosses the Sun’s path',
      note: `The Moon crosses the ecliptic heading ${node.kind > 0 ? 'north' : 'south'}. Eclipses can only happen when a new or full Moon falls near one of these crossings.`,
      rows: [],
    }))

    node = Astronomy.NextMoonNode(node)
  }

  return events
}



// MOON EVENTS

export function moonEvents(start, end, place, observer) {
  return [
    ...phaseEvents(start, end, place, observer),
    ...distanceEvents(start, end, place),
    ...nodeEvents(start, end, place),
  ]
}
