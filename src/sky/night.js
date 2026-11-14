import * as Astronomy from 'astronomy-engine'



// SETTINGS

export const STEP = 10 * 60 * 1000

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR



// OBSERVER

export function observerFor(place) {
  return new Astronomy.Observer(place.latitude, place.longitude, 0)
}



// LOCAL TIME

function localParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(date)

  const value = type => Number(parts.find(part => part.type === type).value)

  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute') }
}

function localNoon(year, month, day, timeZone) {
  const guess = Date.UTC(year, month - 1, day, 12)
  const shown = localParts(new Date(guess), timeZone)
  const shift = (shown.hour - 12) * HOUR + shown.minute * 60000

  return new Date(guess - shift)
}

function floorHour(date, timeZone) {
  const { minute } = localParts(date, timeZone)

  return new Date(date.getTime() - minute * 60000 - (date.getTime() % 60000))
}

function ceilHour(date, timeZone) {
  const floored = floorHour(date, timeZone)

  return floored.getTime() === date.getTime() ? floored : new Date(floored.getTime() + HOUR)
}



// SUN

function sunAltitude(date, observer) {
  const equator = Astronomy.Equator('Sun', date, observer, true, true)

  return Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal').altitude
}

function search(found) {
  return found ? found.date : null
}



// TONIGHT

export function nightStart(place, now) {
  const observer = observerFor(place)
  const today = localParts(now, place.timeZone)
  const noon = localNoon(today.year, today.month, today.day, place.timeZone)
  const sunrise = search(Astronomy.SearchRiseSet('Sun', observer, 1, new Date(noon.getTime() - 12 * HOUR), 1))

  if (sunrise && now < sunrise) return new Date(noon.getTime() - DAY)

  return noon
}



// NIGHT

export function buildNight(place, index, now) {
  const observer = observerFor(place)
  const noon = new Date(nightStart(place, now).getTime() + index * DAY)
  const sunset = search(Astronomy.SearchRiseSet('Sun', observer, -1, noon, 1))
  const sunrise = sunset ? search(Astronomy.SearchRiseSet('Sun', observer, 1, sunset, 1)) : null
  const from = sunset ?? new Date(noon.getTime() + 6 * HOUR)
  const to = sunrise ?? new Date(noon.getTime() + 18 * HOUR)
  const start = floorHour(from, place.timeZone)
  const end = ceilHour(to, place.timeZone)
  const times = []

  for (let time = start.getTime(); time <= end.getTime(); time += STEP) {
    times.push(new Date(time))
  }

  const twilight = (direction, altitude) => search(Astronomy.SearchAltitude('Sun', observer, direction, from, 1, altitude))
  const middle = new Date(start.getTime() + 4 * HOUR)

  return {
    index,
    start,
    end,
    times,
    sun: times.map(time => sunAltitude(time, observer)),
    hours: Math.round((end - start) / HOUR),
    sunset,
    sunrise,
    civilDusk: twilight(-1, -6),
    nauticalDusk: twilight(-1, -12),
    astroDusk: twilight(-1, -18),
    astroDawn: twilight(1, -18),
    nauticalDawn: twilight(1, -12),
    civilDawn: twilight(1, -6),
    moonAngle: Astronomy.MoonPhase(middle),
    moonLit: Astronomy.Illumination('Moon', middle).phase_fraction,
  }
}



// UPCOMING NIGHTS

export function upcomingNights(place, now, count) {
  const first = nightStart(place, now)
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: place.timeZone })

  return Array.from({ length: count }, (_, index) => {
    const noon = new Date(first.getTime() + index * DAY)

    return {
      index,
      noon,
      date: date.format(noon),
      moonAngle: Astronomy.MoonPhase(new Date(noon.getTime() + 9 * HOUR)),
    }
  })
}
