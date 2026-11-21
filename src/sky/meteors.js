import * as Astronomy from 'astronomy-engine'
import { SHOWERS } from './catalog/showers.js'



// SETTINGS

export const GOOD_SHOWER = 8

const DAY = 24 * 60 * 60 * 1000
const SUN_PER_DAY = 0.9856
const PRECESSION = 1.3969713 / 100



// DATES

function monthDay(text) {
  const [month, day] = text.split('-').map(Number)

  return { month, day, code: month * 100 + day }
}

function isActive(shower, code) {
  const start = monthDay(shower.start).code
  const end = monthDay(shower.end).code

  return start <= end ? code >= start && code <= end : code >= start || code <= end
}

function sinceEpoch(date) {
  return (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY)
}

function daysFromPeak(shower, date) {
  const sun = Astronomy.SunPosition(date).elon - PRECESSION * sinceEpoch(date)
  const apart = Math.abs(((sun - shower.sun + 540) % 360) - 180)

  return Math.round(apart / SUN_PER_DAY)
}



// PEAK TIME

export function peakTime(shower, year) {
  const start = new Date(Date.UTC(year, 0, 1))
  const target = (shower.sun + PRECESSION * sinceEpoch(start)) % 360

  return Astronomy.SearchSunLongitude(target, start, 366).date
}



// SHOWERS

export function activeShowers(date) {
  const code = (date.getUTCMonth() + 1) * 100 + date.getUTCDate()

  return SHOWERS
    .filter(shower => isActive(shower, code))
    .map(shower => ({ ...shower, kind: 'shower', gear: 1, color: '--bronze', daysFromPeak: daysFromPeak(shower, date) }))
}

export function meteorRate(shower, radiantAlt) {
  if (radiantAlt <= 0) return 0

  return Math.round(shower.zhr * 10 ** (-0.08 * shower.daysFromPeak) * Math.sin((radiantAlt * Math.PI) / 180))
}



// PEAKS

export function showerPeak(shower, night) {
  return shower.track.reduce((best, point, i) => {
    if (night.sun[i] >= -18) return best

    const rate = meteorRate(shower, point.alt)

    return !best || rate > best.rate ? { rate, index: i } : best
  }, null)
}

export function goodShowers(showers, night) {
  return showers
    .map(shower => ({ shower, peak: showerPeak(shower, night) }))
    .filter(({ peak }) => peak && peak.rate >= GOOD_SHOWER)
    .sort((a, b) => b.peak.rate - a.peak.rate)
}



// NEXT SHOWER

const STRONG = 15

export function nextShower(now) {
  const year = now.getUTCFullYear()

  return SHOWERS
    .filter(shower => shower.zhr >= STRONG)
    .flatMap(shower => [year, year + 1].map(y => ({ name: shower.name, peak: peakTime(shower, y) })))
    .filter(({ peak }) => peak > now)
    .sort((a, b) => a.peak - b.peak)[0]
}
