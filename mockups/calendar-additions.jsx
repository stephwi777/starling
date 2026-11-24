import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Calendar.css'
import { DEFAULT_KINDS } from '../src/sky/calendar/kinds.js'
import { monthEvents, shownEvents } from '../src/sky/calendar/monthEvents.js'
import MonthGrid from '../src/components/calendar/MonthGrid.jsx'
import KindList from '../src/components/calendar/KindList.jsx'



// REAL EVENTS, KANSAS CITY

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const EVENTS = shownEvents(monthEvents(KC, 2026, 12, { comets: [], version: 'mock', now: new Date() }), { kinds: DEFAULT_KINDS, world: false, query: '' })
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const nothing = () => {}



// MONTH PICKER

function Picker() {
  return (
    <div className="picker" role="dialog" aria-label="Choose a month">
      <div className="picker-year">
        <button type="button" className="soft-button" aria-label="Previous year">‹</button>
        <strong>2026</strong>
        <button type="button" className="soft-button" aria-label="Next year">›</button>
      </div>

      <div className="picker-months">
        {MONTHS.map((name, i) => (
          <button key={name} type="button" className={['picker-month', i === 11 && 'current', i === 10 && 'this-month'].filter(Boolean).join(' ')}>{name}</button>
        ))}
      </div>
    </div>
  )
}

function PickerDemo() {
  return (
    <div className="frame picker-frame">
      <MonthGrid year={2026} month={12} events={EVENTS} today="2026-11-23" selected="2026-11-23" narrow={false} south={false} onMonth={nothing} onToday={nothing} onDay={nothing} onPick={nothing} />
      <Picker />
    </div>
  )
}



// SEARCH NOTES

function Notes() {
  return (
    <div className="notes">
      <div>
        <small>No matches this month</small>
        <p className="calendar-note">No matches this month. <button type="button" className="next-match">Next: Perseids · Thu, Aug 12, 2027 <span aria-hidden="true">→</span></button></p>
      </div>
      <div>
        <small>Some matches this month</small>
        <p className="calendar-note">3 matches this month. <button type="button" className="next-match">Next after this month: Full Moon · Fri, Jan 22, 2027 <span aria-hidden="true">→</span></button></p>
      </div>
      <div>
        <small>Still looking</small>
        <p className="calendar-note">No matches this month. Looking further ahead…</p>
      </div>
      <div>
        <small>Nothing for three years</small>
        <p className="calendar-note">No matches in the next three years.</p>
      </div>
    </div>
  )
}



// FAVORITES SWITCH

function Switch({ on, disabled, count }) {
  return (
    <div className="fav-only">
      <label className={disabled ? 'kind-option fav-option disabled' : 'kind-option fav-option'}>
        <input type="checkbox" className="visually-hidden" checked={on} disabled={disabled} readOnly />
        <span className="kind-box" aria-hidden="true">
          <svg viewBox="0 0 16 16"><path className="kind-tick" d="M3.5 8.5 L6.6 11.4 L12.5 4.6" /></svg>
        </span>
        Only my favorites
        {!disabled && <small>{count}</small>}
      </label>
      {disabled && <p className="kind-note">Star events to build your favorites.</p>}
    </div>
  )
}

function Panel({ on, disabled, count }) {
  return (
    <div className={on ? 'panel favs-on' : 'panel'}>
      <Switch on={on} disabled={disabled} count={count} />
      <KindList id={`kinds-${String(on)}-${String(disabled)}`} kinds={DEFAULT_KINDS} toggleKind={nothing} setGroup={nothing} suggest={nothing} />
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Calendar additions</h1>
      <p>Real December 2026 events for Kansas City. Reminders have no screen of their own, so they aren’t shown here.</p>

      <section>
        <h2>Jump to a month</h2>
        <p>Tapping the month title opens this panel just under it. Arrows change the year; the current month is outlined in teal, the month on screen is filled.</p>
        <PickerDemo />
      </section>

      <section>
        <h2>Search: next match</h2>
        <p>The note under the calendar gains a button. Tapping it, or pressing Enter in the search box, goes to that month and opens the event.</p>
        <Notes />
      </section>

      <section>
        <h2>Only my favorites</h2>
        <p>A row at the top of Choose events, styled like the other choices. When it’s on, the event types below fade, since only favorites show.</p>
        <div className="panels">
          <figure><figcaption>Off</figcaption><Panel on={false} count="4 favorites" /></figure>
          <figure><figcaption>On</figcaption><Panel on count="4 favorites" /></figure>
          <figure><figcaption>No favorites yet</figcaption><Panel on={false} disabled /></figure>
        </div>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
