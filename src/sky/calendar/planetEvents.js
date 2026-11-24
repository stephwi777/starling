import * as Astronomy from 'astronomy-engine'
import { localNoon, localParts } from '../night.js'
import { clock } from '../words.js'
import {
  DAY,
  HOUR,
  MINUTE,
  bodyRows,
  dayKey,
  degrees,
  horizon,
  minima,
  refine,
  separation,
  sunDistance,
  viewed,
  windowWords,
} from './skyTools.js'
import { coverSight, findCover, occultationEvent } from './occultations.js'



// SETTINGS

const BRIGHT = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
const OUTER = ['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']
const ALL = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']

const PAIR_LIMIT = 2
const MOON_LIMIT = 3
const SUN_CLEAR = 15
const MOON_SUN_CLEAR = 12
const COVER_CHECK = 2
const DAYTIME_PLANETS = ['Venus', 'Jupiter']
const PARADE_SIZE = 4
const PARADE_STEP = 20 * MINUTE
const MILES_PER_AU = 92955807

const OPPOSITION_NOTES = {
  Mars: 'Mars is opposite the Sun, so it’s up all night and at its biggest and brightest of the year.',
  Jupiter: 'Jupiter is opposite the Sun, so it’s up all night and at its biggest and brightest of the year.',
  Saturn: 'Saturn is opposite the Sun, so it’s up all night and at its biggest and brightest of the year. Its rings show in any small telescope.',
  Uranus: 'Uranus is opposite the Sun and at its best. It’s faint, so use binoculars from a dark place.',
  Neptune: 'Neptune is opposite the Sun and at its best. It’s too faint for eyes, so you’ll need a telescope.',
}



// HELPERS

function base(kinds, date, place, extra) {
  return {
    id: `${kinds[0]}-${date.getTime()}-${extra.short}`,
    kinds,
    group: 'planet',
    date,
    day: dayKey(date, place.timeZone),
    time: clock(date, place.timeZone),
    here: true,
    where: null,
    rows: [],
    tags: [],
    ...extra,
  }
}

function pairSubject(a, b) {
  const [first, second] = [a, b].sort()

  return { key: `pair:${first}+${second}`, label: `every time ${first} and ${second} meet` }
}

function distance(au, country) {
  const miles = country === 'US'

  return `${Number(((au * (miles ? MILES_PER_AU : Astronomy.KM_PER_AU)) / 1e6).toFixed(1))} million ${miles ? 'mi' : 'km'}`
}




// OPPOSITIONS

function oppositionEvents(start, end, place, observer) {
  return OUTER.flatMap(body => {
    const date = Astronomy.SearchRelativeLongitude(body, 0, start).date

    if (date >= end) return []

    const view = viewed([body], date, place, observer, 'Too low in your sky after dark.')

    return [base(['opposition'], date, place, {
      subjects: [{ key: `best:${body}`, label: `every time ${body} is at its best` }],
      icon: `planet:${body}`,
      short: `${body} at its best`,
      tiny: body,
      name: `${body} at its best`,
      note: OPPOSITION_NOTES[body],
      ...view,
      rows: view.window ? bodyRows(body, view.window, observer, place.timeZone) : [],
    })]
  })
}



// MERCURY AND VENUS AT THEIR BEST

function elongationEvents(start, end, place, observer) {
  return ['Mercury', 'Venus'].flatMap(body => {
    const events = []
    let cursor = start

    for (;;) {
      const found = Astronomy.SearchMaxElongation(body, cursor)

      if (found.time.date >= end) break

      const evening = found.visibility === 'evening'
      const view = viewed([body], found.time.date, place, observer, 'Too low in your sky after dark.')

      events.push(base(['opposition'], found.time.date, place, {
        subjects: [{ key: `best:${body}`, label: `every time ${body} is at its best` }],
        icon: `planet:${body}`,
        short: `${body} at its best`,
        tiny: body,
        name: `${body} at its best`,
        note: view.here
          ? `${body} swings ${Math.round(found.elongation)}° from the Sun, its easiest time to spot ${evening ? 'after sunset' : 'before sunrise'}.`
          : `${body} swings ${Math.round(found.elongation)}° from the Sun in the ${evening ? 'evening' : 'morning'} sky.`,
        ...view,
        rows: view.window ? bodyRows(body, view.window, observer, place.timeZone) : [],
      }))

      cursor = new Date(found.time.date.getTime() + 20 * DAY)
    }

    return events
  })
}



