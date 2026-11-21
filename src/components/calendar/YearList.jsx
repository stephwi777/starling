import { useEffect, useState } from 'react'
import { monthEvents, monthsFrom, shownEvents } from '../../sky/calendar/monthEvents.js'
import { calendarFile } from '../../sky/calendar/ics.js'
import { download, eventLink } from './download.js'
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
  }, [open, place, start.year, start.month])

  const working = open && months.length < MONTHS
  const everything = months.flatMap(({ events }) => shownEvents(events, filters))

  function addAll() {
    download('starling-sky-events.ics', calendarFile(everything, { place, linkFor: eventLink }))
  }

  return (
    <details className="year-list" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>
        <span>All events, month by month</span>
        <small>The next 12 months</small>
      </summary>

      {open && !working && everything.length > 0 && (
        <div className="year-actions">
          <button type="button" onClick={addAll}>Add all {everything.length} to your calendar</button>
          <p>Downloads one file that Apple Calendar, Google Calendar and Outlook can open. It follows the checklist and search above.</p>
        </div>
      )}

      {months.map(({ year, month, events }) => {
        const shown = shownEvents(events, filters)

        return (
          <div key={`${year}-${month}`} className="year-month">
            <h3>{monthName(year, month)}</h3>

            {shown.length ? (
              <ul className="event-rows">
                {shown.map(event => <li key={event.id}><EventRow event={event} south={south} dated onPick={onPick} /></li>)}
              </ul>
            ) : (
              <p className="calendar-note">Nothing that matches this month.</p>
            )}
          </div>
        )
      })}

      {working && <p className="calendar-note" role="status">Working out the rest of the year…</p>}
    </details>
  )
}

export default YearList
