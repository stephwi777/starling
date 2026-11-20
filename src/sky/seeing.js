import { wholeHours } from './hours.js'
import { clock } from './words.js'



// SCALE

export const SEEING = [
  null,
  { value: 'Bad', line: 'Shaky air will blur the view.', best: 'Wide views with binoculars' },
  { value: 'Poor', line: 'Stars will twinkle a lot.', best: 'Wide views with binoculars' },
  { value: 'Average', line: 'Stars will twinkle a little.', best: 'The Moon and bright objects' },
  { value: 'Good', line: 'Steady air. Good for telescopes.', best: 'Moon and planets' },
  { value: 'Excellent', line: 'Very steady air. Great for telescopes!', best: 'Planet detail, close double stars' },
]

const JET = [10, 20, 30, 40]
const LAYERS = [10, 18]
const GUSTS = [7, 11]

const UNKNOWN = { score: 0, value: 'No forecast', line: 'It isn’t available right now.', best: null }



// LAYERS

function vector(speed, direction) {
  const angle = (direction * Math.PI) / 180

  return [speed * Math.sin(angle), speed * Math.cos(angle)]
}

export function shearOf(speeds, directions) {
  if ([...speeds, ...directions].some(value => value === null || value === undefined)) return null

  const vectors = speeds.map((speed, i) => vector(speed, directions[i]))

  return Math.max(...vectors.slice(1).map(([x, y], i) => Math.hypot(x - vectors[i][0], y - vectors[i][1])))
}



// SCORE

function steps(value, limits) {
  return value === null || value === undefined ? 0 : limits.filter(limit => value >= limit).length
}

export function levelsOf(air) {
  return { jet: steps(air.jet, JET), layers: steps(air.shear, LAYERS), ground: steps(air.gust, GUSTS) }
}

export function hourScore(air) {
  const { jet, layers, ground } = levelsOf(air)

  return Math.max(1, Math.min(5, 5 - jet - layers - ground))
}



// SEEING WORDS

export function seeingWords({ night, air, status, timeZone }) {
  const hours = wholeHours(night)

  if (!hours.length) return { score: 0, value: 'No night', line: 'The Sun doesn’t set tonight.', best: null }
  if (!air) return status === 'loading' ? { score: 0, value: 'Loading', line: 'Getting the seeing forecast.', best: null } : UNKNOWN

  const pool = hours.some(hour => hour.dark) ? hours.filter(hour => hour.dark) : hours
  const known = pool
    .filter(hour => air[hour.hour])
    .map(hour => ({ time: hour.time, score: hourScore(air[hour.hour]) }))

  if (!known.length) return UNKNOWN

  const score = Math.round(known.reduce((sum, hour) => sum + hour.score, 0) / known.length)
  const steadiest = known.reduce((best, hour) => (hour.score > best.score ? hour : best))
  const shakiest = known.reduce((worst, hour) => (hour.score < worst.score ? hour : worst))

  return {
    score,
    value: SEEING[score].value,
    line: SEEING[score].line,
    best: steadiest.score - shakiest.score >= 2 ? `Steadiest around ${clock(steadiest.time, timeZone)}.` : null,
  }
}



// ROWS

const JET_WORDS = ['Calm', 'Light', 'Moderate', 'Strong', 'Very strong']
const LAYER_WORDS = ['Smooth', 'Some churning', 'Churning']
const LAYER_NOTES = ['moving together', 'some sliding past each other', 'tumbling into each other']
const GROUND_WORDS = ['Steady', 'Gusty', 'Very gusty']

function speedWords(country) {
  return country === 'US'
    ? { speed: metres => `${Math.round(metres * 2.237)} mph`, height: '34,000 ft up' }
    : { speed: metres => `${Math.round(metres * 3.6)} km/h`, height: '10 km up' }
}

export function seeingRows(air, country) {
  const { jet, layers, ground } = levelsOf(air)
  const { speed, height } = speedWords(country)
  const wind = air.wind === null ? null : speed(air.wind)
  const gust = air.gust === null ? null : speed(air.gust).replace(/ .*/, '')

  return {
    jet: { value: JET_WORDS[jet], note: `${speed(air.jet)}, ${height}` },
    layers: air.shear === null ? { value: '—', note: null } : { value: LAYER_WORDS[layers], note: LAYER_NOTES[layers] },
    ground: air.gust === null ? { value: '—', note: wind } : { value: GROUND_WORDS[ground], note: `${wind ?? '—'}, gusts ${gust}` },
  }
}
