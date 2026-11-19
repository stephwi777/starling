import * as Astronomy from 'astronomy-engine'
import { clock } from './words.js'



// SETTINGS

const DAY = 24 * 60 * 60 * 1000



// TIMING

export function moonCrossings(moon, night) {
  const from = night.sunset ?? night.start
  const to = night.sunrise ?? night.end
  const steps = night.times.flatMap((time, i) => (time >= from && time <= to ? [{ time, up: moon.track[i].alt > 0 }] : []))
  let rise = null
  let set = null

  for (let i = 1; i < steps.length; i++) {
    if (rise === null && !steps[i - 1].up && steps[i].up) rise = steps[i].time
    if (set === null && steps[i - 1].up && !steps[i].up) set = steps[i].time
  }

  return { upAtSunset: steps[0].up, rise, set }
}

export function moonTiming(moon, night, timeZone) {
  const { upAtSunset, rise, set } = moonCrossings(moon, night)

  if (upAtSunset) return set === null ? 'Up all night' : `Sets at ${clock(set, timeZone)}`
  if (rise === null) return 'Not up tonight'
  if (set !== null) return `Up ${clock(rise, timeZone)} to ${clock(set, timeZone)}`

  return `Rises at ${clock(rise, timeZone)}`
}



// FULL MOON

export function nextFull(night, timeZone) {
  const full = Astronomy.SearchMoonPhase(180, night.noon, 40).date

  if (full.getTime() < night.noon.getTime() + DAY) return 'Full tonight!'

  return `Full ${new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric' }).format(full)}`
}
