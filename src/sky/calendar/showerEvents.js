import * as Astronomy from 'astronomy-engine'
import { SHOWERS } from '../catalog/showers.js'
import { peakTime } from '../meteors.js'
import { localNoon } from '../night.js'
import { clock, dayName, where } from '../words.js'
import { HOUR, MINUTE, moonLit, nightKey } from './skyTools.js'



// SETTINGS

const MAJOR = ['Quadrantids', 'Lyrids', 'Eta Aquariids', 'Perseids', 'Orionids', 'Leonids', 'Geminids']
const LOWEST_PEAK = 15
const SCAN = 15 * MINUTE



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
  let best = null

  for (let time = noon.getTime() + 6 * HOUR; time <= noon.getTime() + 19 * HOUR; time += SCAN) {
    const date = new Date(time)
    const spot = Astronomy.Horizon(date, observer, shower.ra, shower.dec, 'normal')

    if (!best || spot.altitude > best.alt) best = { date, alt: spot.altitude, az: spot.azimuth }
  }

  return best
}



// SHOWER EVENT

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
    where: here ? null : `Best seen from the ${shower.dec < 0 ? 'Southern' : 'Northern'} Hemisphere.`,
    icon: 'shower',
    short: `${shower.name} peak`,
    name: `${shower.name} peak`,
    note: `${shower.hint} Up to ${shower.zhr} meteors an hour under perfectly dark skies; expect fewer near towns.`,
    rows: [
      ['Peak night', `${dayName(noon, place.timeZone)} into ${new Intl.DateTimeFormat('en-US', { timeZone: place.timeZone, weekday: 'long' }).format(new Date(noon.getTime() + 24 * HOUR))}`],
      ['Exact peak', `${clock(peak, place.timeZone)}, ${new Intl.DateTimeFormat('en-US', { timeZone: place.timeZone, month: 'short', day: 'numeric' }).format(peak)}`],
      ['Active', `${shortDate(startYear, shower.start, place.timeZone)} to ${shortDate(endYear, shower.end, place.timeZone)}`],
      ['Radiant', `In ${Astronomy.Constellation(shower.ra, shower.dec).name}`],
      ['Best time', top.alt > 0 ? `Around ${clock(top.date, place.timeZone)}, radiant ${where(top.alt, top.az).toLowerCase()}` : 'The radiant stays below your horizon'],
      ['Moon', moonLit(new Date(noon.getTime() + 12 * HOUR))],
      ['Comes from', shower.parent],
    ],
  }
}



// SHOWER EVENTS

export function showerEvents(start, end, place, observer) {
  const years = [...new Set([start.getUTCFullYear(), end.getUTCFullYear()])]

  return years.flatMap(year => SHOWERS.map(shower => showerEvent(shower, year, place, observer)))
    .filter(event => event.date >= start && event.date < end)
}
