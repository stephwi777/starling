import { useMemo, useState } from 'react'
import { usePlace } from '../place/usePlace.js'
import { useNow } from '../sky/useNow.js'
import { localParts } from '../sky/night.js'
import { dayKey } from '../sky/calendar/skyTools.js'
import { monthEvents, shownEvents } from '../sky/calendar/monthEvents.js'
import useMedia from '../hooks/useMedia.js'
import useCalendarSettings from '../components/calendar/useCalendarSettings.js'
import KindList from '../components/calendar/KindList.jsx'
import WorldSwitch from '../components/calendar/WorldSwitch.jsx'
import MonthGrid from '../components/calendar/MonthGrid.jsx'
import EventRow from '../components/calendar/EventRow.jsx'
import EventCard, { eventDate } from '../components/calendar/EventCard.jsx'
import YearList from '../components/calendar/YearList.jsx'
import './Calendar.css'



// SETTINGS

const NARROW = '(max-width: 700px)'
const SIDEBAR = '(max-width: 1180px)'



// HELPERS

function shift({ year, month }, delta) {
  const index = year * 12 + month - 1 + delta

  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}



// DAY LIST

function DayList({ day, events, south, onPick }) {
  return (
    <section className="day-list" aria-labelledby="day-list-title" aria-live="polite">
      <h2 id="day-list-title">{eventDate({ day })}</h2>

      {events.length ? (
        <ul className="event-rows">
          {events.map(event => <li key={event.id}><EventRow event={event} south={south} onPick={onPick} /></li>)}
        </ul>
      ) : (
        <p className="calendar-note">Nothing on this day.</p>
      )}
    </section>
  )
}



// CALENDAR

function Calendar() {
  const { place, isSample } = usePlace()
  const now = useNow()
  const today = dayKey(now, place.timeZone)
  const current = localParts(now, place.timeZone)
  const [shown, setShown] = useState({ year: current.year, month: current.month })
  const [selected, setSelected] = useState(today)
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState(null)
  const [choosing, setChoosing] = useState(false)
  const settings = useCalendarSettings()
  const narrow = useMedia(NARROW)
  const sidebarHidden = useMedia(SIDEBAR)
  const south = place.latitude < 0

  const all = useMemo(() => monthEvents(place, shown.year, shown.month), [place, shown.year, shown.month])
  const filters = { kinds: settings.kinds, world: settings.world, query }
  const events = shownEvents(all, filters)
  const dayEvents = events.filter(event => event.day === selected)

  function move(delta) {
    const next = shift(shown, delta)

    setShown(next)
    setSelected(`${next.year}-${String(next.month).padStart(2, '0')}-01`)
  }

  function goToday() {
    setShown({ year: current.year, month: current.month })
    setSelected(today)
  }

  const pick = (event, anchor) => setPicked({ event, anchor })

  const list = <KindList id="kind-list" kinds={settings.kinds} toggleKind={settings.toggleKind} setGroup={settings.setGroup} suggest={settings.suggest} />

  return (
    <main className="calendar-page">
      <title>Calendar | Starling</title>

      <div className="calendar-inner">
        {/* TOP */}

        <div className="calendar-top">
          <div>
            <h1>Calendar</h1>
            <p>Every special sky event, from {place.name}{isSample ? ' (sample location)' : ''}.</p>
          </div>

          <div className="calendar-controls">
            <label className="calendar-search">
              <span className="visually-hidden">Search events</span>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M13 13 L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
              <input type="search" placeholder="Search events" value={query} onChange={event => setQuery(event.target.value)} />
            </label>

            <WorldSwitch world={settings.world} setWorld={settings.setWorld} />

            {sidebarHidden && (
              <button type="button" className="calendar-choose" aria-expanded={choosing} aria-controls="kind-list" onClick={() => setChoosing(open => !open)}>
                Choose events
              </button>
            )}
          </div>
        </div>

        {sidebarHidden && choosing && <div className="calendar-sheet">{list}</div>}



        {/* MONTH */}

        <div className="calendar-body">
          {!sidebarHidden && <aside className="calendar-side" aria-label="Kinds of events">{list}</aside>}

          <div>
            <MonthGrid
              year={shown.year}
              month={shown.month}
              events={events}
              today={today}
              selected={selected}
              narrow={narrow}
              south={south}
              onMonth={move}
              onToday={goToday}
              onDay={setSelected}
              onPick={pick}
            />

            {query && <p className="calendar-note" role="status">{events.length ? `${events.length} ${events.length === 1 ? 'match' : 'matches'} this month.` : 'No matches this month. The list below covers the whole year.'}</p>}

            {narrow && <DayList day={selected} events={dayEvents} south={south} onPick={pick} />}
          </div>
        </div>



        {/* YEAR */}

        <YearList place={place} start={{ year: current.year, month: current.month }} filters={filters} south={south} onPick={pick} />
      </div>

      {picked && (
        <EventCard
          key={picked.event.id}
          event={picked.event}
          anchor={picked.anchor}
          placeName={place.name}
          south={south}
          onClose={() => setPicked(null)}
        />
      )}
    </main>
  )
}

export default Calendar
