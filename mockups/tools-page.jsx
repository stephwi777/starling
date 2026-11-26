import { createRoot } from 'react-dom/client'
import { MemoryRouter, Link } from 'react-router'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/App.css'
import { PlaceProvider } from '../src/place/PlaceContext.jsx'
import { SettingsProvider } from '../src/settings/SettingsContext.jsx'
import Header from '../src/components/Header.jsx'
import Footer from '../src/components/Footer.jsx'



// OPTIONS

const variant = new URLSearchParams(location.search).get('v')



// SCENES

function Hills() {
  return (
    <>
      <path d="M0 150 C50 128 90 132 140 146 C190 160 240 126 320 138 V200 H0 Z" fill="var(--far-hills)" />
      <path d="M0 172 C70 156 130 160 190 172 C240 182 280 166 320 168 V200 H0 Z" fill="var(--horizon)" />
    </>
  )
}

function Stars({ spots }) {
  return spots.map(([x, y, r], index) => <circle key={index} cx={x} cy={y} r={r} fill="var(--frost)" opacity={r > 1.2 ? 0.9 : 0.55} />)
}

const STARS = [[24, 30, 1], [70, 18, 1.4], [112, 52, 0.9], [160, 22, 1], [214, 40, 1.5], [262, 16, 1], [296, 58, 0.9], [40, 84, 0.9], [188, 92, 0.8], [282, 100, 1]]

function StationScene() {
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="320" height="200" fill="var(--moonlit-middle)" />
      <Stars spots={STARS} />
      <path d="M18 160 C80 40 240 40 302 160" fill="none" stroke="var(--mist)" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.1 9" opacity="0.7" />
      <circle cx="206" cy="66" r="10" fill="var(--frost)" opacity="0.18" />
      <circle cx="206" cy="66" r="4" fill="var(--frost)" />
      <Hills />
    </svg>
  )
}

function AuroraScene() {
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="320" height="200" fill="var(--moonlit-middle)" />
      <Stars spots={STARS} />
      <path d="M0 96 C50 70 90 110 150 86 C210 62 250 100 320 80 V52 C250 70 210 34 150 58 C90 82 50 42 0 66 Z" fill="var(--lilac)" opacity="0.45" />
      <path d="M0 120 C60 96 110 132 170 108 C230 86 270 118 320 104 V82 C270 96 230 62 170 86 C110 110 60 72 0 96 Z" fill="var(--teal)" opacity="0.8" />
      <Hills />
    </svg>
  )
}



// TOOLS

const TOOLS = [
  { id: 'passes', title: 'Space station passes', line: 'See when the station flies over you!', scene: <StationScene /> },
  { id: 'aurora', title: 'Aurora', line: 'Could you catch an aurora tonight?', scene: <AuroraScene /> },
  { id: 'chart', title: 'Star chart', line: 'Find your way around tonight’s sky.' },
  { id: 'almanac', title: 'Almanac', line: 'Rise, set and twilight times for any date.' },
  { id: 'printables', title: 'Printable charts', line: 'Star wheels and finder charts to print and take outside.' },
  { id: 'jupiter', title: 'Jupiter’s moons', line: 'See where Jupiter’s four big moons are tonight.' },
  { id: 'moon-map', title: 'Moon map', line: 'Seas and craters you can spot with binoculars.' },
  { id: 'eyepiece', title: 'Eyepiece view', line: 'See how an object will look in your telescope or camera.' },
  { id: 'map', title: 'Sky map', line: 'Dark places, light pollution and the aurora on one map.' },
  { id: 'satellite', title: 'Live cloud satellite', line: 'Watch the clouds move in from space.' },
  { id: 'phone', title: 'Phone sky view', line: 'Hold up your phone and see what you’re looking at.' },
  { id: 'photo', title: 'Photo star finder', line: 'Share a night photo and we’ll name what’s in it.' },
  { id: 'solar-system', title: 'Solar system view', line: 'See where the planets are around the Sun.' },
  { id: 'sunset', title: 'Sunset forecast', line: 'Will tonight’s sunset be a colorful one?' },
  { id: 'moonbow', title: 'Moonbow chances', line: 'A rainbow by moonlight. Rare, but here’s when to look.' },
]

function ready(tool) {
  return variant === 'later' && (tool.id === 'passes' || tool.id === 'aurora')
}



// TILE

function Tile({ tool }) {
  const open = ready(tool)

  return (
    <li className="tool">
      <div className="tool-art">
        {open ? tool.scene : <span>Coming soon</span>}
      </div>

      <div className="tool-text">
        <h2>{open ? <Link to={`/tools/${tool.id}`}>{tool.title}</Link> : tool.title}</h2>
        <p>{tool.line}</p>
      </div>
    </li>
  )
}



// PAGE

function Page() {
  return (
    <MemoryRouter initialEntries={['/tools']}>
      <PlaceProvider>
        <SettingsProvider>
          <Header />

          <main className="tools-page">
            <div className="inner">
              <h1>Sky tools</h1>
              <p>Handy tools for planning your night out!</p>

              <ul className="tool-grid">
                {TOOLS.map(tool => <Tile key={tool.id} tool={tool} />)}
              </ul>
            </div>
          </main>

          <Footer />
        </SettingsProvider>
      </PlaceProvider>
    </MemoryRouter>
  )
}



// SHEET

const STATES = [
  { id: 'launch', name: 'At launch', note: 'Every tool is still coming soon: a plain color block, the words “Coming soon”, and no link.' },
  { id: 'later', name: 'Later, with two tools ready', note: 'Space station passes and Aurora are ready, with rough first scenes built from Starling’s hills, stars and aurora colors. Ready tiles open on click and press in gently.' },
]

function Sheet() {
  return (
    <main className="sheet">
      <h1>Sky tools page</h1>
      <p>The real header and footer around the proposed Tools page. Wide screens on the left (shrunk to fit), phones on the right. The scenes are rough stand-ins; each tool’s real scene gets designed with the tool.</p>

      {STATES.map(state => (
        <div key={state.id}>
          <h2>{state.name}</h2>
          <small>{state.note} <a href={`?v=${state.id}`} target="_blank" rel="noreferrer">Open full size</a></small>

          <div className="frames">
            <div className="wide-frame"><iframe title={`${state.name}, wide`} src={`?v=${state.id}`} /></div>
            <iframe className="phone-frame" title={`${state.name}, phone`} src={`?v=${state.id}`} />
          </div>
        </div>
      ))}
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(variant ? <Page /> : <Sheet />)

export default Sheet
