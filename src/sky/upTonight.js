import { goodShowers } from './meteors.js'
import { showerName } from './hours.js'
import { sortEasiest } from './listing.js'
import { aroundHour, compass, fists } from './words.js'



// SETTINGS

const PICKS = 4
const LOW = 25
const DEEP = ['cluster', 'double', 'galaxy', 'globular', 'nebula', 'planetary']
const GEAR = ['', '', 'Binoculars', 'Telescope']



// WORDS

function spot(point) {
  return point.alt >= 75 ? 'Nearly overhead' : `${fists(point.alt)} in the ${compass(point.az)}`
}

function needsDark(object) {
  return DEEP.includes(object.kind) && object.mag >= 3
}

function objectNote(object, night, timeZone) {
  const note = `${spot(object.track[object.bestIndex])} at ${aroundHour(night.times[object.bestIndex], timeZone)}`

  return needsDark(object) ? `${note}. Needs a dark sky.` : note
}



// PICKS

function easy(list, night, timeZone) {
  const dark = night.sun.some(alt => alt < -18)
  const shown = sortEasiest(list.filter(object => object.visible && object.gear <= 2 && (dark || !needsDark(object))))
  const high = object => object.track[object.bestIndex].alt >= LOW

  return [...shown.filter(high), ...shown.filter(object => !high(object))].map(object => ({
    key: object.name,
    name: object.name,
    object,
    note: objectNote(object, night, timeZone),
    gear: GEAR[object.gear] || null,
  }))
}

function takeTurns(groups) {
  const picks = []

  for (let round = 0; picks.length < PICKS && groups.some(group => group.length > round); round++) {
    groups.forEach(group => {
      if (picks.length < PICKS && group[round]) picks.push(group[round])
    })
  }

  return picks
}



// UP TONIGHT

export function upTonight({ night, moon, planets, showers, deep, shapes, stars }, timeZone) {
  const good = goodShowers(showers, night)

  const meteors = good.map(({ shower, peak }) => ({
    key: shower.name,
    name: showerName(shower),
    object: shower,
    note: `About ${peak.rate} an hour at ${aroundHour(night.times[peak.index], timeZone)}`,
    gear: null,
  }))

  const picks = takeTurns([
    easy(planets, night, timeZone),
    meteors,
    easy(deep, night, timeZone),
    easy(shapes, night, timeZone),
    easy(stars, night, timeZone),
  ])

  const total = [moon, ...planets, ...deep, ...shapes, ...stars].filter(object => object.visible).length + good.length

  if (picks.length) return { picks, total, empty: null }

  const bright = night.sun.every(alt => alt >= -8)

  return { picks, total, empty: bright ? 'The sky stays too bright tonight.' : 'Nothing easy to spot tonight.' }
}
