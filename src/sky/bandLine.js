import { bestWindow, shortVerdict, windowEdges } from './best.js'
import { fallSentence, wetHours } from './hours.js'
import { STEP } from './night.js'
import { clock } from './words.js'



// TIMING

const HOUR = 60 * 60 * 1000
const PER_HOUR = HOUR / STEP



// BAND LINE

export function bandLine({ night, clouds, falls, best, timeZone }) {
  const { hours, wet, word } = wetHours(night, falls)

  if (!wet.length) return shortVerdict({ night, clouds, best, timeZone })
  if (wet.length === hours.length) return fallSentence(night, falls, timeZone)

  const first = wet[0]
  const last = wet.at(-1)
  const together = last.hour - first.hour + 1 === wet.length
  const dry = clouds ? clouds.map((cover, h) => (falls[h] ? 100 : cover)) : null
  const clear = together ? bestWindow(night, dry) : null
  const end = new Date(last.time.getTime() + HOUR)

  if (clear && first === hours[0] && clear.from <= (last.hour + 1) * PER_HOUR) {
    return `${word} likely until ${clock(end, timeZone)}, then clear and dark until ${clock(windowEdges(night, clear).to, timeZone)}.`
  }

  if (clear && last === hours.at(-1) && clear.to + 1 >= first.hour * PER_HOUR) {
    return `Clear and dark until ${clock(first.time, timeZone)}, then ${word.toLowerCase()} likely.`
  }

  return fallSentence(night, falls, timeZone)
}
