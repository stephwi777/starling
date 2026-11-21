import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Calendar.css'
import { DEFAULT_KINDS } from '../src/sky/calendar/kinds.js'
import { monthEvents, monthsFrom, shownEvents } from '../src/sky/calendar/monthEvents.js'
import MonthGrid from '../src/components/calendar/MonthGrid.jsx'
import EventIcon from '../src/components/calendar/EventIcon.jsx'
import IconWell from '../src/components/ui/IconWell.jsx'



// REAL EVENTS, KANSAS CITY

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const TODAY = '2026-11-20'

function isRare(event) {
  if (!event.here) return false
  if (event.kinds.includes('mars-closest') || event.kinds.includes('transit')) return true
  if (event.kinds.includes('solar-eclipse')) return true
  if (event.kinds.includes('lunar-eclipse')) return !event.name.startsWith('Penumbral')
  if (event.kinds.includes('planet-pair')) return /Only 0\.[0-4]/.test(event.note)

  return false
}

const filters = { kinds: DEFAULT_KINDS, world: false, query: '' }
const january = shownEvents(monthEvents(KC, 2028, 1), filters)
const rareIds = new Set(january.filter(isRare).map(event => event.id))

const upcoming = monthsFrom(2026, 11, 15)
  .flatMap(({ year, month }) => shownEvents(monthEvents(KC, year, month), filters))
  .filter(event => isRare(event) && event.day >= TODAY)



// HELPERS

function niceDay(key) {
  const [year, month, day] = key.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(Date.UTC(year, month - 1, day))
}

function monthsAway(key) {
  const [year, month] = key.split('-').map(Number)
  const away = (year - 2026) * 12 + month - 11

  return away <= 0 ? 'This month' : away === 1 ? 'Next month' : `In ${away} months`
}

function Marked({ children }) {
  const box = useRef(null)

  useEffect(() => {
    box.current.querySelectorAll('.chip').forEach(chip => {
      if (!rareIds.has(chip.dataset.event)) return

      chip.classList.add('rare')

      const day = chip.closest('li')

      day.classList.add('rare-day')
      day.dataset.group = chip.dataset.group
    })
  })

  return <div ref={box}>{children}</div>
}

function Grid() {
  return (
    <MonthGrid
      year={2028}
      month={1}
      events={january}
      today={TODAY}
      selected={TODAY}
      narrow={false}
      south={false}
      onMonth={() => {}}
      onToday={() => {}}
      onDay={() => {}}
      onPick={() => {}}
    />
  )
}

function DontMiss() {
  return (
    <div className="dont-miss">
      <h3>Don’t miss <span>· rare sky events visible from Kansas City</span></h3>
      <ul>
        {upcoming.slice(0, 3).map(event => (
          <li key={event.id} data-group={event.group}>
            <IconWell><EventIcon icon={event.icon} /></IconWell>
            <span>
              <strong>{event.name}</strong>
              <small>{niceDay(event.day)}</small>
              <small>{monthsAway(event.day)}</small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Making rare events stand out</h1>
      <p>Real events for Kansas City in January 2028: a partial lunar eclipse on the 11th (the night of the Full Wolf supermoon) and a partial solar eclipse on the 26th. Everything else is routine.</p>

      <section className="vA">
        <h2>A · Solid chip</h2>
        <p>Rare events get a fully filled chip in their group’s color with dark text.</p>
        <Marked><Grid /></Marked>
      </section>

      <section className="vB">
        <h2>B · Glow and sparkle</h2>
        <p>A soft halo in the event’s color and a small twinkling star in the corner.</p>
        <Marked><Grid /></Marked>
      </section>

      <section className="vC">
        <h2>C · Tinted day</h2>
        <p>The whole day square takes a faint wash of the event’s color.</p>
        <Marked><Grid /></Marked>
      </section>

      <section className="vA">
        <h2>D · “Don’t miss” strip (with A)</h2>
        <p>The next three rare events of the year sit above the calendar, so they’re visible even in a quiet month.</p>
        <DontMiss />
        <Marked><Grid /></Marked>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
