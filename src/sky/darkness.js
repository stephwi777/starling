import { STEP } from './night.js'
import { clock } from './words.js'



// DARKNESS

export function darknessWords(night, timeZone) {
  const dark = night.sun.map(alt => alt < -18)

  if (night.sun.every(alt => alt > 0)) return { value: 'Daylight', line: 'The Sun doesn’t set tonight.' }
  if (!dark.some(Boolean)) return { value: 'No full dark', line: 'Twilight lasts all night.' }
  if (dark.every(Boolean)) return { value: 'All night', line: 'Fully dark all night.' }

  const from = night.astroDusk ?? night.times[dark.indexOf(true)]
  const until = night.astroDawn ?? new Date(night.times[dark.lastIndexOf(true)].getTime() + STEP)

  return { value: clock(from, timeZone), line: `Fully dark until ${clock(until, timeZone)}.` }
}



// NOW

function timeLeft(minutes) {
  if (minutes < 60) return `${minutes} minutes left`

  const hours = Math.round(minutes / 60)

  return hours === 1 ? '1 hour left' : `${hours} hours left`
}

export function darkNow(night, index) {
  if (index === null) return null

  const alt = night.sun[index]
  const darkBefore = night.sun.slice(0, index).some(value => value < -18)
  const darkLater = night.sun.slice(index).some(value => value < -18)

  if (alt > 0) return 'The Sun is still up.'

  if (alt < -18) {
    const end = night.astroDawn ?? new Date(night.times[night.sun.findLastIndex(value => value < -18)].getTime() + STEP)

    return `Fully dark now, ${timeLeft(Math.round((end - night.times[index]) / 60000))}.`
  }

  if (darkLater && !darkBefore) return 'Evening twilight now.'
  if (darkBefore) return 'Morning twilight now.'

  return 'Twilight now.'
}
