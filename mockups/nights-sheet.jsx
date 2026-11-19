import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import NightsCard from '../src/components/tonight/NightsCard.jsx'



// PLACES

const PLACES = {
  kansasCity: { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago' },
  sydney: { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney' },
  london: { name: 'London', latitude: 51.51, longitude: -0.13, timeZone: 'Europe/London' },
  tromso: { name: 'Tromsø', latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' },
}

const TONIGHT = '2026-11-19T21:00:00Z'
const HOUR = 60 * 60 * 1000



// SKIES

const MIXED = [
  () => 5,
  hour => (hour >= 1 && hour < 12 ? 90 : 5),
  () => 90,
  hour => (hour >= 2 && hour < 4 ? 5 : 90),
  () => 45,
  hour => (hour >= 22 || hour < 12 ? 5 : 90),
  () => 5,
]

const WEEKS = [
  ['A clear week', 'kansasCity', TONIGHT, () => 5],
  ['A mixed week: clouds at 1am, cloudy, a short gap, patchy, clearing at 10pm', 'kansasCity', TONIGHT, (night, hour) => MIXED[night]?.(hour) ?? 5],
  ['A cloudy week', 'kansasCity', TONIGHT, () => 90],
]

const EDGES = [
  ['Checking the forecast', 'kansasCity', TONIGHT, null, 'loading'],
  ['Forecast unavailable', 'kansasCity', TONIGHT, null, 'failed'],
  ['Sydney, southern summer: short nights, Moon lit from the other side', 'sydney', '2026-12-21T05:00:00Z', () => 5],
  ['Tromsø, polar night: dark nearly all day', 'tromso', '2026-12-21T13:00:00Z', () => 5],
  ['London, midsummer: never fully dark', 'london', '2026-06-21T14:00:00Z', () => 5],
  ['Tromsø, midnight Sun: never sets', 'tromso', '2026-06-21T13:00:00Z', () => 5],
]



// FORECAST

function localKey(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit' }).formatToParts(date)
  const value = type => parts.find(part => part.type === type).value

  return { day: `${value('year')}-${value('month')}-${value('day')}`, hour: Number(value('hour')) }
}

function fakeForecast(timeZone, date, pick) {
  if (!pick) return null

  const start = new Date(date).getTime() - 12 * HOUR
  const keys = Array.from({ length: 10 * 24 }, (_, i) => localKey(new Date(start + i * HOUR), timeZone))
  const days = [...new Set(keys.map(key => key.day))]
  const nightOf = key => days.indexOf(key.day) - (key.hour < 12 ? 1 : 0)

  return {
    hourly_units: {},
    hourly: {
      time: keys.map(key => `${key.day}T${String(key.hour).padStart(2, '0')}:00`),
      cloud_cover: keys.map(key => pick(nightOf(key), key.hour)),
    },
  }
}



// CASE

function Case({ title, place, date, pick, status = 'ready' }) {
  const where = PLACES[place]
  const forecast = { raw: fakeForecast(where.timeZone, date, pick), status }

  return (
    <div className="case">
      <strong>{title}</strong>
      <NightsCard place={where} forecast={forecast} now={new Date(date)} />
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
      <h1>Next 7 nights card</h1>
      <p>Made-up cloud forecasts on real nights, drawn by the same code as the page. Open this sheet on a phone-sized window to see the phone layout.</p>

      <section>
        <h2>Kinds of weeks</h2>
        <Cases list={WEEKS} />
      </section>

      <section>
        <h2>Unusual weeks</h2>
        <Cases list={EDGES} />
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
