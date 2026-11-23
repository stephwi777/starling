import * as Astronomy from 'astronomy-engine'
import { SHOWERS } from '../catalog/showers.js'
import { peakTime } from '../meteors.js'
import { localNoon } from '../night.js'
import { clock } from '../words.js'
import { HOUR, MINUTE, horizon, look, moonLit, nightKey, spelled } from './skyTools.js'



// SETTINGS

const MAJOR = ['Quadrantids', 'Lyrids', 'Eta Aquariids', 'Perseids', 'Orionids', 'Leonids', 'Geminids']
const LOWEST_PEAK = 15
const SCAN = 15 * MINUTE
const DARK = -12



// HELPERS

function monthDay(text) {
  return text.split('-').map(Number)
}

function shortDate(year, text, timeZone) {
  const [month, day] = monthDay(text)

  return new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric' }).format(localNoon(year, month, day, timeZone))
}

function eveningOf(key, timeZone) {
  const [year, month, day] = key.split('-').map(Number)

  return localNoon(year, month, day, timeZone)
}

function highestRadiant(shower, noon, observer) {
  let best = { alt: -90 }

  for (let time = noon.getTime() + 6 * HOUR; time <= noon.getTime() + 19 * HOUR; time += SCAN) {
    const date = new Date(time)

    if (horizon('Sun', date, observer).alt > DARK) continue

    const spot = Astronomy.Horizon(date, observer, shower.ra, shower.dec, 'normal')

    if (spot.altitude > best.alt) best = { date, alt: spot.altitude, az: spot.azimuth }
  }

  return best
}



// SHOWER EVENT

function shortName(name) {
  return name.replace('Northern ', 'N. ').replace('Southern ', 'S. ')
}

function activeWords(from, to) {
  const [fromMonth, fromDay] = from.split(' ')
  const [toMonth, toDay] = to.split(' ')

  return fromMonth === toMonth ? `${fromMonth} ${fromDay}–${toDay}` : `${from}–${to}`
}



function showerEvent(shower, year, place, observer) {
  const peak = peakTime(shower, year)
  const day = nightKey(peak, place.timeZone)
  const noon = eveningOf(day, place.timeZone)
  const reach = 90 - Math.abs(place.latitude - shower.dec)
  const here = reach >= LOWEST_PEAK
  const top = highestRadiant(shower, noon, observer)
  const startYear = shower.start > shower.peak ? year - 1 : year
  const endYear = shower.end < shower.peak ? year + 1 : year

  return {
    id: `shower-${shower.name}-${year}`,
    kinds: [MAJOR.includes(shower.name) ? 'major-shower' : 'minor-shower'],
    group: 'meteor',
    date: peak,
    day,
    time: 'Peak night',
    here,
    tags: [],
    where: here ? null : `Best seen from the ${shower.dec < 0 ? 'Southern' : 'Northern'} Hemisphere.`,
    icon: 'shower',
    subjects: [{ key: `shower:${shower.name}`, label: `every ${shower.name} peak` }],
    short: shower.name.length > 20 ? shortName(shower.name) : shower.name,
    tiny: shortName(shower.name),
    name: `${shower.name} peak`,
    note: `${shower.hint} Up to ${shower.zhr} meteors an hour from a dark site, fewer near towns.`,
    rows: [
      ['Active', activeWords(shortDate(startYear, shower.start, place.timeZone), shortDate(endYear, shower.end, place.timeZone))],
      ['Radiant', spelled(Astronomy.Constellation(shower.ra, shower.dec).name)],
      here && ['Best time', top.alt > 0 ? clock(top.date, place.timeZone) : 'The radiant stays below your horizon'],
      here && top.alt > 0 && ['Look', look(top)],
      ['Moon', moonLit(new Date(noon.getTime() + 12 * HOUR))],
      ['Comes from', shower.parent],
    ].filter(Boolean),
  }
}



// SHOWER EVENTS

export function showerEvents(start, end, place, observer) {
  const years = [...new Set([start.getUTCFullYear(), end.getUTCFullYear()])]

  return years.flatMap(year => SHOWERS.map(shower => showerEvent(shower, year, place, observer)))
    .filter(event => event.date >= start && event.date < end)
}