// VENUS AT ITS BRIGHTEST

function venusEvents(start, end, place, observer) {
  const events = []
  let cursor = start

  for (;;) {
    const peak = Astronomy.SearchPeakMagnitude('Venus', cursor)

    if (peak.time.date >= end) break

    const view = viewed(['Venus'], peak.time.date, place, observer, 'Too low in your sky after dark.')

    events.push(base(['venus-brightest'], peak.time.date, place, {
      subjects: [{ key: 'venus-brightest', label: 'every time Venus is at its brightest' }],
      icon: 'planet:Venus',
      short: 'Venus at its brightest',
      tiny: 'Bright Venus',
      name: 'Venus at its brightest',
      note: `Venus outshines everything in the night sky except the Moon (magnitude ${peak.mag.toFixed(1).replace('-', '−')}).`,
      ...view,
      rows: view.window ? bodyRows('Venus', view.window, observer, place.timeZone).filter(([label]) => label !== 'Brightness') : [],
    }))

    cursor = new Date(peak.time.date.getTime() + 30 * DAY)
  }

  return events
}



// MARS CLOSEST

function marsEvents(start, end, place, observer) {
  const opposition = Astronomy.SearchRelativeLongitude('Mars', 0, new Date(start.getTime() - 40 * DAY)).date

  if (opposition > end.getTime() + 40 * DAY) return []

  const away = date => Astronomy.GeoVector('Mars', date, true).Length()
  const closest = refine(opposition, away, 25 * DAY, 3 * HOUR)

  if (closest.date < start || closest.date >= end) return []

  const view = viewed(['Mars'], closest.date, place, observer, 'Too low in your sky after dark.')

  return [base(['mars-closest'], closest.date, place, {
    subjects: [{ key: 'mars-closest', label: 'every time Mars is closest' }],
    icon: 'planet:Mars',
    short: 'Mars closest',
    tiny: 'Mars closest',
    name: 'Mars closest to Earth',
    note: `Mars comes within ${distance(closest.value, place.country)} of Earth, its closest for about two years.`,
    ...view,
    tags: view.here ? ['Rare'] : [],
    rows: view.window ? bodyRows('Mars', view.window, observer, place.timeZone) : [],
  })]
}



// CLOSE PAIRS

function closeness(apart) {
  if (apart < 0.5) return 'so close they may look like one bright star.'
  if (apart < 1) return 'so they fit together in binoculars.'

  return 'closer than a finger held at arm’s length.'
}

function pairEvents(start, end, place, observer) {
  const pairs = BRIGHT.flatMap((a, i) => BRIGHT.slice(i + 1).map(b => [a, b]))

  return pairs.flatMap(([a, b]) => {
    const apart = date => separation(a, b, date)

    return minima(start.getTime(), end.getTime(), 2 * HOUR, apart, PAIR_LIMIT)
      .map(rough => refine(rough, apart))
      .filter(({ date }) => sunDistance(a, date) > SUN_CLEAR && sunDistance(b, date) > SUN_CLEAR)
      .map(({ date, value }) => {
        const view = viewed([a, b], date, place, observer, 'Below your horizon after dark.')

        return base(['planet-pair'], date, place, {
          subjects: [pairSubject(a, b)],
          icon: `pair:${a}+${b}`,
          short: `${a} & ${b}`,
          tiny: `${a} & ${b}`,
          name: `${a} and ${b} together`,
          note: `Only ${degrees(value)} apart, ${closeness(value)}`,
          tags: Number(value.toFixed(1)) < 0.5 && view.here ? ['Rare'] : [],
          ...view,
          rows: view.window ? [['Best seen', windowWords(view.window, place.timeZone)], ...bodyRows(a, view.window, observer, place.timeZone).slice(1, 2)] : [],
        })
      })
  })
}



