import { wholeHours } from './hours.js'
import { clock } from './words.js'



// SCALE

const LEVELS = [
  { below: 10, value: 'Excellent', line: 'Very steady air. Great for telescopes!' },
  { below: 20, value: 'Good', line: 'Steady air. Good for telescopes.' },
  { below: 30, value: 'Average', line: 'Stars will twinkle a little.' },
  { below: 40, value: 'Poor', line: 'Stars will twinkle a lot.' },
  { below: Infinity, value: 'Bad', line: 'Shaky air will blur the view.' },
]

const UNKNOWN = { score: 0, value: 'No forecast', line: 'It isn’t available right now.', best: null }

function level(jet) {
  return LEVELS.findIndex(step => jet < step.below)
}



// SEEING WORDS

export function seeingWords({ night, jets, status, timeZone }) {
  const hours = wholeHours(night)

  if (!hours.length) return { score: 0, value: 'No night', line: 'The Sun doesn’t set tonight.', best: null }
  if (!jets) return status === 'loading' ? { score: 0, value: 'Loading', line: 'Getting the seeing forecast.', best: null } : UNKNOWN

  const pool = hours.some(hour => hour.dark) ? hours.filter(hour => hour.dark) : hours
  const known = pool
    .map(hour => ({ time: hour.time, jet: jets[hour.hour] }))
    .filter(hour => hour.jet !== null && hour.jet !== undefined)

  if (!known.length) return UNKNOWN

  const average = known.reduce((sum, hour) => sum + hour.jet, 0) / known.length
  const calmest = known.reduce((best, hour) => (hour.jet < best.jet ? hour : best))
  const roughest = known.reduce((worst, hour) => (hour.jet > worst.jet ? hour : worst))
  const step = LEVELS[level(average)]

  return {
    score: LEVELS.length - level(average),
    value: step.value,
    line: step.line,
    best: level(roughest.jet) - level(calmest.jet) >= 2 ? `Steadiest around ${clock(calmest.time, timeZone)}.` : null,
  }
}
