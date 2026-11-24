import { useEffect, useRef, useState } from 'react'
import { monthEvents, monthsFrom, shownEvents } from '../../sky/calendar/monthEvents.js'
import { isFavorite } from '../../sky/calendar/favorites.js'
import { calendarFile } from '../../sky/calendar/ics.js'
import { download, eventLink } from './download.js'
import EventRow from './EventRow.jsx'
import useComets from '../../sky/calendar/useComets.js'



// SETTINGS

const MONTHS = 12



// HELPERS

function monthName(year, month) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(Date.UTC(year, month - 1, 15))
}



// STICK LINE

function stickLine() {
  const header = document.querySelector('.header')

  return getComputedStyle(header).position === 'fixed' ? header.offsetHeight : 0
}



// YEAR LIST

function YearList({ place, start, filters, south, onPick }) {
  const [open, setOpen] = useState(false)
  const [months, setMonths] = useState([])
  const loaded = useRef('')
  const { version } = useComets()
  const [stuck, setStuck] = useState(false)
  const cap = useRef(null)

  useEffect(() => {
    let watcher

    function watch() {
      const line = stickLine()

      watcher?.disconnect()
      watcher = new IntersectionObserver(([entry]) => {
        setStuck(entry.isIntersecting && entry.intersectionRatio < 1 && entry.boundingClientRect.top < line + 2)
      }, { rootMargin: `${-line - 2}px 0px 0px 0px`, threshold: [0, 1] })
      watcher.observe(cap.current)
    }

    watch()
    window.addEventListener('resize', watch)

    return () => {
      watcher.disconnect()
      window.removeEventListener('resize', watch)
    }
  }, [])

  useEffect(() => {
    const key = `${place.latitude},${place.longitude},${place.timeZone}|${start.year}-${start.month}|c${version}`

    if (!open || loaded.current === key) return

    const list = monthsFrom(start.year, start.month, MONTHS)
    const done = []
    let timer

    const step = () => {
      const next = list[done.length]

      done.push({ ...next, events: monthEvents(place, next.year, next.month) })
      setMonths([...done])

      if (done.length < list.length) timer = setTimeout(step, 0)
      else loaded.current = key
    }

    timer = setTimeout(step, 0)

    return () => clearTimeout(timer)
  }, [open, place, start.year, start.month, version])

  const working = open && months.length < MONTHS
  const everything = months.flatMap(({ events }) => shownEvents(events, filters))

  function addAll() {
    download('starling-sky-events.ics', calendarFile(everything, { place, linkFor: eventLink, remind: event => isFavorite(event, filters.favorites ?? []) }))
  }

  return (
    <details className="year-list" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>
        <span>All events by month</span>
        <small>Next 12 months</small>
      </summary>

      <div className={stuck ? 'year-cap stuck' : 'year-cap'} ref={cap} aria-hidden="true" />

      {(working || everything.length > 0) && (
        <div className="year-actions">
          <button type="button" className="soft-button" disabled={working} onClick={addAll}>Add all to your calendar</button>
          <p>Works with Apple, Google and Outlook. Follows your checklist and search.</p>
        </div>
      )}

      {months.map(({ year, month, events }) => {
        const shown = shownEvents(events, filters)

        return (
          <div key={`${year}-${month}`} className="year-month">
            <h3>{monthName(year, month)}</h3>

            {shown.length ? (
              <ul className="event-rows">
                {shown.map(event => <li key={event.id}><EventRow event={event} south={south} dated favorite={isFavorite(event, filters.favorites ?? [])} onPick={onPick} /></li>)}
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
