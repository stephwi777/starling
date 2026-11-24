import { monthEvents, shownEvents } from './monthEvents.js'



// SETTINGS

const LIMIT = 36
export const PAUSE = 300



// MONTHS

const after = ({ year, month }) => (month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 })
const order = ({ year, month }) => year * 12 + month

export function searchStart(shown, current) {
  const next = after(shown)

  return order(next) >= order(current) ? next : current
}



// SEARCH

export function* matchSearch(place, start, filters, comets, limit = LIMIT, today = '') {
  let at = start

  for (let step = 1; step <= limit; step++) {
    const found = shownEvents(monthEvents(place, at.year, at.month, comets), filters).filter(event => event.day >= today)

    if (found.length) {
      yield { match: found.reduce((first, event) => (event.date < first.date ? event : first)) }
      return
    }

    yield step === limit ? { match: null, done: true } : { match: null }
    at = after(at)
  }
}



// STEPPING

export function runSearch(search, report, delay = PAUSE) {
  let timer = null

  const step = () => {
    const { value, done } = search.next()

    if (done || value.done) return report({ status: 'none', match: null })
    if (value.match) return report({ status: 'found', match: value.match })

    report({ status: 'looking', match: null })
    timer = setTimeout(step, 0)
  }

  timer = setTimeout(step, delay)

  return () => clearTimeout(timer)
}
