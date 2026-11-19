import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import { useNight } from '../src/sky/useNight.js'
import UpTonightCard from '../src/components/tonight/UpTonightCard.jsx'



// PLACES

const PLACES = {
  kansasCity: { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago' },
  sydney: { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney' },
  london: { name: 'London', latitude: 51.51, longitude: -0.13, timeZone: 'Europe/London' },
  tromso: { name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' },
}



// CASES

const SEASONS = [
  ['Kansas City, tonight (Nov 19, Leonids)', 'kansasCity', '2026-11-19T21:00:00Z'],
  ['Kansas City, Perseids peak (Aug 12)', 'kansasCity', '2026-08-12T21:00:00Z'],
  ['Kansas City, spring (Apr 10, no shower)', 'kansasCity', '2026-04-10T21:00:00Z'],
  ['Kansas City, Geminids peak (Dec 13)', 'kansasCity', '2026-12-13T21:00:00Z'],
  ['Sydney, southern winter (Jun 21)', 'sydney', '2026-06-21T05:00:00Z'],
  ['Sydney, southern summer (Dec 21)', 'sydney', '2026-12-21T05:00:00Z'],
]

const EDGES = [
  ['Tromsø, polar night (Dec 21)', 'tromso', '2026-12-21T13:00:00Z'],
  ['London, midsummer: never fully dark', 'london', '2026-06-21T14:00:00Z'],
  ['Tromsø, midnight Sun: never sets', 'tromso', '2026-06-21T13:00:00Z'],
]



// CASE

function Case({ title, place, date }) {
  const where = PLACES[place]
  const sky = useNight(where, 0, null, new Date(date))

  return (
    <div className="case">
      <strong>{title}</strong>
      <UpTonightCard sky={sky} place={where} />
    </div>
  )
}

function Cases({ list }) {
  return (
    <div className="cases">
      {list.map(([title, place, date]) => <Case key={title} title={title} place={place} date={date} />)}
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Up tonight card</h1>
      <p>Real skies on real nights, drawn by the same code as the page. Open this sheet on a phone-sized window to see the phone layout.</p>

      <section>
        <h2>Seasons and places</h2>
        <Cases list={SEASONS} />
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
