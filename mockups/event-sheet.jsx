import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/components/panel/Popover.css'
import '../src/pages/Calendar.css'
import { GROUPS, KINDS } from '../src/sky/calendar/kinds.js'
import { monthEvents, monthsFrom } from '../src/sky/calendar/monthEvents.js'
import { cometSeason } from '../src/sky/calendar/cometEvents.js'
import { SAMPLE_COMETS } from '../src/sky/calendar/cometSample.js'
import { shortDate } from '../src/components/calendar/dates.js'
import EventIcon from '../src/components/calendar/EventIcon.jsx'
import EventRow from '../src/components/calendar/EventRow.jsx'
import Tags from '../src/components/calendar/Tags.jsx'



// REAL EVENTS, KANSAS CITY

const PLACES = {
  kc: { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' },
  sydney: { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney', country: 'AU' },
}

const PLACE = PLACES[new URLSearchParams(location.search).get('place')] ?? PLACES.kc
const SOUTH = PLACE.latitude < 0

const KEEP = new Set(['Moon', 'Full', 'New', 'Sun', 'Earth', 'Comet', 'Black', 'Blue', 'Milky', 'Way', 'Total', 'Partial', 'Annular', 'Hybrid', 'Penumbral', 'First', 'Last', 'March', 'June', 'September', 'December', 'Planet'])

function shape(event) {
  const name = event.name.replace(/\([^)]*\)/g, '').split(' ').map(word => (/^[A-Z]/.test(word) && !KEEP.has(word) ? 'X' : word)).join(' ')
  const rows = event.rows.map(([label]) => label).join(',')

  const subject = event.kinds.includes('opposition') ? event.subjects[0].key : event.subjects[0].key.split(':')[0]

  return [event.kinds.join('+'), subject, event.here, [...event.tags].sort().join(','), name, rows].join('|')
}

function collect() {
  const months = monthsFrom(2026, 11, 26).flatMap(({ year, month }) => monthEvents(PLACE, year, month, { comets: [], version: 'sheet', now: new Date() }))
  const transit = monthEvents(PLACE, 2032, 11, { comets: [], version: 'sheet', now: new Date() }).filter(event => event.kinds.includes('transit'))
  const comets = cometSeason(SAMPLE_COMETS, PLACE, new Date('2027-01-15T12:00:00Z'))
  const seen = new Map()

  for (const event of [...months, ...transit, ...comets]) {
    const key = shape(event)

    if (!seen.has(key)) seen.set(key, event)
  }

  const order = id => KINDS.findIndex(kind => kind.id === id)

  return [...seen.values()].sort((a, b) => order(a.kinds[0]) - order(b.kinds[0]) || a.date - b.date)
}

const ENTRIES = collect()



// PIECES

const STAR = 'M8 0.8 L10.1 5.4 L15.1 5.9 L11.3 9.2 L12.4 14.2 L8 11.6 L3.6 14.2 L4.7 9.2 L0.9 5.9 L5.9 5.4 Z'

function Chip({ event, wide }) {
  return (
    <div className={wide ? 'wide piece' : 'piece'}>
      <div className="cell" style={{ width: wide ? 153 : 104 }}>
        <button type="button" className={event.here ? 'chip' : 'chip away'} data-group={event.group}>
          <EventIcon icon={event.icon} south={SOUTH} />
          <span>{event.short}</span>
        </button>
      </div>
      <small>{wide ? 'Big screens' : 'Narrowest desktop'}</small>
    </div>
  )
}

function Label({ event }) {
  return (
    <div className="piece">
      <div className="day-bars" style={{ width: 42 }}>
        <i data-group={event.group} className={event.here ? undefined : 'away'}><span>{event.tiny}</span></i>
      </div>
      <small>Phone</small>
    </div>
  )
}

function Card({ event }) {
  const group = GROUPS.find(item => item.id === event.group)

  return (
    <div className="sheet-card event-card" data-group={event.group}>
      <div className="event-card-top">
        <p className="event-card-group">{group?.name}</p>
        <div className="event-card-tools">
          <button type="button" className="event-card-star" aria-pressed="false"><svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path d={STAR} /></svg></button>
          <span className="card-menu-button"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="3" cy="8" r="1.7" fill="currentColor" /><circle cx="8" cy="8" r="1.7" fill="currentColor" /><circle cx="13" cy="8" r="1.7" fill="currentColor" /></svg></span>
          <span className="popover-close"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
        </div>
      </div>

      <div className="event-card-head">
        <span className="event-card-icon"><EventIcon icon={event.icon} south={SOUTH} /></span>
        <div className="event-card-title">
          <h2>{event.name}</h2>
          <Tags tags={event.tags} />
        </div>
      </div>

      <div className="event-card-when">
        <p>{shortDate(event, '2026-11-23')}{event.time && <> · <span className="event-card-time">{event.time}</span></>}</p>
      </div>

      {!event.here && <p className="event-card-away"><strong>Not visible from {PLACE.name}.</strong> {event.where}</p>}

      <p className="event-card-note">{event.note}</p>

      {event.rows.length > 0 && (
        <dl className="popover-rows">
          {event.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      )}
    </div>
  )
}



// FLAGS

function lines(element) {
  const style = getComputedStyle(element)

  return Math.round(element.getBoundingClientRect().height / parseFloat(style.lineHeight))
}

function cut(element) {
  return element.scrollHeight > element.clientHeight + 1
}

function findFlags(box, event) {
  const flags = []
  const sentences = event.note.split(/(?<=[.!?])\s+/).filter(Boolean).length

  box.querySelectorAll('.chip span').forEach((span, index) => cut(span) && flags.push(index === 0 ? 'Chip cut off on big screens' : 'Chip cut off on narrower desktops'))
  box.querySelectorAll('.day-bars span').forEach(span => cut(span) && flags.push('Phone label cut off'))
  box.querySelectorAll('.event-card-title h2').forEach(title => lines(title) > 2 && flags.push(`Card title wraps to ${lines(title)} lines`))
  box.querySelectorAll('.list-row .row-text strong').forEach(name => lines(name) > 1 && flags.push('List title wraps on phones'))
  box.querySelectorAll('.popover-rows dd').forEach(value => lines(value) > 1 && flags.push(`Detail “${value.previousSibling.textContent}” wraps`))
  if (sentences > 3) flags.push(`Note has ${sentences} sentences`)
  if (event.note.length > 220) flags.push(`Note is ${event.note.length} characters`)

  return flags
}



// ENTRY

function Entry({ number, event, onFlags }) {
  const box = useRef(null)
  const [flags, setFlags] = useState([])

  useEffect(() => {
    document.fonts.ready.then(() => {
      const found = findFlags(box.current, event)

      setFlags(found)
      onFlags(number, found.length)
    })
  }, [event, number, onFlags])

  return (
    <article ref={box} className={flags.length ? 'entry flagged' : 'entry'} data-group={event.group}>
      <header>
        <h2>#{number}</h2>
        <p>{[KINDS.find(kind => kind.id === event.kinds[0])?.name, ...event.tags, !event.here && 'not visible from here'].filter(Boolean).join(' · ')}</p>
      </header>

      {flags.length > 0 && <ul className="flags">{flags.map(flag => <li key={flag}>{flag}</li>)}</ul>}

      <div className="pieces">
        <Chip event={event} wide />
        <Chip event={event} />
        <Label event={event} />
      </div>

      <div className="list-row">
        <ul className="event-rows"><li><EventRow event={event} south={SOUTH} dated onPick={() => {}} /></li></ul>
        <small>List row on a phone</small>
      </div>

      <Card event={event} />
    </article>
  )
}



// SHEET

function Sheet() {
  const [group, setGroup] = useState('all')
  const [onlyFlagged, setOnlyFlagged] = useState(false)
  const [counts, setCounts] = useState({})
  const record = useRef((number, count) => setCounts(current => (current[number] === count ? current : { ...current, [number]: count }))).current
  const flagged = Object.values(counts).filter(Boolean).length

  return (
    <main className="sheet">
      <h1>Calendar entry review</h1>
      <p>Every kind of calendar entry, once, using real events for {PLACE.name} from November 2026 to December 2028, the November 2032 Mercury transit, plus sample comets. Each is shown as the big-screen chip, the narrowest desktop chip, the phone label, the phone list row and the full card. Give notes by number. Yellow notes are problems the sheet found by itself.</p>
      <p className="places"><a href="?place=kc">Kansas City</a> · <a href="?place=sydney">Sydney</a></p>
      <p className="summary">{ENTRIES.length} entries · {flagged} with something flagged</p>

      <div className="filters">
        {[{ id: 'all', name: 'Everything' }, ...GROUPS].map(item => (
          <button key={item.id} type="button" className={group === item.id ? 'on' : ''} onClick={() => setGroup(item.id)}>{item.name}</button>
        ))}
        <label><input type="checkbox" checked={onlyFlagged} onChange={change => setOnlyFlagged(change.target.checked)} /> Only flagged</label>
      </div>

      <div className="entries">
        {ENTRIES.map((event, index) => {
          const number = index + 1
          const hidden = (group !== 'all' && event.group !== group) || (onlyFlagged && !counts[number])

          return <div key={event.id} hidden={hidden}><Entry number={number} event={event} onFlags={record} /></div>
        })}
      </div>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
