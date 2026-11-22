import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import { PlaceProvider } from '../src/place/PlaceContext.jsx'
import { SettingsProvider } from '../src/settings/SettingsContext.jsx'
import App from '../src/App.jsx'



// OPTIONS

const OPTIONS = [
  { id: 'a', name: 'A · One-line labels', note: 'Like Google Calendar: a tinted label per event, cut off at the edge of the day. Up to 3 a day.' },
  { id: 'b', name: 'B · Colored edge', note: 'No box: a colored line and up to two lines of tinted text. Up to 2 a day.' },
  { id: 'c', name: 'C · Two-line labels', note: 'Tinted labels that wrap onto a second line, so more of each name shows. Up to 2 a day.' },
  { id: 'd', name: 'D · Short names', note: 'Like C, but each label keeps only the part that matters: Pleiades, Mars, Leonids, Full Moon. The color says which group.' },
  { id: 'now', name: 'Today', note: 'The current bars, for comparison.' },
]

const variant = new URLSearchParams(location.search).get('v')



// SHORT NAMES

const RULES = [
  [/^Moon (near|meets) (.+)$/, '$2'],
  [/^Northern (.+) peak$/, 'N. $1'],
  [/^Southern (.+) peak$/, 'S. $1'],
  [/^(.+) peak$/, '$1'],
  [/^(.+) at its (best|brightest)$/, '$1'],
  [/^(.+) (turns around|passes the Sun|closest to Sun)$/, '$1'],
  [/^Full .+ Moon$/, 'Full Moon'],
  [/^Moon crosses .+$/, 'Node'],
  [/^Moon (closest|farthest)$/, (all, word) => word[0].toUpperCase() + word.slice(1)],
  [/^Milky Way season .+$/, 'Milky Way'],
  [/^(\w+) (meets|near|in) (the )?(.+)$/, '$1 & $4'],
  [/^(\d) planets .+$/, '$1 planets'],
]

function shortName(text) {
  const rule = RULES.find(([pattern]) => pattern.test(text))

  return rule ? text.replace(rule[0], rule[1]) : text
}

function ShortNames() {
  useEffect(() => {
    const timer = setInterval(() => {
      document.querySelectorAll('.day-bars span:not([data-short])').forEach(span => {
        span.dataset.short = ''
        span.textContent = shortName(span.textContent)
      })
    }, 200)

    return () => clearInterval(timer)
  }, [])

  return null
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Event names on phones</h1>
      <p>Each frame is the real Calendar page at phone width. Tapping a day still lists its events below the calendar with full names.</p>

      <div className="frames">
        {OPTIONS.map(option => (
          <div key={option.id}>
            <h2>{option.name}</h2>
            <small>{option.note}</small>
            <iframe title={option.name} src={`?v=${option.id}`} />
          </div>
        ))}
      </div>
    </main>
  )
}



// PAGE

function Page() {
  return (
    <MemoryRouter initialEntries={['/calendar']}>
      <PlaceProvider>
        <SettingsProvider>
          <App />
          {variant === 'd' && <ShortNames />}
        </SettingsProvider>
      </PlaceProvider>
    </MemoryRouter>
  )
}



// RENDER

if (variant && variant !== 'now') document.documentElement.dataset.phone = variant

createRoot(document.getElementById('root')).render(variant ? <Page /> : <Sheet />)

export default Sheet
