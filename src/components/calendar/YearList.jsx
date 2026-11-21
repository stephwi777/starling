import { useEffect, useState } from 'react'
import { monthEvents, monthsFrom, shownEvents } from '../../sky/calendar/monthEvents.js'
import EventRow from './EventRow.jsx'



// SETTINGS

const MONTHS = 12



// HELPERS

function monthName(year, month) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(Date.UTC(year, month - 1, 15))
}



// YEAR LIST

function YearList({ place, start, filters, south, onPick }) {
  const [open, setOpen] = useState(false)
  const [months, setMonths] = useState([])
  const placeKey = `${place.latitude},${place.longitude},${place.timeZone}`

  useEffect(() => {
    if (!open) return

    const list = monthsFrom(start.year, start.month, MONTHS)
    const done = []
    let timer

    const step = () => {
      const next = list[done.length]

      done.push({ ...next, events: monthEvents(place, next.year, next.month) })
      setMonths([...done])

      if (done.length < list.length) timer = setTimeout(step, 0)
    }

    timer = setTimeout(step, 0)

    return () => clearTimeout(timer)
  }, [open, placeKey, start.year, start.month])

  const working = open && months.length < MONTHS

  return (
    <details className="year-list" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>
        <span>All events, month by month</span>
        <small>The next 12 months</small>
      </summary>

      {months.map(({ year, month, events }) => {
        const shown = shownEvents(events, filters)

        return (
          <section key={`${year}-${month}`} className="year-month" aria-label={monthName(year, month)}>
            <h3>{monthName(year, month)}</h3>

            {shown.length ? (
              <ul className="event-rows">
                {shown.map(event => <li key={event.id}><EventRow event={event} south={south} dated onPick={onPick} /></li>)}
              </ul>
            ) : (
              <p className="calendar-note">Nothing that matches this month.</p>
            )}
          </section>
        )
      })}

      {working && <p className="calendar-note" role="status">Working out the rest of the year…</p>}
    </details>
  )
}

export default YearList
