import { clock } from './words.js'



// BEST WINDOW

function isGood(night, clouds, i) {
  if (night.sun[i] >= -18) return false
  if (!clouds) return true

  const hour = Math.min(Math.floor(i / 6), clouds.length - 1)

  return clouds[hour] !== null && clouds[hour] < 40
}

export function bestWindow(night, clouds) {
  let best = null
  let run = null

  night.times.forEach((_, i) => {
    const good = isGood(night, clouds, i)

    if (good && !run) run = { from: i, to: i }
    if (good) run.to = i

    if ((!good || i === night.times.length - 1) && run) {
      if (!best || run.to - run.from > best.to - best.from) best = run
      run = null
    }
  })

  return best && best.to - best.from >= 3 ? best : null
}



// VERDICT

function windowTimes(night, best, timeZone) {
  const last = night.times.length - 1
  const atDusk = best.from === 0 || night.sun[best.from - 1] >= -18
  const atDawn = best.to === last || night.sun[best.to + 1] >= -18
  const from = atDusk ? night.astroDusk : night.times[best.from]
  const to = atDawn ? night.astroDawn : night.times[best.to + 1]

  return { from: clock(from, timeZone), to: clock(to, timeZone) }
}

function brightestPlanet(planets, best) {
  const middle = Math.round((best.from + best.to) / 2)

  return planets
    .filter(planet => planet.gear === 1 && planet.track[middle].alt > 15)
    .sort((a, b) => a.mag - b.mag)[0]
}

export function verdict({ night, clouds, best, planets, timeZone }) {
  if (!night.astroDusk) return 'It doesn’t get fully dark tonight.'

  if (!best) {
    const known = (clouds ?? []).filter(value => value !== null)
    const average = known.reduce((sum, value) => sum + value, 0) / (known.length || 1)

    if (average > 70) return 'Cloudy all night. A good night to plan instead.'

    return 'Clouds come and go all night. Watch for clear breaks.'
  }

  const { from, to } = windowTimes(night, best, timeZone)

  if (!clouds) return `Dark from ${from} to ${to}. Check the sky for clouds.`

  const moon = night.moonLit > 0.6 ? ', but the Moon is bright' : ''
  const planet = brightestPlanet(planets, best)
  const extra = planet ? ` ${planet.name} is the brightest planet up.` : ''

  return `Clear and dark from ${from} to ${to}${moon}.${extra}`
}
