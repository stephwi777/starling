import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Calendar.css'
import { DEFAULT_KINDS } from '../src/sky/calendar/kinds.js'
import { monthEvents, shownEvents } from '../src/sky/calendar/monthEvents.js'
import MonthGrid from '../src/components/calendar/MonthGrid.jsx'



// REAL EVENTS, KANSAS CITY

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const EVENTS = shownEvents(monthEvents(KC, 2026, 11, { comets: [], version: 'mock', now: new Date() }), { kinds: DEFAULT_KINDS, world: false, query: '' })

const WIDTHS = [
  [740, 'Narrowest desktop (about 900px screen)'],
  [900, 'Medium desktop (about 1100px screen)'],
]

const VARIANTS = [
  ['vA', 'Now', 'Two lines, then cut off.'],
  ['vB', 'B · Three lines', 'Chips may grow a third line, so the whole name shows. Busy days get a little taller.'],
  ['vC', 'C · Smaller text', 'Chip text shrinks slightly at these widths only. Big screens stay the same.'],
  ['vD', 'D · No icon', 'The icon hides at these widths, giving the words the full chip. The color still tells the group.'],
  ['vE', 'E · Icon above', 'The icon sits on its own small line above the name, so the name gets the full width.'],
]



// GRID

function Grid({ width }) {
  return (
    <div className="frame" style={{ width }}>
      <MonthGrid year={2026} month={11} events={EVENTS} today="2026-11-01" selected="2026-11-01" narrow={false} south={false} onMonth={() => {}} onToday={() => {}} onDay={() => {}} onPick={() => {}} />
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Chips at medium widths</h1>
      <p>Real November 2026 events for Kansas City, the busiest month. Only on screens close to 900px wide do longer names like “Mercury at its best” lose their last word: 3 of this month’s 16 chips. By about 1100px everything already fits. Each option is shown at both widths. Big screens and phones don’t change.</p>

      {VARIANTS.map(([id, name, note]) => (
        <section key={id} className={id}>
          <h2>{name}</h2>
          <p>{note}</p>
          {WIDTHS.map(([width, label]) => (
            <figure key={width}>
              <figcaption>{label}</figcaption>
              <Grid width={width} />
            </figure>
          ))}
        </section>
      ))}
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
