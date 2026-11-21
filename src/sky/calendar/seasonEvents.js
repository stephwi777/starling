import * as Astronomy from 'astronomy-engine'
import { clock } from '../words.js'
import { dayKey } from './skyTools.js'



// SETTINGS

const MILES_PER_AU = 92955807
const KM_PER_AU = Astronomy.KM_PER_AU



// WORDS

const SEASONS = [
  { key: 'mar_equinox', name: 'March equinox', north: 'First day of spring', south: 'First day of autumn', note: 'Day and night are about the same length everywhere.' },
  { key: 'jun_solstice', name: 'June solstice', north: 'Longest day of the year', south: 'Longest night of the year', note: 'The Sun reaches its farthest point north.' },
  { key: 'sep_equinox', name: 'September equinox', north: 'First day of autumn', south: 'First day of spring', note: 'Day and night are about the same length everywhere.' },
  { key: 'dec_solstice', name: 'December solstice', north: 'Longest night of the year', south: 'Longest day of the year', note: 'The Sun reaches its farthest point south.' },
]

function distance(au, country) {
  const miles = country === 'US'

  return `${((au * (miles ? MILES_PER_AU : KM_PER_AU)) / 1e6).toFixed(1)} million ${miles ? 'mi' : 'km'}`
}

function base(kind, date, place, extra) {
  return {
    id: `${kind}-${date.getTime()}`,
    kinds: [kind],
    group: 'sun',
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



// SEASONS

function seasonEvents(start, end, place) {
  const years = [...new Set([start.getUTCFullYear(), end.getUTCFullYear()])]

  return years.flatMap(year => {
    const seasons = Astronomy.Seasons(year)

    return SEASONS
      .map(season => ({ season, date: seasons[season.key].date }))
      .filter(({ date }) => date >= start && date < end)
      .map(({ season, date }) => base('season', date, place, {
        icon: 'season',
        short: season.name,
        name: season.name,
        note: `${place.latitude >= 0 ? season.north : season.south}. ${season.note}`,
        rows: [['Exact at', clock(date, place.timeZone)]],
      }))
  })
}



// EARTH DISTANCE

function earthEvents(start, end, place) {
  const events = []
  let apsis = Astronomy.SearchPlanetApsis('Earth', start)

  while (apsis.time.date < end) {
    const close = apsis.kind === 0

    events.push(base('earth-distance', apsis.time.date, place, {
      icon: 'season',
      short: close ? 'Earth closest to Sun' : 'Earth farthest from Sun',
      name: close ? 'Earth at its closest to the Sun' : 'Earth at its farthest from the Sun',
      note: close ? 'Earth reaches perihelion, the nearest point of its orbit. Seasons come from Earth’s tilt, not its distance.' : 'Earth reaches aphelion, the farthest point of its orbit. Seasons come from Earth’s tilt, not its distance.',
      rows: [['Distance', distance(apsis.dist_au, place.country)]],
    }))

    apsis = Astronomy.NextPlanetApsis('Earth', apsis)
  }

  return events
}



// SUN EVENTS

export function sunEvents(start, end, place) {
  return [...seasonEvents(start, end, place), ...earthEvents(start, end, place)]
}
