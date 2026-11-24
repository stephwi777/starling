import * as Astronomy from 'astronomy-engine'
import { clock } from '../words.js'
import { HOUR, MINUTE, dayKey, horizon, look, moonLit } from './skyTools.js'



// SETTINGS

const SPAN = 3 * HOUR
const STEP = MINUTE
const MOON_KM = 1737.4
const DARK = -6
const LOW = 5
const REACH = 8 * HOUR



// FINDING

function gap(body, date, observer) {
  const moon = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true)
  const other = Astronomy.Equator(body, date, observer, true, true)
  const radius = (Math.atan(MOON_KM / (moon.dist * Astronomy.KM_PER_AU)) * 180) / Math.PI

  return Astronomy.AngleBetween(moon.vec, other.vec) - radius
}

export function isCovered(body, date, observer, extra = 0) {
  return gap(body, date, observer) < extra
}

function edge(body, start, observer, extra, direction) {
  let time = start.getTime()

  while (Math.abs(time - start.getTime()) < REACH && isCovered(body, new Date(time + direction * STEP), observer, extra)) time += direction * STEP

  return new Date(time)
}

export function findCover(body, around, observer, extra = 0) {
  for (let time = around.getTime() - SPAN; time <= around.getTime() + SPAN; time += STEP) {
    const date = new Date(time)

    if (isCovered(body, date, observer, extra)) {
      const from = edge(body, date, observer, extra, -1)
      const to = edge(body, date, observer, extra, 1)

      return { from, to, middle: new Date((from.getTime() + to.getTime()) / 2) }
    }
  }

  return null
}

function moment(date, observer, daytimeOk) {
  if (horizon('Moon', date, observer).alt < LOW) return 'low'

  const sun = horizon('Sun', date, observer).alt

  if (sun < DARK) return 'dark'
  if (!daytimeOk) return 'bright'

  return sun < 0 ? 'twilight' : 'day'
}

const SEEN = ['dark', 'twilight', 'day']

export function coverSight(cover, observer, daytimeOk) {
  const from = moment(cover.from, observer, daytimeOk)
  const to = moment(cover.to, observer, daytimeOk)

  if (!SEEN.includes(from) && !SEEN.includes(to)) return null

  const light = [from, to].includes('day') ? 'day' : [from, to].includes('twilight') ? 'twilight' : 'dark'

  return { from, to, light }
}



// EVENT

function lasting(minutes) {
  if (minutes < 2) return 'about a minute'
  if (minutes < 90) return `${minutes} minutes`

  const rounded = Math.round(minutes / 10) * 10
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60

  return `about ${hours} ${hours === 1 ? 'hour' : 'hours'}${rest ? ` ${rest} minutes` : ''}`
}

function noteFor(label, hint, cluster, minutes, sight) {
  const first = hint?.split(/(?<=\.)\s/)[0].replace(/\.$/, '')
  const about = first ? `${label}, ${first[0].toLowerCase()}${first.slice(1)}` : label
  const hiding = cluster ? `hiding some of its stars for ${lasting(minutes)}` : `hiding it for ${lasting(minutes)}`
  const day = {
    day: ' This happens in daylight, so you’ll need binoculars or a telescope.',
    twilight: ' This happens in twilight, so binoculars help.',
  }[sight.light] ?? ''

  return `The Moon passes in front of ${about}, ${hiding}.${day}`
}

const UNSEEN = { low: 'Moon too low to see', bright: 'Sky too bright' }

export function occultationEvent({ id, short, label, hint, cluster = false, cover, sight, place, observer }) {
  const minutes = Math.max(1, Math.round((cover.to - cover.from) / MINUTE))
  const seenAt = SEEN.includes(sight.from) ? cover.from : cover.to
  const when = (date, state) => UNSEEN[state] ?? clock(date, place.timeZone)

  return {
    id: `occultation-${cover.from.getTime()}-${id}`,
    kinds: ['occultation'],
    group: 'moon',
    date: cover.middle,
    day: dayKey(seenAt, place.timeZone),
    time: clock(seenAt, place.timeZone),
    here: true,
    where: null,
    window: { from: cover.from, to: cover.to },
    tags: sight.light === 'day' ? ['Rare', 'Daytime'] : ['Rare'],
    icon: 'occultation',
    subjects: [{ key: `occultation:${id}`, label: `every time the Moon covers ${label}` }],
    short: `Moon covers ${short}`,
    tiny: short,
    name: `Moon covers ${label}`,
    note: noteFor(label, hint, cluster, minutes, sight),
    rows: [
      [cluster ? 'Moon arrives' : 'Disappears', when(cover.from, sight.from)],
      [cluster ? 'Moon leaves' : 'Reappears', when(cover.to, sight.to)],
      ['Look', look(horizon('Moon', seenAt, observer))],
      ['Moon', moonLit(cover.middle)],
    ],
  }
}
