import * as Astronomy from 'astronomy-engine'
import { clock } from '../words.js'
import { DAY, MINUTE, dayKey, horizon, regionOf, underBody } from './skyTools.js'



// SETTINGS

const SCAN = 5 * MINUTE

const LUNAR = {
  total: { name: 'Total lunar eclipse', note: 'Earth’s shadow covers the whole Moon, turning it a coppery red. Safe to watch with your eyes.' },
  partial: { name: 'Partial lunar eclipse', note: 'Earth’s shadow darkens part of the Moon. Safe to watch with your eyes.' },
  penumbral: { name: 'Penumbral lunar eclipse', note: 'A subtle dimming of the Moon that’s easy to miss.' },
}

const SOLAR = {
  total: 'Total solar eclipse',
  annular: 'Annular solar eclipse',
  hybrid: 'Hybrid solar eclipse',
  partial: 'Partial solar eclipse',
}

const SOLAR_NOTES = {
  total: 'The Moon covers the whole Sun and day turns to twilight.',
  annular: 'The Moon leaves a bright ring of Sun around its edge.',
  hybrid: 'Total in some places, a ring of Sun in others.',
  partial: 'The Moon covers part of the Sun.',
}

const SAFETY = 'Never look at the Sun without certified eclipse glasses.'



// HELPERS

function minutesFrom(date, minutes) {
  return new Date(date.getTime() + minutes * MINUTE)
}

function whenever(from, to, check) {
  for (let time = from.getTime(); time <= to.getTime(); time += SCAN) {
    if (check(new Date(time))) return true
  }

  return false
}

function upDuring(body, from, to, observer) {
  return whenever(from, to, date => horizon(body, date, observer).alt > 0)
}

function moonInDark(from, to, observer) {
  return whenever(from, to, date => horizon('Moon', date, observer).alt > 0 && horizon('Sun', date, observer).alt < 0)
}

function crossing(body, from, to, observer, time) {
  const days = (to - from) / DAY
  const rise = Astronomy.SearchRiseSet(body, observer, 1, from, days)
  const set = Astronomy.SearchRiseSet(body, observer, -1, from, days)

  if (rise && !(set && set.date < rise.date)) return `Rises mid-eclipse at ${time(rise.date)}`
  if (set) return `Sets mid-eclipse at ${time(set.date)}`

  return null
}

function covered(fraction) {
  const percent = fraction * 100

  return `${percent > 99 && percent < 100 ? Math.floor(percent * 10) / 10 : Math.round(percent)}% of the Sun`
}

function base(kind, date, place, extra) {
  return {
    id: `${kind}-${date.getTime()}`,
    kinds: [kind],
    group: 'eclipse',
    date,
    day: dayKey(date, place.timeZone),
    time: clock(date, place.timeZone),
    rows: [],
    tags: [],
    ...extra,
  }
}



// LUNAR ECLIPSES

function lunarEvent(eclipse, place, observer) {
  const peak = eclipse.peak.date
  const shadow = eclipse.kind === 'penumbral' ? eclipse.sd_penum : eclipse.sd_partial
  const from = minutesFrom(peak, -shadow)
  const to = minutesFrom(peak, shadow)
  const here = moonInDark(from, to, observer)
  const under = underBody('Moon', peak)
  const time = date => clock(date, place.timeZone)
  const words = LUNAR[eclipse.kind]
  const totalFrom = minutesFrom(peak, -eclipse.sd_total)
  const totalTo = minutesFrom(peak, eclipse.sd_total)
  const missed = here && eclipse.sd_total > 0 && !moonInDark(totalFrom, totalTo, observer)
  const sun = here && crossing('Sun', from, to, observer, time)

  const faint = !(eclipse.sd_partial > 0)

  const rows = [
    faint && ['Begins', time(minutesFrom(peak, -eclipse.sd_penum))],
    faint && ['Ends', time(minutesFrom(peak, eclipse.sd_penum))],
    !faint && ['Partial', `${time(minutesFrom(peak, -eclipse.sd_partial))}–${time(minutesFrom(peak, eclipse.sd_partial))}`],
    eclipse.sd_total > 0 && ['Totality', `${time(totalFrom)}–${time(totalTo)}${missed ? ', not seen from here' : ''}`],
    here && ['Moon', crossing('Moon', from, to, observer, time) ?? 'Up the whole time'],
    sun && ['Sun', sun],
  ].filter(Boolean)

  return base('lunar-eclipse', peak, place, {
    span: { from: minutesFrom(peak, -eclipse.sd_penum), to: minutesFrom(peak, eclipse.sd_penum) },
    subjects: [{ key: 'lunar-eclipse', label: 'every lunar eclipse' }],
    icon: 'lunar-eclipse',
    short: faint ? 'Faint lunar' : words.name.replace(' eclipse', ''),
    tiny: eclipse.kind === 'total' ? 'Total eclipse' : 'Lunar eclipse',
    name: words.name,
    note: words.note,
    here,
    where: here ? null : `Seen where the Moon is up, centered over ${regionOf(under.lat, under.lon)}.`,
    rows,
  })
}

