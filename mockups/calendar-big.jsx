import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import IconWell from '../src/components/ui/IconWell.jsx'
import { FullMoonIcon, NewMoonIcon } from '../src/components/ui/icons.jsx'
import SkyIcon from '../src/components/sky-icons/SkyIcon.jsx'



// ICONS

function EclipseIcon({ moon }) {
  return (
    <svg viewBox="-13 -13 26 26" aria-hidden="true">
      <circle r="9" fill={moon ? 'var(--moon)' : 'var(--beak)'} />
      <circle r={moon ? 9 : 7} cx={moon ? 4 : 0} fill={moon ? 'color-mix(in srgb, var(--star-rose) 55%, var(--zenith))' : 'var(--zenith)'} opacity={moon ? 0.7 : 1} />
    </svg>
  )
}

const planet = name => () => <SkyIcon object={{ kind: 'planet', name }} />

const ICONS = {
  new: () => <NewMoonIcon />,
  full: () => <FullMoonIcon />,
  mercury: planet('Mercury'),
  jupiter: planet('Jupiter'),
  mars: planet('Mars'),
  solar: () => <EclipseIcon />,
  lunar: () => <EclipseIcon moon />,
}



// FEBRUARY 2027, KANSAS CITY

const EVENTS = [
  { day: 2, kind: 'planet', icon: 'mercury', short: 'Mercury at its best', name: 'Mercury at its best', note: 'Farthest from the Sun in the evening sky, low in the west after sunset.', time: 'After sunset' },
  { day: 6, kind: 'moon', icon: 'new', short: 'New Moon', name: 'New Moon', note: 'Darkest skies of the month.', time: '9:56am' },
  { day: 6, kind: 'eclipse', icon: 'solar', short: 'Annular eclipse', name: 'Annular solar eclipse', note: 'A ring of Sun over South America, the South Atlantic and Africa. Not visible from Kansas City.', time: '9:59am', world: true },
  { day: 7, kind: 'planet', icon: 'mercury', short: 'Moon meets Mercury', name: 'Moon meets Mercury', note: 'A thin crescent right beside Mercury, low in the west after sunset.', time: 'After sunset' },
  { day: 10, kind: 'planet', icon: 'jupiter', short: 'Jupiter at its best', name: 'Jupiter at its best', note: 'Opposite the Sun: up all night and at its brightest of the year.', time: 'All night' },
  { day: 19, kind: 'planet', icon: 'mars', short: 'Mars at its best', name: 'Mars at its best', note: 'Opposite the Sun: up all night, red and bright.', time: 'All night' },
  { day: 19, kind: 'planet', icon: 'jupiter', short: 'Moon meets Jupiter', name: 'Moon meets Jupiter', note: 'Only 1.1° apart, high in the south around midnight.', time: '11pm' },
  { day: 20, kind: 'moon', icon: 'full', short: 'Full Snow Moon', name: 'Full Snow Moon · Supermoon', note: 'A big, bright full Moon rising at sunset.', time: '5:24pm' },
  { day: 20, kind: 'eclipse', icon: 'lunar', short: 'Penumbral eclipse', name: 'Penumbral lunar eclipse', note: 'A faint dimming of the Moon, seen from Europe, Africa and Asia. The Moon is still below the horizon here.', time: '5:12pm', world: true },
  { day: 20, kind: 'planet', icon: 'mars', short: 'Moon near Mars', name: 'Moon near Mars', note: 'About 5° apart, rising together at sunset.', time: 'Evening' },
]

const KINDS = [
  { id: 'moon', name: 'Moon', items: [['Full Moon', true], ['New Moon', true], ['Supermoon', true], ['Blue Moon', true], ['First and last quarter', false], ['Perigee and apogee', false]] },
  { id: 'eclipse', name: 'Eclipses and transits', items: [['Solar eclipses', true], ['Lunar eclipses', true], ['Mercury and Venus transits', true], ['Occultations', false]] },
  { id: 'planet', name: 'Planets', items: [['At their best (opposition)', true], ['Mercury and Venus at their best', true], ['Close pairs', true], ['Moon near a planet', true], ['Planet parades', true], ['Turning points', false]] },
  { id: 'meteor', name: 'Meteor showers', items: [['Major showers', true], ['Minor showers', true]] },
  { id: 'sun', name: 'Sun and seasons', items: [['Equinoxes and solstices', true], ['Earth closest and farthest', false]] },
  { id: 'comet', name: 'Comets and asteroids', items: [['Bright comets', true], ['Asteroid flybys', false]] },
  { id: 'aurora', name: 'Aurora', items: [['Aurora possible here', true]] },
]

const DETAIL = {
  day: 10,
  rows: [
    ['When', 'Wed, Feb 10, all night'],
    ['Rises', '5:40pm in the east'],
    ['Highest', '12:32am, high in the south'],
    ['Brightness', 'Brighter than any star'],
    ['Where', 'In Leo'],
    ['Moon', '19% lit, sets early'],
  ],
}



