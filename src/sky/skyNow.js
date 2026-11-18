import * as Astronomy from 'astronomy-engine'
import { observerFor } from './night.js'
import { positionAt } from './tracks.js'
import { hourKey } from './weather.js'
import { clock } from './words.js'



// CLOUDS NOW

function cloudsAt(forecast, date, timeZone) {
  if (!forecast) return null

  const row = forecast.hourly.time.indexOf(hourKey(date, timeZone))

  return row === -1 ? null : forecast.hourly.cloud_cover[row] ?? null
}



// SKY NOW

export function skyNow(place, now, forecast) {
  const observer = observerFor(place)

  return {
    sunAlt: positionAt({ body: 'Sun' }, now, observer).alt,
    moonAlt: positionAt({ body: 'Moon' }, now, observer).alt,
    moonLit: Astronomy.Illumination('Moon', now).phase_fraction,
    moonAngle: Astronomy.MoonPhase(now),
    cloudCover: cloudsAt(forecast, now, place.timeZone),
  }
}



// DAYTIME LINE

const TONIGHT = {
  Clear: 'Tonight looks clear!',
  Patchy: 'Tonight looks patchy.',
  Cloudy: 'Tonight looks cloudy.',
}

export function daytimeLine(sunset, word, timeZone) {
  return `The Sun sets at ${clock(sunset, timeZone)}. ${TONIGHT[word] ?? 'Check back after dark!'}`
}