function lunarEvents(start, end, place, observer) {
  const events = []
  let eclipse = Astronomy.SearchLunarEclipse(start)

  while (eclipse.peak.date < end) {
    events.push(lunarEvent(eclipse, place, observer))
    eclipse = Astronomy.NextLunarEclipse(eclipse.peak)
  }

  return events
}



// SOLAR ECLIPSES

function localView(globalPeak, observer) {
  const local = Astronomy.SearchLocalSolarEclipse(new Date(globalPeak.getTime() - DAY), observer)
  const near = Math.abs(local.peak.time.date - globalPeak) < DAY
  const contacts = [local.partial_begin, local.peak, local.partial_end]

  return near && contacts.some(contact => contact.altitude > 0) ? local : null
}

function solarEvent(eclipse, place, observer) {
  const peak = eclipse.peak.date
  const local = localView(peak, observer)
  const time = date => clock(date, place.timeZone)
  const center = eclipse.latitude === undefined ? null : regionOf(eclipse.latitude, eclipse.longitude)
  const kind = local ? local.kind : eclipse.kind
  const sun = local && crossing('Sun', local.partial_begin.time.date, local.partial_end.time.date, observer, time)
  const elsewhere = local && local.kind !== eclipse.kind && center ? ` It’s ${SOLAR[eclipse.kind].replace(' solar eclipse', '').toLowerCase()} near ${center}.` : ''

  const rows = local ? [
    ['Begins', time(local.partial_begin.time.date)],
    local.total_begin && [kind === 'annular' ? 'Ring of Sun' : 'Totality', `${time(local.total_begin.time.date)}–${time(local.total_end.time.date)}`],
    ['Covered', covered(local.obscuration)],
    ['Ends', time(local.partial_end.time.date)],
    sun && ['Sun', sun],
  ].filter(Boolean) : []

  return base('solar-eclipse', local ? local.peak.time.date : peak, place, {
    span: local ? { from: local.partial_begin.time.date, to: local.partial_end.time.date } : null,
    subjects: [{ key: 'solar-eclipse', label: 'every solar eclipse' }],
    icon: 'solar-eclipse',
    short: SOLAR[kind].replace(' solar eclipse', ' eclipse'),
    tiny: 'Solar eclipse',
    name: SOLAR[kind],
    note: `${SOLAR_NOTES[kind]}${elsewhere} ${SAFETY}`,
    here: Boolean(local),
    where: local ? null : center ? `Centered over ${center}.` : 'Seen only from high latitudes.',
    rows,
  })
}

function solarEvents(start, end, place, observer) {
  const events = []
  let eclipse = Astronomy.SearchGlobalSolarEclipse(start)

  while (eclipse.peak.date < end) {
    events.push(solarEvent(eclipse, place, observer))
    eclipse = Astronomy.NextGlobalSolarEclipse(eclipse.peak)
  }

  return events
}



// TRANSITS

function transitEvents(start, end, place, observer) {
  return ['Mercury', 'Venus'].flatMap(body => {
    const events = []
    let transit = Astronomy.SearchTransit(body, start)

    while (transit.peak.date < end) {
      const here = upDuring('Sun', transit.start.date, transit.finish.date, observer)
      const sun = underBody('Sun', transit.peak.date)
      const time = date => clock(date, place.timeZone)

      events.push(base('transit', transit.peak.date, place, {
        span: { from: transit.start.date, to: transit.finish.date },
        subjects: [{ key: `transit:${body}`, label: `every ${body} transit` }],
        icon: 'transit',
        short: `${body} transit`,
        tiny: `${body} transit`,
        name: `${body} crosses the Sun`,
        note: `${body} passes in front of the Sun as a small black dot. Watch only through a telescope with a proper solar filter.`,
        here,
        where: here ? null : `Seen where the Sun is up, centered over ${regionOf(sun.lat, sun.lon)}.`,
        rows: [['Begins', time(transit.start.date)], ['Ends', time(transit.finish.date)]],
      }))

      transit = Astronomy.NextTransit(body, transit.finish)
    }

    return events
  })
}



// ECLIPSE EVENTS

export function eclipseEvents(start, end, place, observer) {
  return [
    ...lunarEvents(start, end, place, observer),
    ...solarEvents(start, end, place, observer),
    ...transitEvents(start, end, place, observer),
  ]
}
