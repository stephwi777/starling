import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePlace } from '../place/usePlace.js'
import { useNow } from '../sky/useNow.js'
import { localParts } from '../sky/night.js'
import { dayKey } from '../sky/calendar/skyTools.js'
import { monthEvents, shownEvents } from '../sky/calendar/monthEvents.js'
import useMedia from '../hooks/useMedia.js'
import useCalendarSettings from '../components/calendar/useCalendarSettings.js'
import KindList from '../components/calendar/KindList.jsx'
import WorldSwitch from '../components/calendar/WorldSwitch.jsx'
import SearchBox from '../components/calendar/SearchBox.jsx'
import MonthGrid from '../components/calendar/MonthGrid.jsx'
import EventRow from '../components/calendar/EventRow.jsx'
import EventCard from '../components/calendar/EventCard.jsx'
import { eventDate } from '../components/calendar/dates.js'
import YearList from '../components/calendar/YearList.jsx'
import './Calendar.css'



// SETTINGS

const NARROW = '(max-width: 900px)'
const SIDEBAR = '(max-width: 1279px)'
const ROOMY = '(min-width: 1880px)'



// HELPERS

function shift({ year, month }, delta) {
  const index = year * 12 + month - 1 + delta

  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

function monthFrom(text) {
  const found = /^(\d{4})-(\d{2})$/.exec(text ?? '')
  const month = found && Number(found[2])

  return found && month >= 1 && month <= 12 ? { year: Number(found[1]), month } : null
}

const monthText = ({ year, month }) => `${year}-${String(month).padStart(2, '0')}`



// FILTER ICON

function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M2 4 H14 M4.5 8 H11.5 M7 12 H9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
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
  const [params, setParams] = useSearchParams()
  const [shown, setShown] = useState(() => monthFrom(params.get('month')) ?? { year: current.year, month: current.month })
  const [selected, setSelected] = useState(today)
  const wanted = useRef(params.get('event'))
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState(null)
  const [choosing, setChoosing] = useState(false)
  const [slide, setSlide] = useState(null)
  const settings = useCalendarSettings()
  const narrow = useMedia(NARROW)
  const wide = !useMedia(SIDEBAR)
  const roomy = useMedia(ROOMY)
  const chooser = useRef(null)
  const south = place.latitude < 0

  const all = useMemo(() => monthEvents(place, shown.year, shown.month), [place, shown.year, shown.month])
  const filters = { kinds: settings.kinds, world: settings.world, query }
  const events = shownEvents(all, filters)
  const dayEvents = events.filter(event => event.day === selected)
  const pickedId = picked?.event.id

  useEffect(() => {
    setParams(old => {
      const next = new URLSearchParams(old)

      next.set('month', monthText(shown))
      if (pickedId) next.set('event', pickedId)
      else if (!wanted.current) next.delete('event')

      return next
    }, { replace: true })
  }, [shown, pickedId, setParams])

  useEffect(() => {
    if (!wanted.current) return

    const event = all.find(item => item.id === wanted.current)

    wanted.current = null

    if (!event) return

    setSelected(event.day)
    setPicked({ event, anchor: document.querySelector(`[data-event="${CSS.escape(event.id)}"]`) })
  }, [all])

  function move(delta) {
    const next = shift(shown, delta)

    setShown(next)
    setSlide(delta > 0 ? 'next' : 'prev')
    setSelected(`${next.year}-${String(next.month).padStart(2, '0')}-01`)
  }

  function goToday() {
    const away = (shown.year - current.year) * 12 + shown.month - current.month

    setShown({ year: current.year, month: current.month })
    setSlide(away > 0 ? 'prev' : away < 0 ? 'next' : null)
    setSelected(today)
  }

  useEffect(() => {
    if (!choosing || roomy) return

    function away(event) {
      if (!narrow && !chooser.current.contains(event.target)) setChoosing(false)
    }

    function key(event) {
      if (event.key !== 'Escape') return

      setChoosing(false)
      chooser.current.querySelector('button').focus()
    }

    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)

    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [choosing, roomy, narrow])

  const pick = (event, anchor) => setPicked({ event, anchor })

  const list = <KindList id="kind-list" kinds={settings.kinds} toggleKind={settings.toggleKind} setGroup={settings.setGroup} suggest={settings.suggest} />

  const heading = (
    <div className="calendar-title">
      <h1>Calendar</h1>
      <p>Every special sky event, from {place.name}{isSample ? ' (sample location)' : ''}.</p>
    </div>
  )

  const choose = (
    <div className="calendar-chooser" ref={chooser}>
      <button type="button" className="calendar-choose soft-button" aria-expanded={choosing} aria-controls="kind-list" onClick={() => setChoosing(open => !open)}>
        <FilterIcon />Choose events
      </button>

      {choosing && <div className="choose-panel">{list}</div>}
    </div>
  )

  const tools = (
    <div className="calendar-controls">
      {!roomy && choose}

      <SearchBox query={query} setQuery={setQuery} />

      <WorldSwitch world={settings.world} setWorld={settings.setWorld} />
    </div>
  )

  return (
    <main className={['calendar-page', wide && 'wide', roomy && 'roomy'].filter(Boolean).join(' ')}>
      <title>Calendar | Starling</title>

      <div className="calendar-inner">
        {/* TITLE */}

        {!roomy && <div className="visually-hidden">{heading}</div>}



        {/* MONTH */}

        <div className="calendar-body">
          {roomy && (
            <div className="calendar-side">
              <div className="calendar-side-scroll">
                {heading}
                {list}
              </div>
            </div>
          )}

          <div className="calendar-main">
            <MonthGrid
              year={shown.year}
              month={shown.month}
              events={events}
              today={today}
              selected={selected}
              narrow={narrow}
              south={south}
              tools={tools}
              slide={slide}
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
          place={place}
          today={today}
          south={south}
          onClose={() => setPicked(null)}
        />
      )}
    </main>
  )
}

export default Calendar
