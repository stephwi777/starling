import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as Astronomy from 'astronomy-engine'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import Card from '../src/components/ui/Card.jsx'
import IconWell from '../src/components/ui/IconWell.jsx'
import { FullMoonIcon, NewMoonIcon, PhaseMoon } from '../src/components/ui/icons.jsx'
import SkyIcon from '../src/components/sky-icons/SkyIcon.jsx'



// ICONS

function SunIcon() {
  return (
    <svg className="sun-icon" viewBox="-13 -13 26 26" aria-hidden="true">
      <g stroke="var(--beak)" strokeWidth="2" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const r = (a * Math.PI) / 180
          return <path key={a} d={`M${8 * Math.cos(r)} ${8 * Math.sin(r)} L${11 * Math.cos(r)} ${11 * Math.sin(r)}`} />
        })}
      </g>
      <circle r="5.5" />
    </svg>
  )
}

function EclipseIcon() {
  return (
    <svg viewBox="-13 -13 26 26" aria-hidden="true">
      <circle r="9" fill="var(--beak)" />
      <circle r="8.5" cx="2.5" fill="var(--zenith)" />
    </svg>
  )
}

const ICONS = {
  'new': () => <NewMoonIcon />,
  'full': () => <FullMoonIcon />,
  'shower': () => <SkyIcon object={{ kind: 'shower' }} />,
  'sun': () => <SunIcon />,
  'jupiter': () => <SkyIcon object={{ kind: 'planet', name: 'Jupiter' }} />,
  'mars': () => <SkyIcon object={{ kind: 'planet', name: 'Mars' }} />,
  'venus': () => <SkyIcon object={{ kind: 'planet', name: 'Venus' }} />,
  'eclipse': () => <EclipseIcon />,
}



// REAL EVENTS, KANSAS CITY

const MONTHS = [
  {
    name: 'December 2026',
    events: [
      { day: 8, weekday: 'Tue', icon: 'new', name: 'New Moon', note: 'Darkest skies of the month.', time: '6:52pm' },
      { day: 13, weekday: 'Sun', icon: 'shower', name: 'Geminids peak', note: 'Up to 150 meteors an hour from dark skies, best after 10pm.', time: 'All night' },
      { day: 21, weekday: 'Mon', icon: 'sun', name: 'December solstice', note: 'The longest night of the year.', time: '2:50pm' },
      { day: 22, weekday: 'Tue', icon: 'shower', name: 'Ursids peak', note: 'A quiet shower near the Little Dipper.', time: 'Before dawn' },
      { day: 23, weekday: 'Wed', icon: 'full', name: 'Full Cold Moon · Supermoon', note: 'A big, bright full Moon rising at sunset.', time: '7:28pm' },
      { day: 26, weekday: 'Sat', icon: 'jupiter', name: 'Moon meets Jupiter', note: 'Only 1.4° apart, highest after midnight.', time: 'Late night' },
      { day: 28, weekday: 'Mon', icon: 'mars', name: 'Moon near Mars', note: 'About 5° apart before dawn.', time: 'Before dawn' },
    ],
  },
  {
    name: 'January 2027',
    events: [
      { day: 3, weekday: 'Sun', icon: 'shower', name: 'Quadrantids peak', note: 'A short, sharp peak of blue meteors.', time: 'Before dawn' },
      { day: 3, weekday: 'Sun', icon: 'venus', name: 'Venus at its best', note: 'Farthest from the Sun, brilliant in the east before sunrise.', time: 'Before dawn' },
      { day: 7, weekday: 'Thu', icon: 'new', name: 'New Moon', note: 'Darkest skies of the month.', time: '2:25pm' },
      { day: 22, weekday: 'Fri', icon: 'full', name: 'Full Wolf Moon · Supermoon', note: 'Sets at sunrise, big and low in the west.', time: '6:17am' },
    ],
  },
  {
    name: 'February 2027',
    events: [
      { day: 6, weekday: 'Sat', icon: 'eclipse', name: 'Annular solar eclipse', note: 'A ring of Sun, seen from South America and Africa. Not visible from Kansas City.', time: 'Morning', world: true },
      { day: 10, weekday: 'Wed', icon: 'jupiter', name: 'Jupiter at its best', note: 'Opposite the Sun: up all night and at its brightest.', time: 'All night' },
      { day: 19, weekday: 'Fri', icon: 'mars', name: 'Mars at its best', note: 'Opposite the Sun: up all night, red and bright.', time: 'All night' },
    ],
  },
]

const DECEMBER = MONTHS[0]

function moonAngle(day) {
  return Astronomy.MoonPhase(new Date(Date.UTC(2026, 11, day + 1, 6)))
}



