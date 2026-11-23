import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Calendar.css'
import { DEFAULT_KINDS } from '../src/sky/calendar/kinds.js'
import { monthEvents, shownEvents } from '../src/sky/calendar/monthEvents.js'
import MonthGrid from '../src/components/calendar/MonthGrid.jsx'
import EventRow from '../src/components/calendar/EventRow.jsx'
import EventIcon from '../src/components/calendar/EventIcon.jsx'
import Tags from '../src/components/calendar/Tags.jsx'



// REAL EVENTS, KANSAS CITY

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const TODAY = '2026-12-01'

const filters = { kinds: DEFAULT_KINDS, world: false, query: '' }
const december = shownEvents(monthEvents(KC, 2026, 12), filters)

const isFavorite = event => event.id.startsWith('shower-Geminids') || event.kinds.includes('full-moon')
const favoriteIds = new Set(december.filter(isFavorite).map(event => event.id))
const geminids = december.find(event => event.id.startsWith('shower-Geminids'))
const rows = december.filter(event => event.day >= '2026-12-10').slice(0, 5)



// MARKING

function Marked({ children }) {
  const box = useRef(null)

  useEffect(() => {
    box.current.querySelectorAll('[data-event]').forEach(node => {
      if (favoriteIds.has(node.dataset.event)) node.classList.add('fav')
    })

    box.current.querySelectorAll('.day-button').forEach(day => {
      const date = day.dataset.key

      december.filter(event => event.day === date).slice(0, 2).forEach((event, index) => {
        if (favoriteIds.has(event.id)) day.querySelectorAll('.day-bars i')[index]?.classList.add('fav')
      })
    })
  })

  return <div ref={box}>{children}</div>
}

function Grid({ narrow }) {
  return (
    <MonthGrid
      year={2026}
      month={12}
      events={december}
      today={TODAY}
      selected={TODAY}
      narrow={narrow}
      south={false}
      onMonth={() => {}}
      onToday={() => {}}
      onDay={() => {}}
      onPick={() => {}}
    />
  )
}

function Rows() {
  return (
    <ul className="event-rows mock-rows">
      {rows.map(event => <li key={event.id}><EventRow event={event} south={false} dated onPick={() => {}} /></li>)}
    </ul>
  )
}

function Variant({ id, title, note }) {
  return (
    <section className={id}>
      <h2>{title}</h2>
      <p>{note}</p>
      <Marked>
        <Grid narrow={false} />
        <div className="pair">
          <div className="phone"><Grid narrow /></div>
          <Rows />
        </div>
      </Marked>
    </section>
  )
}



// CARD

const STAR = 'M8 0.8 L10.1 5.4 L15.1 5.9 L11.3 9.2 L12.4 14.2 L8 11.6 L3.6 14.2 L4.7 9.2 L0.9 5.9 L5.9 5.4 Z'

function Card({ on, glyph }) {
  return (
    <div className="mock-card" data-group={geminids.group}>
      <div className="mock-card-top">
        <p>Meteor showers</p>
        <span className="mock-tools">
          {glyph === 'star' && (
            <button type="button" className={on ? 'star-button on' : 'star-button'} aria-pressed={on} aria-label="Favorite every Geminids peak">
              <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d={STAR} /></svg>
            </button>
          )}
          <span className="mock-round">⋯</span>
          <span className="mock-round">✕</span>
        </span>
      </div>

      <div className="mock-card-head">
        <span className="mock-card-icon"><EventIcon icon={geminids.icon} /></span>
        <div>
          <h3>{geminids.name}</h3>
          <Tags tags={geminids.tags} />
        </div>
      </div>

      {glyph === 'pill' && (
        <button type="button" className={on ? 'fav-pill on' : 'fav-pill'} aria-pressed={on}>
          {on ? 'Favorited: every Geminids peak' : 'Favorite every Geminids peak'}
        </button>
      )}

      {glyph === 'star' && <p className="mock-fav-line">{on ? 'In your favorites: every Geminids peak.' : 'Tap the star to favorite every Geminids peak.'}</p>}
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Favorite events</h1>
      <p>Real December 2026 events for Kansas City. The Geminids and the Full Moon are favorited, so every Geminids peak and every Full Moon gets the mark. Each look is shown on the big calendar, the phone calendar and the month-by-month list.</p>

      <Variant id="vA" title="A · Star after the name" note="A small yellow star at the end of each favorite. Everything else stays the same." />
      <Variant id="vB" title="B · Star on the corner" note="The star sits on the top corner of the event, like a sticker." />
      <Variant id="vC" title="C · Yellow edge" note="A yellow stripe down the left side of each favorite, with no star." />

      <section className="vC">
        <h2>Favoriting from the event card · new</h2>
        <p>To match C, no star: a wide button under the title says exactly what it covers. Turned on, it takes the same yellow edge as the events it marks.</p>
        <div className="cards">
          <Card on={false} glyph="pill" />
          <Card on glyph="pill" />
        </div>
      </section>

      <section>
        <h2>Favoriting from the event card · first try</h2>
        <p>The star button from before, for comparison.</p>
        <div className="cards">
          <Card on={false} glyph="star" />
          <Card on glyph="star" />
        </div>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
