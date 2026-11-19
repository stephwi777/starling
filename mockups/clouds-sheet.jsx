import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import { buildNight } from '../src/sky/night.js'
import { cloudBars } from '../src/sky/clouds.js'
import { CloudsTile } from '../src/components/tonight/TonightTiles.jsx'



// PLACES

const PLACES = {
  kansasCity: { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago' },
  reykjavik: { name: 'Reykjavík', latitude: 64.15, longitude: -21.94, timeZone: 'Atlantic/Reykjavik' },
  london: { name: 'London', latitude: 51.51, longitude: -0.13, timeZone: 'Europe/London' },
  tromso: { name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' },
}

const TONIGHT = '2026-11-19T21:00:00Z'
const HOUR = 60 * 60 * 1000



// SKIES

const late = hour => (hour + 12) % 24
const after = (start, before, then) => hour => (late(hour) >= late(start) ? then : before)
const between = (from, to, inside, outside) => hour => (late(hour) >= late(from) && late(hour) < late(to) ? inside : outside)

const SKIES = [
  ['Clear all night', 'kansasCity', TONIGHT, () => 5],
  ['Patchy all night', 'kansasCity', TONIGHT, () => 35],
  ['Cloudy all night', 'kansasCity', TONIGHT, () => 85],
  ['Patchy clouds roll in at 1am', 'kansasCity', TONIGHT, after(1, 5, 40)],
  ['Clouds clear at 10pm', 'kansasCity', TONIGHT, after(22, 90, 8)],
  ['Clouds pass through 11pm to 2am', 'kansasCity', TONIGHT, between(23, 2, 80, 5)],
  ['Clear, then clouds come and go from 12am', 'kansasCity', TONIGHT, hour => (late(hour) < late(0) ? 5 : [90, 90, 40, 90, 40, 90][hour % 6])],
  ['Every hour different', 'kansasCity', TONIGHT, hour => [5, 15, 30, 50, 70, 95][hour % 6]],
]

const EDGES = [
  ['Checking the forecast', 'kansasCity', TONIGHT, null, 'loading'],
  ['Forecast unavailable', 'kansasCity', TONIGHT, null, 'failed'],
  ['A few hours missing', 'kansasCity', TONIGHT, between(0, 3, null, 10)],
  ['Reykjavík, longest night (Dec 21)', 'reykjavik', '2026-12-21T15:00:00Z', after(3, 20, 70)],
  ['Kansas City, shortest night (Jun 21)', 'kansasCity', '2026-06-21T21:00:00Z', after(1, 10, 45)],
  ['London, midsummer: never fully dark', 'london', '2026-06-21T14:00:00Z', after(0, 65, 10)],
  ['Tromsø, midnight Sun: never sets', 'tromso', '2026-06-21T13:00:00Z', () => 5],
]

const DOTS = [
  ['Now: 8pm', 20],
  ['Now: 2am', 2],
]



// CLOUDS

function localHour(date, timeZone) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(date))
}

function cloudsFor(night, timeZone, pick) {
  if (!pick) return null

  return Array.from({ length: night.hours }, (_, h) => pick(localHour(new Date(night.start.getTime() + h * HOUR), timeZone)))
}

function nowIndexAt(night, timeZone, hour) {
  const index = night.times.findIndex(time => localHour(time, timeZone) === hour)

  return index === -1 ? null : index
}



// CASE

function Case({ title, place, date, pick, status = 'ready', now }) {
  const where = PLACES[place]
  const night = buildNight(where, 0, new Date(date))
  const sky = { night, clouds: cloudsFor(night, where.timeZone, pick), nowIndex: now === undefined ? null : nowIndexAt(night, where.timeZone, now) }

  return (
    <div className="case">
      <strong>{title}</strong>
      <small>{`${cloudBars(night, null, null).length} hours shown`}</small>
      <div className="sizes">
        <div className="desktop"><CloudsTile sky={sky} place={where} status={status} /></div>
        <div className="phone"><CloudsTile sky={sky} place={where} status={status} /></div>
      </div>
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Clouds tile</h1>
      <p>Made-up cloud forecasts on real nights, drawn by the same code as the page. Desktop tile width on the left, phone tile width on the right.</p>

      <section>
        <h2>Kinds of nights</h2>
        <div className="cases">
          {SKIES.map(([title, place, date, pick]) => <Case key={title} title={title} place={place} date={date} pick={pick} />)}
        </div>
      </section>

      <section>
        <h2>Unusual nights</h2>
        <div className="cases">
          {EDGES.map(([title, place, date, pick, status]) => <Case key={title} title={title} place={place} date={date} pick={pick} status={status} />)}
        </div>
      </section>

      <section>
        <h2>Where the “now” dot can be</h2>
        <div className="cases">
          {DOTS.map(([title, now]) => <Case key={title} title={`Patchy clouds roll in at 1am. ${title}`} place="kansasCity" date={TONIGHT} pick={SKIES[3][3]} now={now} />)}
        </div>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