// MOON NEAR A PLANET

function moonPlanetEvents(start, end, place, observer) {
  return BRIGHT.flatMap(body => {
    const apart = date => separation('Moon', body, date)

    return minima(start.getTime(), end.getTime(), HOUR, apart, MOON_LIMIT)
      .map(rough => refine(rough, apart, 2 * HOUR))
      .filter(({ date }) => sunDistance(body, date) > MOON_SUN_CLEAR)
      .map(({ date, value }) => {
        const cover = value < COVER_CHECK ? findCover(body, date, observer) : null
        const sight = cover && coverSight(cover, observer, DAYTIME_PLANETS.includes(body))

        if (sight) return occultationEvent({ id: body, short: body, label: body, planet: true, cover, sight, place, observer })

        const view = viewed(['Moon', body], date, place, observer, 'Below your horizon after dark.')
        const close = value < 1.5

        return base(['moon-planet'], date, place, {
          subjects: [{ key: `moon-planet:${body}`, label: `every time the Moon passes ${body}` }],
          icon: `planet:${body}`,
          short: `Moon & ${body}`,
          tiny: `Moon & ${body}`,
          name: close ? `Moon meets ${body}` : `Moon near ${body}`,
          note: value < 2 ? `The Moon and ${body} come within ${degrees(value)} of each other, a lovely pair for eyes or binoculars.` : `The Moon and ${body} come within ${degrees(value)} of each other, so look just beside the Moon.`,
          ...view,
          rows: view.window ? bodyRows(body, view.window, observer, place.timeZone) : [],
        })
      })
  })
}



// PARADES

function paradeNight(noon, observer) {
  const sessions = { evening: new Set(), morning: new Set() }

  for (let time = noon.getTime() + 5 * HOUR; time <= noon.getTime() + 19 * HOUR; time += PARADE_STEP) {
    const date = new Date(time)

    if (horizon('Sun', date, observer).alt >= -6) continue

    const up = BRIGHT.filter(body => horizon(body, date, observer).alt >= 5)
    const session = time - noon.getTime() < 12 * HOUR ? 'evening' : 'morning'

    if (up.length > sessions[session].size) sessions[session] = new Set(up)
  }

  return sessions
}

function paradeEvents(start, end, place, observer) {
  const nights = []

  for (let time = start.getTime() + 12 * HOUR; time < end.getTime(); time += DAY) {
    const { year, month, day } = localParts(new Date(time), place.timeZone)
    const noon = localNoon(year, month, day, place.timeZone)

    nights.push({ noon, sessions: paradeNight(noon, observer) })
  }

  return ['evening', 'morning'].flatMap(session => {
    const runs = []

    nights.forEach(({ noon, sessions }) => {
      const planets = [...sessions[session]]
      const last = runs.at(-1)

      if (planets.length < PARADE_SIZE) return
      if (last && noon - last.to <= DAY + HOUR && last.planets.join() === planets.join()) last.to = noon
      else runs.push({ from: noon, to: noon, planets })
    })

    return runs.map(run => {
      const list = run.planets.join(', ').replace(/, ([^,]*)$/, ' and $1')
      const through = run.to > run.from ? new Intl.DateTimeFormat('en-US', { timeZone: place.timeZone, month: 'short', day: 'numeric' }).format(run.to) : null

      return base(['parade'], run.from, place, {
        subjects: [{ key: 'parade', label: 'every planet parade' }],
        id: `parade-${session}-${run.from.getTime()}`,
        icon: 'parade',
        time: session === 'evening' ? 'Evening' : 'Before dawn',
        short: 'Planet parade',
        tiny: `${run.planets.length} planets`,
        name: `Planet parade: ${run.planets.length} planets`,
        note: `${list} are all up in the ${session === 'evening' ? 'evening sky after dusk' : 'morning sky before dawn'}${through ? `, each night through ${through}` : ''}.`,
        rows: [['When', session === 'evening' ? 'About an hour after sunset' : 'About an hour before sunrise']],
      })
    })
  })
}



// TURNING POINTS

function longitude(body, date) {
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon
}

