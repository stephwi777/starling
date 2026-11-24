import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePlace } from '../place/usePlace.js'
import { useNow } from '../sky/useNow.js'
import { localParts } from '../sky/night.js'
import { dayKey } from '../sky/calendar/skyTools.js'
import { leavesOnClose, monthEvents, shownEvents } from '../sky/calendar/monthEvents.js'
import { isFavorite } from '../sky/calendar/favorites.js'
import useMedia from '../hooks/useMedia.js'
import useCalendarSettings from '../components/calendar/useCalendarSettings.js'
import useFavorites from '../components/calendar/useFavorites.js'
import useNextMatch from '../components/calendar/useNextMatch.js'
import useExit from '../components/ui/useExit.js'
import useComets from '../sky/calendar/useComets.js'
import { cometNotes, cometSeason } from '../sky/calendar/cometEvents.js'
import KindList from '../components/calendar/KindList.jsx'
import WorldSwitch from '../components/calendar/WorldSwitch.jsx'
import SearchBox from '../components/calendar/SearchBox.jsx'
import MonthGrid from '../components/calendar/MonthGrid.jsx'
import EventRow from '../components/calendar/EventRow.jsx'
import EventCard from '../components/calendar/EventCard.jsx'
import { eventDate, shortDate } from '../components/calendar/dates.js'
import { shadedRange } from '../components/calendar/shadedRange.js'
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
      <path d="M2 4 H14 M4.5 8 H11.5 M7 12 H9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}



// DAY LIST

function DayList({ day, events, favorites, south, onPick }) {
  return (
    <section className="day-list" aria-labelledby="day-list-title" aria-live="polite">
      <h2 id="day-list-title">{eventDate({ day })}</h2>

      {events.length ? (
        <ul className="event-rows">
          {events.map(event => <li key={event.id}><EventRow event={event} south={south} favorite={isFavorite(event, favorites)} onPick={onPick} /></li>)}
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
  const panel = useExit(choosing)
  const [slide, setSlide] = useState(null)
  const settings = useCalendarSettings()
  const { favorites, toggle } = useFavorites()
  const narrow = useMedia(NARROW)
  const wide = !useMedia(SIDEBAR)
  const roomy = useMedia(ROOMY)
  const chooser = useRef(null)
  const south = place.latitude < 0

  const comets = useComets()
  const all = useMemo(() => monthEvents(place, shown.year, shown.month, comets), [place, shown.year, shown.month, comets])
  const cometInfo = useMemo(() => {
    const { comets: list, status, now } = comets

    return cometNotes(status, status === 'ready' ? cometSeason(list, place, now) : [], settings.kinds)
  }, [place, comets, settings.kinds])
  const pickedId = picked?.event.id
  const refocus = useRef(false)

  useEffect(() => {
    if (picked || !refocus.current) return

    refocus.current = false

    if (document.activeElement && document.activeElement !== document.body) return

    const spot = document.querySelector('.month-days [tabindex="0"]') ?? document.querySelector('.month-title-button')

    spot?.focus({ preventScroll: true })
  }, [picked])
  const filters = { kinds: settings.kinds, world: settings.world, query, favorites, favoritesOnly: settings.favoritesOnly, keep: pickedId }
  const events = shownEvents(all, filters)
  const dayEvents = events.filter(event => event.day === selected)
  const next = useNextMatch({ place, query, shown, current: { year: current.year, month: current.month }, today, filters, comets })
  const count = events.length
  const lead = count ? `${count} ${count === 1 ? 'match' : 'matches'} this month.` : next.status === 'none' ? 'No matches in the next three years.' : 'No matches this month.'
  const matchNote = query ? (
    <p className="calendar-note" role="status">
      {lead}
      {next.status === 'looking' && ' Looking further ahead…'}
      {next.status === 'found' && (
        <> <button type="button" className="next-match" onClick={goToMatch}>{count ? 'Next after this month' : 'Next'}: {next.match.name} · {shortDate(next.match, today)} <span aria-hidden="true">→</span></button></>
      )}
    </p>
  ) : null

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

    if (!event && wanted.current.startsWith('comet-') && comets.status === 'loading') return

    wanted.current = null

    if (!event) return

    setSelected(event.day)
    setPicked({ event, anchor: document.querySelector(`[data-event="${CSS.escape(event.id)}"]`) })
  }, [all, comets.status])

  function move(delta) {
    const next = shift(shown, delta)

    setShown(next)
    setSlide(delta > 0 ? 'next' : 'prev')
    setSelected(`${next.year}-${String(next.month).padStart(2, '0')}-01`)
  }

  function goToMatch() {
    if (!next.match) return

    const [year, month] = next.match.day.split('-').map(Number)

    wanted.current = next.match.id
    setShown({ year, month })
    setSlide(null)
  }

  function closeCard() {
    const leaving = picked?.event

    setPicked(null)

    refocus.current = Boolean(leaving) && leavesOnClose(leaving, all, filters)
  }

  function jump(year, month) {
    setShown({ year, month })
    setSlide(null)
    setSelected(`${year}-${String(month).padStart(2, '0')}-01`)
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

  const pick = (event, anchor) => {
    setPicked({ event, anchor })
  }

  const list = <KindList id="kind-list" kinds={settings.kinds} favoritesOnly={settings.favoritesOnly} favoriteCount={favorites.length} toggleKind={settings.toggleKind} setGroup={settings.setGroup} setFavoritesOnly={settings.setFavoritesOnly} suggest={settings.suggest} groupNotes={{ comet: cometInfo.group }} kindNotes={cometInfo.kinds} />

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

      {panel.shown && <div className={panel.leaving ? 'choose-panel leaving' : 'choose-panel'}>{list}</div>}
    </div>
  )

  const tools = (
    <div className="calendar-controls">
      {!roomy && choose}

      <SearchBox query={query} setQuery={setQuery} onSubmit={goToMatch} />

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
              favorites={favorites}
              today={today}
              selected={selected}
              narrow={narrow}
              south={south}
              range={shadedRange({ picked: picked?.event, dayEvents, narrow })}
              tools={tools}
              slide={slide}
              onMonth={move}
              onToday={goToday}
              onJump={jump}
              onDay={setSelected}
              onPick={pick}
            />

            {!wide && matchNote}

            {narrow && <DayList day={selected} events={dayEvents} favorites={favorites} south={south} onPick={pick} />}
          </div>
        </div>

        {wide && matchNote}



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
          favorites={favorites}
          onFavorite={toggle}
          onClose={closeCard}
        />
      )}
    </main>
  )
}

export default Calendar
