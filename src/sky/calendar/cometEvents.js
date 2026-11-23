import * as Astronomy from 'astronomy-engine'
import { localNoon, localParts, observerFor } from '../night.js'
import { clock } from '../words.js'
import { cometMagnitude, cometPlace } from './cometOrbit.js'
import { HOUR, MINUTE, dayKey, horizon, look, monthKey, moonLit, nightKey, spelled, timeWord, windowWords } from './skyTools.js'



// SETTINGS

const BINOCULARS = 8
const TELESCOPE = 11
const NAKED_EYE = 6
const BINOCULAR_SUN = -12
const TELESCOPE_SUN = -18
const LOW = 10
const STEP = 30 * MINUTE
const SAMPLES_NEEDED = 2
const SUN_CLEAR = 20

const saved = new WeakMap()



// SKY

function moment(date) {
  return { date, time: Astronomy.MakeTime(date), earth: Astronomy.HelioVector('Earth', date), rotation: null }
}

function skySpot(comet, when) {
  const { vector, r, delta } = cometPlace(comet, when.date, when.earth)

  return { date: when.date, when, vector, mag: cometMagnitude(comet, r, delta) }
}

function placeInSky(spot, observer) {
  const { when, vector } = spot

  when.rotation ??= Astronomy.Rotation_EQJ_EQD(when.time)

  const today = Astronomy.EquatorFromVector(Astronomy.RotateVector(when.rotation, new Astronomy.Vector(vector.x, vector.y, vector.z, when.time)))
  const sky = Astronomy.Horizon(when.date, observer, today.ra, today.dec, 'normal')

  return { ...spot, alt: sky.altitude, az: sky.azimuth }
}

function j2000(spot) {
  const { vector, when } = spot

  return Astronomy.EquatorFromVector(new Astronomy.Vector(vector.x, vector.y, vector.z, when.time))
}

function sunAngle(spot) {
  const sun = spot.when.earth
  const dot = -(sun.x * spot.vector.x + sun.y * spot.vector.y + sun.z * spot.vector.z)

  return Math.acos(dot / (Math.hypot(sun.x, sun.y, sun.z) * Math.hypot(spot.vector.x, spot.vector.y, spot.vector.z))) * 180 / Math.PI
}



// NIGHTS

function darkness(noon, observer) {
  const samples = []

  for (let time = noon.getTime() + 4 * HOUR; time <= noon.getTime() + 20 * HOUR; time += STEP) {
    const date = new Date(time)
    const sun = horizon('Sun', date, observer).alt

    if (sun < BINOCULAR_SUN) samples.push({ ...moment(date), sun })
  }

  return samples
}

function nightOf(comet, samples, observer) {
  const binoculars = []
  const telescope = []

  samples.forEach(when => {
    const spot = skySpot(comet, when)

    if (spot.mag > TELESCOPE) return

    const seen = placeInSky(spot, observer)

    if (seen.alt < LOW) return
    if (seen.mag <= BINOCULARS) binoculars.push(seen)
    if (when.sun < TELESCOPE_SUN) telescope.push(seen)
  })

  const sum = spots => (spots.length >= SAMPLES_NEEDED ? {
    window: { from: spots[0].date, to: spots.at(-1).date },
    best: spots.reduce((top, spot) => (spot.alt > top.alt ? spot : top)),
    mag: Math.min(...spots.map(spot => spot.mag)),
  } : null)

  return { binoculars: sum(binoculars), telescope: sum(telescope) }
}

function spanOf(place, now) {
  const { year, month } = localParts(now, place.timeZone)
  const nights = []
  const end = Date.UTC(year + 1, month - 1, 1)

  for (let day = new Date(Date.UTC(year, month - 1, 1)); day.getTime() < end; day.setUTCDate(day.getUTCDate() + 1)) {
    nights.push(localNoon(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), place.timeZone))
  }

  return nights
}

function brightest(comet, weeks) {
  let best = null

  weeks.forEach(when => {
    const spot = skySpot(comet, when)

    if (spot.mag <= TELESCOPE && (!best || spot.mag < best.mag) && sunAngle(spot) >= SUN_CLEAR) best = spot
  })

  return best
}



// WORDS

function looks(mag) {
  if (mag <= 4) return 'easy to see by eye'
  if (mag <= NAKED_EYE) return 'visible by eye from a dark place'
  if (mag <= BINOCULARS) return 'a fuzzy patch in binoculars'

  return 'a faint smudge in a small telescope'
}

function lead(phase, name) {
  if (phase === 'arrives') return `Comet ${name} is now bright enough to find from here`
  if (phase === 'last') return `Your last good look at Comet ${name} before it fades or sets`

  return `Comet ${name} should be at its brightest`
}

function title(phase, name) {
  if (phase === 'arrives') return `Comet ${name} arrives`
  if (phase === 'last') return `Last look at Comet ${name}`

  return `Comet ${name} at its best`
}

function chip(phase, name) {
  if (phase === 'arrives') return `${name} arrives`
  if (phase === 'last') return `${name}: last look`

  return `${name} at its best`
}

