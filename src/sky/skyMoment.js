import * as Astronomy from 'astronomy-engine'
import { MOON } from './catalog/planets.js'
import { positionAt } from './tracks.js'



// TIMING

const HOUR = 60 * 60 * 1000

const SUN = { body: 'Sun' }



// MOMENT

function darkest(night) {
  return night.times[night.sun.indexOf(Math.min(...night.sun))]
}

function afterSunset(night, now) {
  return night.sunset && night.sunrise && now >= night.sunset && now < night.sunrise
}

export function skyMoment(night, now) {
  const polarNight = !night.sunset && !night.sunrise && Math.max(...night.sun) < 0

  if (polarNight || afterSunset(night, now)) return now

  return night.astroDusk ?? darkest(night)
}



// CONDITIONS

export function skyConditions({ night, moment, observer, clouds, falls, south = false }) {
  const hour = Math.floor((moment - night.start) / HOUR)

  return {
    sunAlt: positionAt(SUN, moment, observer).alt,
    moonAlt: positionAt(MOON, moment, observer).alt,
    moonLit: Astronomy.Illumination('Moon', moment).phase_fraction,
    moonAngle: Astronomy.MoonPhase(moment),
    cloudCover: clouds?.[hour] ?? null,
    fall: falls?.[hour] ?? null,
    morning: moment > night.midnight,
    twilightAllNight: !night.astroDusk,
    south,
  }
}