// PIECES

function Chip({ event, open }) {
  const Icon = ICONS[event.icon]

  return (
    <span className={`chip ${event.kind}-c${event.world ? ' world' : ''}${open ? ' open' : ''}`}>
      <Icon />
      <span>{event.short}</span>
      {open && <Detail event={event} />}
    </span>
  )
}

function Detail({ event }) {
  const Icon = ICONS[event.icon]

  return (
    <span className="detail">
      <header>
        <Icon />
        <span>
          <span className="tag">Planets · at its best</span>
          <h3>{event.name}</h3>
        </span>
      </header>
      <p>{event.note}</p>
      <dl>{DETAIL.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </span>
  )
}

function Head({ world, setWorld, query, setQuery }) {
  return (
    <div className="cal-top">
      <div>
        <h1>Calendar</h1>
        <p>Every special sky event, from Kansas City.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <input className="search" type="search" placeholder="Search events" value={query} onChange={event => setQuery(event.target.value)} />
        <span className={`switch${world ? ' world' : ''}`}>
          <button type="button" aria-pressed={!world} onClick={() => setWorld(false)}>Visible from here</button>
          <button type="button" aria-pressed={world} onClick={() => setWorld(true)}>Worldwide</button>
        </span>
        <button type="button" className="filter">Choose events · 24</button>
      </div>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="side">
      <h2>Show on calendar</h2>
      <p>24 of 38 kinds of events.</p>

      {KINDS.map((kind, i) => (
        <details key={kind.id} className={`group ${kind.id}-c`} open={i === 2}>
          <summary>
            <i className="swatch" />
            {kind.name}
            <small>{kind.items.filter(([, on]) => on).length}/{kind.items.length}</small>
          </summary>
          {kind.items.map(([name, on]) => <label key={name}><input type="checkbox" defaultChecked={on} />{name}</label>)}
        </details>
      ))}
    </aside>
  )
}

function Month({ events, detail }) {
  const blanks = 1
  const cells = [...Array(blanks).fill(null), ...Array.from({ length: 28 }, (_, i) => i + 1)]

  while (cells.length % 7) cells.push(null)

  return (
    <div className="month">
      <div className="month-top">
        <h2>February 2027</h2>
        <span className="nav">
          <button type="button">Today</button>
          <button type="button">‹</button>
          <button type="button">›</button>
        </span>
      </div>

      <div className="grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d} className="weekday">{d}</span>)}
        {cells.map((day, i) => (
          <span key={i} className={`cell${day ? '' : ' blank'}`}>
            {day && <b>{day}</b>}
            {day && events.filter(event => event.day === day).map(event => <Chip key={event.name} event={event} open={detail && day === DETAIL.day} />)}
          </span>
        ))}
      </div>
    </div>
  )
}

function Row({ event }) {
  const Icon = ICONS[event.icon]
  const weekday = new Date(Date.UTC(2027, 1, event.day)).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })

  return (
    <li>
      <span className="when"><small>{weekday}</small><b>{event.day}</b></span>
      <IconWell><Icon /></IconWell>
      <span className="row-text"><strong>{event.name}</strong><small>{event.time} · {event.note}</small></span>
    </li>
  )
}



// CALENDAR

function Calendar({ phone }) {
  const [world, setWorld] = useState(false)
  const [query, setQuery] = useState('')
  const words = query.trim().toLowerCase()
  const events = EVENTS.filter(event => (world || !event.world) && (!words || `${event.name} ${event.note}`.toLowerCase().includes(words)))
  const picked = events.filter(event => event.day === 20)

  return (
    <div className={`frame${phone ? ' phone' : ''}`}>
      <Head world={world} setWorld={setWorld} query={query} setQuery={setQuery} />

      <div className="cal-body">
        <Sidebar />
        <Month events={events} detail={!phone && !words} />
      </div>

      {phone && (
        <div className="day-list">
          <h3>Saturday, February 20</h3>
          <ul className="events">{picked.map(event => <Row key={event.name} event={event} />)}</ul>
        </div>
      )}

      <details className="all">
        <summary>All events, month by month</summary>
        <h3 className="month-label">February 2027</h3>
        <ul className="events">{events.map(event => <Row key={event.name} event={event} />)}</ul>
      </details>
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Big calendar</h1>
      <p>Real events for Kansas City in February 2027. Everything works: type in the search box, flip Visible from here / Worldwide (two eclipses appear, dashed because you can’t see them from here), open the checklist groups, and open the list at the bottom. Jupiter’s chip on the 10th shows the detail card a click would open.</p>

      <h2>Desktop</h2>
      <Calendar />

      <h2>Phone</h2>
      <p>The grid shrinks to colored bars; tapping a day lists its events underneath. The checklist opens from the “Choose events” button.</p>
      <Calendar phone />
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
