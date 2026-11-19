import { STEP } from './night.js'
import { cloudKind, wholeHours } from './hours.js'
import { clock } from './words.js'



// SETTINGS

const HOUR = 60 * 60 * 1000



// WORDS

const KINDS = {
  clear: 'Clear',
  patchy: 'Patchy',
  cloudy: 'Cloudy',
}

const MEANINGS = {
  clear: 'A clear view of the stars.',
  patchy: 'Stars will peek through gaps.',
  cloudy: 'Clouds will hide most stars.',
}

const UNKNOWN = { value: 'No forecast', line: 'It isn’t available right now.' }



// MOSTLY

const ORDER = ['cloudy', 'patchy', 'clear']

function mostly(hours) {
  const count = kind => hours.filter(hour => hour.kind === kind).length
  const kinds = ORDER.filter(kind => count(kind) > 0)

  if (kinds.length === 1) return kinds[0]

  const top = kinds.reduce((best, kind) => (count(kind) > count(best) ? kind : best))

  return `mostly ${top}`
}



// CLOUD WORDS

export function cloudWords({ night, clouds, status, timeZone }) {
  const hours = wholeHours(night)

  if (!hours.length) return { value: 'No night', line: 'The Sun doesn’t set tonight.' }
  if (!clouds) return status === 'loading' ? { value: 'Loading', line: 'Getting the cloud forecast.' } : UNKNOWN

  const pool = hours.some(hour => hour.dark) ? hours.filter(hour => hour.dark) : hours
  const known = pool
    .map(hour => ({ time: hour.time, kind: cloudKind(clouds[hour.hour]) }))
    .filter(hour => hour.kind)

  if (!known.length) return UNKNOWN

  const start = known[0].kind
  const change = known.findIndex(hour => hour.kind !== start)

  if (change === -1) return { value: `${KINDS[start]} all night`, line: MEANINGS[start] }

  const rest = known.slice(change)
  const back = rest.findIndex(hour => hour.kind === start)
  const middle = back === -1 ? rest : rest.slice(0, back)
  const until = back === -1 ? 'dawn' : clock(rest[back].time, timeZone)

  return {
    value: `${KINDS[start]} till ${clock(known[change].time, timeZone)}`,
    line: `Then ${mostly(middle)} until ${until}.`,
  }
}



// CLOUD BARS

export function cloudBars(night, clouds, nowIndex) {
  const nowHour = nowIndex === null ? null : Math.round((nowIndex * STEP) / HOUR)

  return wholeHours(night).map(({ hour }) => {
    const cover = clouds?.[hour] ?? null

    return { cover, kind: cloudKind(cover), now: hour === nowHour }
  })
}
