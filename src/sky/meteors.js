import { SHOWERS } from './catalog/showers.js'



// SETTINGS

export const GOOD_SHOWER = 8

const DAY = 24 * 60 * 60 * 1000



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

function daysFromPeak(shower, date) {
  const { month, day } = monthDay(shower.peak)
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const year = date.getUTCFullYear()

  return Math.min(...[year - 1, year, year + 1].map(y => Math.abs(Date.UTC(y, month - 1, day) - today) / DAY))
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