// HEAD

function Head({ world, setWorld }) {
  return (
    <div className="cal-head">
      <h1>Calendar</h1>
      <p>Every special sky event, from Kansas City.</p>

      <div className="cal-controls">
        <span className={`switch${world ? ' world' : ''}`}>
          <button type="button" aria-pressed={!world} onClick={() => setWorld(false)}>Visible from here</button>
          <button type="button" aria-pressed={world} onClick={() => setWorld(true)}>Worldwide</button>
        </span>
        <button type="button" className="choose">Choose events · 24 of 38</button>
      </div>
    </div>
  )
}



// EVENT ROWS

function EventRow({ event }) {
  const Icon = ICONS[event.icon]

  return (
    <li>
      <span className="when"><small>{event.weekday}</small><b>{event.day}</b></span>
      <IconWell><Icon /></IconWell>
      <span className="row-text">
        <strong>{event.name}</strong>
        <small>{event.time} · {event.note}</small>
      </span>
    </li>
  )
}



// MONTH GRID

function MonthGrid({ compact, picked }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const byDay = day => DECEMBER.events.filter(event => event.day === day)

  return (
    <div className={compact ? 'compact' : undefined}>
      <div className="month-top">
        <h2>{DECEMBER.name}</h2>
        <span><button type="button">‹</button><button type="button">›</button></span>
      </div>

      <div className="grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="weekday">{d}</span>)}
        <span />
        <span />

        {days.map(day => {
          const events = byDay(day)
          const classes = ['day', events.length && 'has', day === picked && 'picked'].filter(Boolean).join(' ')

          return (
            <span key={day} className={classes}>
              <b>{day}</b>
              <PhaseMoon angle={moonAngle(day)} size={compact ? 18 : 20} />
              {compact
                ? <span className="dots">{events.map(event => <i key={event.name} />)}</span>
                : <span className="day-icons">{events.map(event => { const Icon = ICONS[event.icon]; return <Icon key={event.name} /> })}</span>}
            </span>
          )
        })}
      </div>
    </div>
  )
}



// A · MONTH GRID

function VersionA() {
  const [world, setWorld] = useState(false)
  const picked = DECEMBER.events.filter(event => event.day === 13)

  return (
    <div className="frame">
      <Head world={world} setWorld={setWorld} />

      <Card className="month-card">
        <MonthGrid picked={13} />

        <div className="day-panel">
          <h3>Sunday, December 13</h3>
          <ul className="events">{picked.map(event => <EventRow key={event.name} event={event} />)}</ul>
        </div>
      </Card>
    </div>
  )
}



// B · LIST BY MONTH

function VersionB() {
  const [world, setWorld] = useState(false)

  return (
    <div className="frame">
      <Head world={world} setWorld={setWorld} />

      <Card className="month-card">
        {MONTHS.map(month => (
          <div key={month.name}>
            <h2 className="month-label">{month.name}</h2>
            <ul className="events">
              {month.events.filter(event => world || !event.world).map(event => <EventRow key={event.name} event={event} />)}
            </ul>
          </div>
        ))}
      </Card>
    </div>
  )
}



// C · BOTH

function VersionC() {
  const [world, setWorld] = useState(false)

  return (
    <div className="frame">
      <Head world={world} setWorld={setWorld} />

      <Card className="month-card">
        <MonthGrid compact />
        <ul className="events" style={{ marginTop: 14 }}>
          {DECEMBER.events.map(event => <EventRow key={event.name} event={event} />)}
        </ul>
      </Card>
    </div>
  )
}



// SHEET

function Both({ Version }) {
  return (
    <div className="sizes">
      <div className="desktop"><Version /></div>
      <div className="phone"><Version /></div>
    </div>
  )
}

function Sheet() {
  return (
    <main className="sheet">
      <h1>Calendar layouts</h1>
      <p>Real events for Kansas City, December 2026 to February 2027, using the events that start checked. The switch works: in version B, Worldwide adds February’s annular solar eclipse, which isn’t visible from Kansas City. Desktop width on the left, phone on the right.</p>

      <section>
        <h2>A · Month grid</h2>
        <p>A wall calendar: the Moon’s phase in every square and small icons on event days. Tap a day to see its events below.</p>
        <Both Version={VersionA} />
      </section>

      <section>
        <h2>B · List by month</h2>
        <p>One row per event, grouped under month headings. Scroll to see the whole year.</p>
        <Both Version={VersionB} />
      </section>

      <section>
        <h2>C · Both</h2>
        <p>A small month grid on top (Moon phases, a yellow dot on event days), the month’s events listed underneath. Arrows move between months.</p>
        <Both Version={VersionC} />
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
