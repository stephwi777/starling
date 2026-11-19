import { localNoon, nightStart } from './night.js'
import { moonAt } from './moonFacts.js'



// SETTINGS

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR



// LOCAL TIME

const formats = new Map()

function localParts(date, timeZone) {
  if (!formats.has(timeZone)) formats.set(timeZone, new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric' }))

  const parts = formats.get(timeZone).formatToParts(date)
  const value = type => Number(parts.find(part => part.type === type).value)

  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour') }
}

function noonOn(utcDay, timeZone) {
  const date = new Date(utcDay)

  return localNoon(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), timeZone)
}



// NIGHTS

export function rulerNights(place, now) {
  const tonight = localParts(nightStart(place, now), place.timeZone)
  const first = Date.UTC(tonight.year, tonight.month - 2, 1)
  const last = Date.UTC(tonight.year, tonight.month + 1, 0)
  const nights = []

  for (let day = first; day <= last; day += DAY) {
    const date = new Date(day)
    const noon = noonOn(day, place.timeZone)

    nights.push({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(), noon, midnight: new Date(noon.getTime() + 12 * HOUR) })
  }

  return nights
}

export function tonightIndex(nights, place, now) {
  const noon = nightStart(place, now).getTime()

  return nights.findIndex(night => night.noon.getTime() === noon)
}



// NOTCHES

export function notchesFor(nights, timeZone) {
  const last = nights.at(-1)
  const end = noonOn(Date.UTC(last.year, last.month - 1, last.day + 1), timeZone).getTime()
  const notches = []
  let night = 0

  for (let time = nights[0].noon.getTime(); time < end; time += HOUR) {
    while (night < nights.length - 1 && nights[night + 1].noon.getTime() <= time) night++

    const { hour } = localParts(new Date(time), timeZone)

    if (hour % 2 === 0) {
      const kind = time === nights[night].noon.getTime() ? 'noon' : hour === 0 ? 'midnight' : 'plain'

      notches.push({ time: new Date(time), night, kind, hour })
    }
  }

  return notches
}

export function nearestNotch(notches, time) {
  return notches.reduce((best, notch, i) => (Math.abs(notch.time - time) < Math.abs(notches[best].time - time) ? i : best), 0)
}

export function chosenIndex(notches, home, chosen) {
  return chosen ? nearestNotch(notches, chosen) : home
}

export function sameTimeIndex(notches, nights, fromIndex, nightIndex) {
  const from = notches[fromIndex]
  const target = notches.findIndex(notch => notch.night === nightIndex && notch.hour === from.hour)

  if (target !== -1) return target

  return nearestNotch(notches, new Date(nights[nightIndex].noon.getTime() + (from.time - nights[from.night].noon)))
}



// CALENDAR

export function monthMoons(nights, year, month) {
  return nights.flatMap((night, index) => {
    if (night.year !== year || night.month !== month) return []

    const { angle, lit } = moonAt(night.midnight)

    return [{ index, day: night.day, angle, lit }]
  })
}

export function rulerLabel(night, isTonight, timeZone) {
  if (isTonight) return 'Tonight'

  const options = night.day === 1 ? { month: 'short', day: 'numeric' } : { weekday: 'short' }

  return new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(night.noon)
}
