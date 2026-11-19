import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import { buildNight } from '../src/sky/night.js'
import { SeeingTile } from '../src/components/tonight/TonightTiles.jsx'



// PLACES

const PLACES = {
  kansasCity: { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago' },
  london: { name: 'London', latitude: 51.51, longitude: -0.13, timeZone: 'Europe/London' },
  tromso: { name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' },
}

const TONIGHT = '2026-11-19T21:00:00Z'
const HOUR = 60 * 60 * 1000



// SKIES

const late = hour => (hour + 12) % 24
const after = (start, before, then) => hour => (late(hour) >= late(start) ? then : before)

const LEVELS = [
  ['Jet stream 6 m/s', 'kansasCity', TONIGHT, () => 6],
  ['Jet stream 15 m/s (like tonight)', 'kansasCity', TONIGHT, () => 15],
  ['Jet stream 25 m/s', 'kansasCity', TONIGHT, () => 25],
  ['Jet stream 35 m/s', 'kansasCity', TONIGHT, () => 35],
  ['Jet stream 55 m/s', 'kansasCity', TONIGHT, () => 55],
]

const CHANGES = [
  ['Jet stream calms from 38 to 8 m/s at 2am', 'kansasCity', TONIGHT, after(2, 38, 8)],
  ['Jet stream picks up from 12 to 28 m/s at 1am (too small to mention)', 'kansasCity', TONIGHT, after(1, 12, 28)],
]

const EDGES = [
  ['Checking the forecast', 'kansasCity', TONIGHT, null, 'loading'],
  ['Forecast unavailable', 'kansasCity', TONIGHT, null, 'failed'],
  ['London, midsummer: never fully dark', 'london', '2026-06-21T14:00:00Z', () => 18],
  ['Tromsø, midnight Sun: never sets', 'tromso', '2026-06-21T13:00:00Z', () => 18],
]



// JETS

function localHour(date, timeZone) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(date))
}

function jetsFor(night, timeZone, pick) {
  if (!pick) return null

  return Array.from({ length: night.hours }, (_, h) => pick(localHour(new Date(night.start.getTime() + h * HOUR), timeZone)))
}



// CASE

function Case({ title, place, date, pick, status = 'ready' }) {
  const where = PLACES[place]
  const night = buildNight(where, 0, new Date(date))
  const sky = { night, weather: { jets: jetsFor(night, where.timeZone, pick) } }

  return (
    <div className="case">
      <strong>{title}</strong>
      <div className="sizes">
        <div className="desktop"><SeeingTile sky={sky} place={where} status={status} /></div>
        <div className="phone"><SeeingTile sky={sky} place={where} status={status} /></div>
      </div>
    </div>
  )
}

function Cases({ list }) {
  return (
    <div className="cases">
      {list.map(([title, place, date, pick, status]) => <Case key={title} title={title} place={place} date={date} pick={pick} status={status} />)}
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Seeing tile</h1>
      <p>Made-up jet stream speeds on real nights, drawn by the same code as the page. Desktop tile width on the left, phone tile width on the right.</p>

      <section>
        <h2>The five steps</h2>
        <Cases list={LEVELS} />
      </section>

      <section>
        <h2>Nights that change</h2>
        <Cases list={CHANGES} />
      </section>

      <section>
        <h2>Unusual nights</h2>
        <Cases list={EDGES} />
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
