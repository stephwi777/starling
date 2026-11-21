import * as Astronomy from 'astronomy-engine'
import { clock } from '../words.js'
import { DAY, MINUTE, dayKey, horizon, regionOf, underBody } from './skyTools.js'



// SETTINGS

const SCAN = 5 * MINUTE

const LUNAR = {
  total: { name: 'Total lunar eclipse', note: 'Earth’s shadow covers the whole Moon, turning it a coppery red. Safe to watch with your eyes.' },
  partial: { name: 'Partial lunar eclipse', note: 'Earth’s shadow takes a dark bite out of the Moon. Safe to watch with your eyes.' },
  penumbral: { name: 'Penumbral lunar eclipse', note: 'A faint, subtle dimming of the Moon that’s easy to miss.' },
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

function upDuring(body, from, to, observer) {
  for (let time = from.getTime(); time <= to.getTime(); time += SCAN) {
    if (horizon(body, new Date(time), observer).alt > 0) return true
  }

  return false
}

function moonDuring(from, to, observer, time) {
  const up = date => horizon('Moon', date, observer).alt > 0
  const rise = Astronomy.SearchRiseSet('Moon', observer, 1, from, (to - from) / DAY)
  const set = Astronomy.SearchRiseSet('Moon', observer, -1, from, (to - from) / DAY)

  if (up(from) && up(to) && !set) return 'Up the whole time'
  if (!up(from) && rise) return `Rises at ${time(rise.date)}, partway through`
  if (set) return `Sets at ${time(set.date)}, partway through`

  return 'Up the whole time'
}

function covered(fraction) {
  const percent = fraction * 100

  return `${percent > 99 && percent < 100 ? Math.floor(percent * 10) / 10 : Math.round(percent)}% of the Sun covered`
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
    ...extra,
  }
}



// LUNAR ECLIPSES

function lunarEvent(eclipse, place, observer) {
  const peak = eclipse.peak.date
  const shadow = eclipse.kind === 'penumbral' ? eclipse.sd_penum : eclipse.sd_partial
  const here = upDuring('Moon', minutesFrom(peak, -shadow), minutesFrom(peak, shadow), observer)
  const under = underBody('Moon', peak)
  const time = date => clock(date, place.timeZone)
  const words = LUNAR[eclipse.kind]

  const rows = [
    ['Begins', time(minutesFrom(peak, -eclipse.sd_penum))],
    eclipse.sd_partial > 0 && ['Shadow bite begins', time(minutesFrom(peak, -eclipse.sd_partial))],
    eclipse.sd_total > 0 && ['Totality', `${time(minutesFrom(peak, -eclipse.sd_total))}–${time(minutesFrom(peak, eclipse.sd_total))}`],
    ['Greatest', time(peak)],
    ['Ends', time(minutesFrom(peak, eclipse.sd_penum))],
    here && ['Moon', moonDuring(minutesFrom(peak, -shadow), minutesFrom(peak, shadow), observer, time)],
  ].filter(Boolean)

  return base('lunar-eclipse', peak, place, {
    span: { from: minutesFrom(peak, -eclipse.sd_penum), to: minutesFrom(peak, eclipse.sd_penum) },
    icon: 'lunar-eclipse',
    short: words.name.replace(' eclipse', ''),
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
  const elsewhere = local && local.kind !== eclipse.kind && center ? ` ${SOLAR[eclipse.kind].replace(' solar eclipse', '')} near ${center}.` : ''

  const rows = local ? [
    ['Begins', time(local.partial_begin.time.date)],
    local.total_begin && [kind === 'annular' ? 'Ring of Sun' : 'Totality', `${time(local.total_begin.time.date)}–${time(local.total_end.time.date)}`],
    ['Greatest', `${time(local.peak.time.date)}, ${covered(local.obscuration)}`],
    ['Ends', time(local.partial_end.time.date)],
  ].filter(Boolean) : [
    ['Greatest', time(peak)],
    ['Where', center ? `Centered over ${center}` : 'Near the poles'],
  ]

  return base('solar-eclipse', local ? local.peak.time.date : peak, place, {
    span: local ? { from: local.partial_begin.time.date, to: local.partial_end.time.date } : null,
    icon: 'solar-eclipse',
    short: SOLAR[kind].replace(' solar eclipse', ' eclipse'),
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
        icon: 'transit',
        short: `${body} crosses the Sun`,
        name: `${body} crosses the Sun`,
        note: `${body} passes in front of the Sun as a small black dot. Watch only through a telescope with a proper solar filter.`,
        here,
        where: here ? null : `Seen where the Sun is up, centered over ${regionOf(sun.lat, sun.lon)}.`,
        rows: [['Begins', time(transit.start.date)], ['Middle', time(transit.peak.date)], ['Ends', time(transit.finish.date)]],
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
