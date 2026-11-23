import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/components/panel/Popover.css'
import '../src/pages/Calendar.css'
import { GROUPS } from '../src/sky/calendar/kinds.js'
import { monthEvents } from '../src/sky/calendar/monthEvents.js'
import { eventDate } from '../src/components/calendar/dates.js'
import EventIcon from '../src/components/calendar/EventIcon.jsx'
import Tags from '../src/components/calendar/Tags.jsx'



// REAL EVENTS, KANSAS CITY

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const NONE = { comets: [], version: 'mock', now: new Date() }

const EVENTS = [
  monthEvents(KC, 2026, 12, NONE).find(event => event.kinds.includes('full-moon')),
  monthEvents(KC, 2026, 11, NONE).find(event => event.name.startsWith('Leonids')),
  monthEvents(KC, 2027, 2, NONE).find(event => event.name === 'Jupiter at its best'),
]

function shortDate(event) {
  const [year, month, day] = event.day.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(Date.UTC(year, month - 1, day))
}

const STAR = 'M8 0.8 L10.1 5.4 L15.1 5.9 L11.3 9.2 L12.4 14.2 L8 11.6 L3.6 14.2 L4.7 9.2 L0.9 5.9 L5.9 5.4 Z'



// WHEN LINES

function When({ event, variant }) {
  if (variant === 'first') {
    return (
      <div className="event-card-when when-first">
        <p className="when-time">{event.time}</p>
        <p>{eventDate(event)}</p>
      </div>
    )
  }

  if (variant === 'line') {
    return (
      <div className="event-card-when when-line">
        <p>{shortDate(event)} · <span className="when-time">{event.time}</span></p>
      </div>
    )
  }

  return (
    <div className={variant === 'bright' ? 'event-card-when when-bright' : 'event-card-when'}>
      <p>{eventDate(event)}</p>
      <p className={variant === 'bright' ? 'when-time' : undefined}>{event.time}</p>
    </div>
  )
}



// CARD

function Card({ event, variant }) {
  const group = GROUPS.find(item => item.id === event.group)

  return (
    <div className="mock-card event-card" data-group={event.group}>
      <div className="event-card-top">
        <p className="event-card-group">{group?.name}</p>
        <div className="event-card-tools">
          <button type="button" className="event-card-star" aria-pressed="false"><svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path d={STAR} /></svg></button>
          <span className="card-menu-button"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="3" cy="8" r="1.7" fill="currentColor" /><circle cx="8" cy="8" r="1.7" fill="currentColor" /><circle cx="13" cy="8" r="1.7" fill="currentColor" /></svg></span>
          <span className="popover-close"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
        </div>
      </div>

      <div className="event-card-head">
        <span className="event-card-icon"><EventIcon icon={event.icon} /></span>
        <div className="event-card-title">
          <h2>{event.name}</h2>
          <Tags tags={event.tags} />
        </div>
      </div>

      <When event={event} variant={variant} />

      <p className="event-card-note">{event.note}</p>

      {event.rows.length > 0 && (
        <dl className="popover-rows">
          {event.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      )}
    </div>
  )
}



// OPTIONS

const OPTIONS = [
  ['now', 'Now', 'Date and time both grey; the time is even a little thinner.'],
  ['bright', 'A · Bright time', 'Date stays grey. The time turns white and bold, like the title.'],
  ['first', 'B · Time first', 'The bright time sits on top, with the date underneath in grey.'],
  ['line', 'C · One line', 'A short date and the bright time share one line, which also saves a little height.'],
]



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Card date and time</h1>
      <p>Real Kansas City events: a clock time (Full Moon), a night word (Leonids peak) and an all-night planet. The rest of each card is unchanged.</p>

      {OPTIONS.map(([variant, name, note]) => (
        <section key={variant}>
          <h2>{name}</h2>
          <p>{note}</p>
          <div className="cards">
            {EVENTS.map(event => <Card key={event.id} event={event} variant={variant} />)}
          </div>
        </section>
      ))}
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
