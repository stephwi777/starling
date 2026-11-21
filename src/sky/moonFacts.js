import * as Astronomy from 'astronomy-engine'
import { observerFor } from './night.js'



// SETTINGS

const DAY = 24 * 60 * 60 * 1000
const AU_KM = 149597870.7
const MILE_KM = 1.609344

const PHASES = [
  [7, 'New Moon'],
  [83, 'Waxing crescent'],
  [97, 'First quarter'],
  [173, 'Waxing gibbous'],
  [187, 'Full Moon'],
  [263, 'Waning gibbous'],
  [277, 'Last quarter'],
  [353, 'Waning crescent'],
  [360, 'New Moon'],
]



// LOCAL DATES

function localDate(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric' }).formatToParts(date)
  const value = type => Number(parts.find(part => part.type === type).value)

  return { dayNumber: Date.UTC(value('year'), value('month') - 1, value('day')) / DAY, hour: value('hour') }
}

function format(date, timeZone, options) {
  return new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(date)
}



// MOON

export function phaseName(angle) {
  return PHASES.find(([below]) => angle < below)[1]
}

export function moonAt(date) {
  return {
    angle: Astronomy.MoonPhase(date),
    lit: Astronomy.Illumination('Moon', date).phase_fraction,
    km: Astronomy.GeoVector('Moon', date, true).Length() * AU_KM,
  }
}

export function riseAndSet(place, noon) {
  const observer = observerFor(place)
  const find = direction => Astronomy.SearchRiseSet('Moon', observer, direction, noon, 1)?.date ?? null

  return { rise: find(1), set: find(-1) }
}



// WORDS

export function fullMoonWords(noon, timeZone) {
  const full = Astronomy.SearchMoonPhase(180, noon, 40).date
  const at = localDate(full, timeZone)
  const nights = at.dayNumber - (at.hour < 12 ? 1 : 0) - localDate(noon, timeZone).dayNumber

  if (nights === 0) return 'Tonight'
  if (nights === 1) return 'Tomorrow'
  if (nights <= 7) return `${nights} days`

  return format(full, timeZone, { month: 'short', day: 'numeric' })
}

export function distanceWords(km, country) {
  const miles = country === 'US'

  return `${Math.round(miles ? km / MILE_KM : km).toLocaleString('en-US')} ${miles ? 'mi' : 'km'}`
}

export function nightName(noon, timeZone) {
  return `${format(noon, timeZone, { weekday: 'long' })} night, ${format(noon, timeZone, { month: 'long', day: 'numeric' })}`
}



// LIT SIDE

export function litSide(kind, south) {
  const right = kind === 'first-quarter'

  return right !== south ? 'right' : 'left'
}
