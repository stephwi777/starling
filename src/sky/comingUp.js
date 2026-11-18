import * as Astronomy from 'astronomy-engine'
import { SHOWERS } from './catalog/showers.js'



// WORDS

const DAY = 24 * 60 * 60 * 1000

const QUARTERS = [
  { kind: 'new-moon', name: 'New moon', note: 'The darkest skies of the month' },
  { kind: 'first-quarter', name: 'First quarter Moon', note: 'Half lit, high in the evening' },
  { kind: 'full-moon', name: 'Full moon', note: 'Rises around sunset' },
  { kind: 'last-quarter', name: 'Last quarter Moon', note: 'Half lit, rises after midnight' },
]



// MOON PHASES

function moonPhases(now, end) {
  const events = []
  let quarter = Astronomy.SearchMoonQuarter(now)

  while (quarter.time.date <= end) {
    events.push({ date: quarter.time.date, ...QUARTERS[quarter.quarter] })
    quarter = Astronomy.NextMoonQuarter(quarter)
  }

  return events
}



// SHOWER PEAKS

function showerPeaks(now, end) {
  const year = now.getUTCFullYear()

  return SHOWERS.flatMap(shower => {
    const [month, day] = shower.peak.split('-').map(Number)

    return [year, year + 1]
      .map(y => new Date(Date.UTC(y, month - 1, day, 6)))
      .filter(date => date > now && date <= end)
      .map(date => ({ date, kind: 'shower', name: `${shower.name} peak`, note: `Up to ${shower.zhr} meteors an hour` }))
  })
}



// COMING UP

export function comingUp(now, { days = 30, count = 3 } = {}) {
  const end = new Date(now.getTime() + days * DAY)

  return [...moonPhases(now, end), ...showerPeaks(now, end)]
    .sort((a, b) => a.date - b.date)
    .slice(0, count)
}