function drift(body, date) {
  const change = longitude(body, new Date(date.getTime() + HOUR)) - longitude(body, date)

  return ((change + 540) % 360) - 180
}

function stationEvents(start, end, place) {
  return ALL.flatMap(body => {
    const events = []
    let before = drift(body, start)

    for (let time = start.getTime() + DAY; time < end.getTime() + DAY; time += DAY) {
      const after = drift(body, new Date(time))

      if (Math.sign(after) !== Math.sign(before)) {
        let low = time - DAY
        let high = time

        for (let i = 0; i < 12; i++) {
          const middle = (low + high) / 2

          if (Math.sign(drift(body, new Date(middle))) === Math.sign(before)) low = middle
          else high = middle
        }

        const date = new Date(high)
        const backward = after < 0

        if (date >= start && date < end) {
          events.push(base(['station'], date, place, {
            subjects: [{ key: `station:${body}`, label: `every time ${body} turns around` }],
            icon: `planet:${body}`,
            time: 'All day',
            short: `${body} turns around`,
            tiny: `${body} turns`,
            name: backward ? `${body} starts moving backward` : `${body} moves forward again`,
            note: backward
              ? `${body} pauses and begins drifting west against the stars (retrograde). It’s an illusion from ${['Mercury', 'Venus'].includes(body) ? `${body} overtaking Earth` : `Earth overtaking ${body}`}.`
              : `${body} pauses and resumes its usual eastward drift against the stars.`,
          }))
        }
      }

      before = after
    }

    return events
  })
}



// CONJUNCTIONS WITH THE SUN

function conjunctionEvents(start, end, place) {
  const targets = [
    ...['Mercury', 'Venus'].flatMap(body => [[body, 0, 'front'], [body, 180, 'behind']]),
    ...OUTER.map(body => [body, 180, 'behind']),
  ]

  return targets.flatMap(([body, angle, side]) => {
    const date = Astronomy.SearchRelativeLongitude(body, angle, start).date

    if (date >= end) return []

    const front = side === 'front'
    const later = front || !['Mercury', 'Venus'].includes(body) ? 'morning' : 'evening'

    return [base(['solar-conjunction'], date, place, {
      subjects: [{ key: `sun-pass:${body}`, label: `every time ${body} lines up with the Sun` }],
      icon: `planet:${body}`,
      short: `${body} & Sun`,
      tiny: `${body} & Sun`,
      name: front ? `${body} passes between Earth and the Sun` : `${body} behind the Sun`,
      note: `${body} is lost in the Sun’s glare for a while. It will reappear in the ${later} sky.`,
    })]
  })
}



// DISTANCE FROM THE SUN

function apsisEvents(start, end, place) {
  return ALL.flatMap(body => {
    const apsis = Astronomy.SearchPlanetApsis(body, start)

    if (apsis.time.date >= end) return []

    const close = apsis.kind === 0

    return [base(['planet-distance'], apsis.time.date, place, {
      subjects: [{ key: `sun-distance:${body}`, label: `every time ${body} is closest or farthest from the Sun` }],
      icon: `planet:${body}`,
      short: `${body} ${close ? 'near' : 'far from'} Sun`,
      tiny: `${body} ${close ? 'close' : 'far'}`,
      name: `${body} ${close ? 'closest to' : 'farthest from'} the Sun`,
      note: `${body} reaches the ${close ? 'nearest' : 'farthest'} point of its orbit, ${distance(apsis.dist_au, place.country)} from the Sun.`,
    })]
  })
}



// PLANET EVENTS

export function planetEvents(start, end, place, observer) {
  return [
    ...oppositionEvents(start, end, place, observer),
    ...elongationEvents(start, end, place, observer),
    ...venusEvents(start, end, place, observer),
    ...marsEvents(start, end, place, observer),
    ...pairEvents(start, end, place, observer),
    ...moonPlanetEvents(start, end, place, observer),
    ...paradeEvents(start, end, place, observer),
    ...stationEvents(start, end, place),
    ...conjunctionEvents(start, end, place),
    ...apsisEvents(start, end, place),
  ]
}