function hemisphere(place, dec) {
  if (place.latitude >= 0 && dec < 0) return 'Best seen from the Southern Hemisphere.'
  if (place.latitude < 0 && dec > 0) return 'Best seen from the Northern Hemisphere.'

  return 'Not visible from here after dark.'
}



// EVENTS

function cometEvent(comet, label, phase, kind, peak, night, place) {
  const tags = [phase === 'best' && peak <= NAKED_EYE && 'Naked eye', kind === 'telescope-comet' && 'Telescope'].filter(Boolean)
  const mag = night.mag
  const base = {
    id: `comet-${comet.id}-${phase}`,
    kinds: [kind],
    group: 'comet',
    icon: 'comet',
    subjects: [{ key: `comet:${comet.id}`, label: `Comet ${label}` }],
    short: chip(phase, label),
    tiny: comet.name,
    name: title(phase, label),
    tags,
    note: `${lead(phase, label)}, ${looks(mag)} (magnitude ${mag.toFixed(1).replace('-', '−')}). Comet forecasts are often off, so it could be brighter or fainter.`,
  }

  if (!night.window) {
    return {
      ...base,
      date: night.best.date,
      day: dayKey(night.best.date, place.timeZone),
      time: '',
      here: false,
      where: hemisphere(place, j2000(night.best).dec),
      rows: [],
    }
  }

  const time = timeWord(night.window, place.timeZone)
  const spot = night.best

  return {
    ...base,
    date: spot.date,
    day: time === 'Before dawn' ? dayKey(night.window.from, place.timeZone) : nightKey(night.window.from, place.timeZone),
    time,
    here: true,
    where: null,
    window: night.window,
    rows: [
      ['Best seen', windowWords(night.window, place.timeZone)],
      ['Look', look(spot)],
      ['In', spelled(Astronomy.Constellation(j2000(spot).ra, j2000(spot).dec).name)],
      ['Moon', moonLit(spot.date)],
    ],
  }
}

function seasonOf(comet, sky, place, observer) {
  const label = comet.name
  const top = brightest(comet, sky.weeks)

  if (!top) return []

  const seen = sky.dark().map(samples => nightOf(comet, samples, observer))
  const binocular = seen.some(night => night.binoculars)
  const kind = binocular ? 'comet' : 'telescope-comet'
  const visible = seen.map(night => (binocular ? night.binoculars : night.telescope))
  const shown = visible.map((night, index) => ({ night, index })).filter(({ night }) => night)

  if (!shown.length) {
    const limit = top.mag <= BINOCULARS ? 'comet' : 'telescope-comet'

    return [cometEvent(comet, label, 'best', limit, top.mag, { best: top, mag: top.mag }, place)]
  }

  const best = shown.reduce((top, next) => (next.night.mag < top.night.mag ? next : top))
  const first = shown[0]
  const last = shown.at(-1)
  const phases = [
    first.index > 0 && first !== best && ['arrives', first],
    ['best', best],
    last.index < seen.length - 1 && last !== best && ['last', last],
  ].filter(Boolean)

  return phases.map(([phase, { night }]) => cometEvent(comet, label, phase, kind, best.night.mag, night, place))
}



// SAME NAMES

function rename(events, comet) {
  const plain = `Comet ${comet.name}`
  const full = `Comet ${comet.name} (${comet.designation})`

  return events.map(event => ({
    ...event,
    short: event.short.replace(plain, full),
    name: event.name.replace(plain, full),
    note: event.note.replace(plain, full),
    subjects: event.subjects.map(subject => ({ ...subject, label: subject.label.replace(plain, full) })),
  }))
}



// COMET SEASON

export function cometSeason(comets, place, now) {
  const { year, month } = localParts(now, place.timeZone)
  const key = `${place.latitude},${place.longitude},${place.timeZone}|${monthKey(year, month)}`

  if (!saved.has(comets)) saved.set(comets, new Map())

  const cache = saved.get(comets)

  if (!cache.has(key)) {
    const nights = spanOf(place, now)
    const observer = observerFor(place)
    let dark = null
    const sky = {
      weeks: nights.filter((noon, index) => index % 7 === 0).map(moment),
      dark: () => (dark ??= nights.map(noon => darkness(noon, observer))),
    }
    const found = comets.map(comet => ({ comet, events: seasonOf(comet, sky, place, observer) })).filter(({ events }) => events.length)
    const counts = new Map()

    found.forEach(({ comet }) => counts.set(comet.name, (counts.get(comet.name) ?? 0) + 1))

    const events = found.flatMap(({ comet, events: list }) => (counts.get(comet.name) > 1 ? rename(list, comet) : list))

    cache.set(key, events.sort((a, b) => a.date - b.date))
  }

  return cache.get(key)
}



// CHECKLIST NOTES

export function cometNotes(status, events, shown) {
  if (status === 'failed') return { group: 'Comet predictions couldn’t load right now.', kinds: {} }
  if (status !== 'ready') return { group: null, kinds: {} }

  const empty = ['comet', 'telescope-comet'].filter(kind => shown.includes(kind) && !events.some(event => event.kinds.includes(kind)))

  return { group: null, kinds: Object.fromEntries(empty.map(kind => [kind, 'No upcoming comets of this type yet.'])) }
}
