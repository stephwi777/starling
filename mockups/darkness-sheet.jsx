import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import { buildNight, STEP } from '../src/sky/night.js'
import { DarknessTile } from '../src/components/tonight/TonightTiles.jsx'



// PLACES

const PLACES = {
  kansasCity: { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago' },
  quito: { name: 'Quito', latitude: -0.18, longitude: -78.47, timeZone: 'America/Guayaquil' },
  sydney: { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney' },
  london: { name: 'London', latitude: 51.51, longitude: -0.13, timeZone: 'Europe/London' },
  reykjavik: { name: 'Reykjavík', latitude: 64.15, longitude: -21.94, timeZone: 'Atlantic/Reykjavik' },
  tromso: { name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' },
}



// CASES

const SEASONS = [
  ['Kansas City, tonight (Nov 19)', 'kansasCity', '2026-11-19T21:00:00Z'],
  ['Kansas City, longest night (Dec 21)', 'kansasCity', '2026-12-21T21:00:00Z'],
  ['Kansas City, shortest night (Jun 21)', 'kansasCity', '2026-06-21T21:00:00Z'],
  ['Quito, on the equator', 'quito', '2026-11-19T21:00:00Z'],
  ['Sydney, southern summer (Dec 21)', 'sydney', '2026-12-21T05:00:00Z'],
  ['Reykjavík, winter (Dec 21)', 'reykjavik', '2026-12-21T15:00:00Z'],
]

const EDGES = [
  ['London, midsummer: never fully dark', 'london', '2026-06-21T14:00:00Z'],
  ['Tromsø, polar night: dark all night', 'tromso', '2026-12-21T13:00:00Z'],
  ['Tromsø, midnight Sun: never sets', 'tromso', '2026-06-21T13:00:00Z'],
]

const DOTS = [
  ['Now: just after sunset', 0.04],
  ['Now: early evening twilight', 0.1],
  ['Now: middle of the night', 0.5],
  ['Now: just before dawn', 0.92],
]



// CASE

function Case({ title, place, date, dot }) {
  const night = buildNight(PLACES[place], 0, new Date(date))
  const nowIndex = dot === undefined ? null : Math.round(dot * (night.times.length - 1))
  const sky = { night, nowIndex }
  const span = `${Math.round((night.end - night.start) / STEP / 6)} hours shown`

  return (
    <div className="case">
      <strong>{title}</strong>
      <small>{span}</small>
      <div className="sizes">
        <div className="desktop"><DarknessTile sky={sky} place={PLACES[place]} /></div>
        <div className="phone"><DarknessTile sky={sky} place={PLACES[place]} /></div>
      </div>
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Darkness tile</h1>
      <p>Real nights drawn by the same code as the page. Desktop tile width on the left, phone tile width on the right.</p>

      <section>
        <h2>Seasons and places</h2>
        <div className="cases">
          {SEASONS.map(([title, place, date]) => <Case key={title} title={title} place={place} date={date} />)}
        </div>
      </section>

      <section>
        <h2>Unusual nights</h2>
        <div className="cases">
          {EDGES.map(([title, place, date]) => <Case key={title} title={title} place={place} date={date} />)}
        </div>
      </section>

      <section>
        <h2>Where the “now” dot can be</h2>
        <div className="cases">
          {DOTS.map(([title, dot]) => <Case key={title} title={`Kansas City, Nov 19. ${title}`} place="kansasCity" date="2026-11-19T21:00:00Z" dot={dot} />)}
        </div>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
