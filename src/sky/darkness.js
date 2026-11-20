import { STEP } from './night.js'
import { clock } from './words.js'



// DARK SPAN

export function darkSpan(night) {
  const dark = night.sun.map(alt => alt < -18)

  if (!dark.some(Boolean)) return null

  return {
    from: night.astroDusk ?? night.times[dark.indexOf(true)],
    to: night.astroDawn ?? new Date(night.times[dark.lastIndexOf(true)].getTime() + STEP),
  }
}



// DARKNESS

export function darknessWords(night, timeZone) {
  const span = darkSpan(night)

  if (night.sun.every(alt => alt > 0)) return { value: 'Daylight', line: 'The Sun doesn’t set tonight.' }
  if (!span) return { value: 'No full dark', line: 'Twilight lasts all night.' }
  if (night.sun.every(alt => alt < -18)) return { value: 'All night', line: 'Fully dark all night.' }

  return { value: clock(span.from, timeZone), line: `Fully dark until ${clock(span.to, timeZone)}.` }
}
