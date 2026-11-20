import { goodShowers } from './meteors.js'
import { showerName } from './hours.js'
import { sortEasiest } from './listing.js'
import { aroundHour, fists, wideCompass } from './words.js'



// SETTINGS

const HOUR = 60 * 60 * 1000
const DARK = -12
const UP = 10



// WORDS

function spot(point) {
  return point.alt >= 75 ? 'Nearly overhead' : `${fists(point.alt)} · ${wideCompass(point.az)}`
}



// TIMES

function stepOf(night, time) {
  return Math.round((time - night.start) / (night.times[1] - night.times[0]))
}

function darkRange(night) {
  const first = night.sun.findIndex(alt => alt < DARK)
  const last = night.sun.findLastIndex(alt => alt < DARK)

  return first === -1 ? null : { first, last }
}

function reference(night, now) {
  const dark = darkRange(night)
  const step = stepOf(night, now)

  if (!dark) return { index: Math.max(0, Math.min(night.times.length - 1, step)), atDark: false }
  if (step >= dark.first && step <= dark.last) return { index: step, atDark: false }

  return { index: dark.first, atDark: true }
}

function splitIndex(night, from) {
  const dark = darkRange(night)
  const twoAm = stepOf(night, new Date(night.midnight.getTime() + 2 * HOUR))
  const end = dark ? dark.last : night.times.length - 1

  return twoAm > from && twoAm < end ? twoAm : Math.round((from + end) / 2)
}



// ROWS

const TYPES = { moon: 'planet', planet: 'planet', star: 'star', double: 'star', shape: 'shape' }

function rowFor(object, night, ref, split, timeZone) {
  const here = object.track[ref.index]
  const best = object.track[object.bestIndex]
  const base = { key: object.name, name: object.name, type: TYPES[object.kind] ?? 'deep', object, gear: object.gear, setting: false }

  if (here.alt >= UP) return { ...base, group: 'now', note: spot(here) }

  if (object.bestIndex <= ref.index) {
    if (here.alt <= 0) return null

    return { ...base, group: 'now', setting: true, note: `Low in the ${wideCompass(here.az)} · setting` }
  }

  return { ...base, group: object.bestIndex < split ? 'later' : 'dawn', note: `${aroundHour(night.times[object.bestIndex], timeZone)} · ${spot(best)}` }
}



// UP LIST

export function upList({ night, moon, planets, stars, shapes, deep, showers }, now, timeZone) {
  const ref = reference(night, now)
  const split = splitIndex(night, ref.index)
  const objects = sortEasiest([moon, ...planets, ...stars, ...shapes, ...deep].filter(object => object.visible))
  const rows = objects.map(object => rowFor(object, night, ref, split, timeZone)).filter(Boolean)

  const meteors = goodShowers(showers, night).map(({ shower, peak }) => ({
    key: shower.name,
    name: showerName(shower),
    type: 'meteor',
    object: { ...shower, kind: 'shower' },
    gear: 1,
    setting: false,
    group: peak.index <= ref.index ? 'now' : peak.index < split ? 'later' : 'dawn',
    note: `${aroundHour(night.times[peak.index], timeZone)} · about ${peak.rate} an hour`,
  }))

  const ordered = [...meteors, ...rows]

  return {
    atDark: ref.atDark,
    at: night.times[ref.index],
    split: night.times[split],
    rows: [...ordered.filter(row => !row.setting), ...ordered.filter(row => row.setting)],
  }
}



// FILTER

export function filterRows(rows, { gear, type, query }) {
  const text = query.trim().toLowerCase()

  return rows.filter(row => row.gear <= gear && (type === 'all' || row.type === type) && (!text || row.name.toLowerCase().includes(text)))
}
