import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import IconWell from '../src/components/ui/IconWell.jsx'
import { Clipped } from '../src/components/sky-icons/parts.jsx'



// SHAPES

function smooth(points) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const f = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`
  const closed = [...points, points[0]]
  let d = `M${f(mid(points[0], points[1]))}`

  for (let i = 1; i < closed.length; i++) {
    const next = closed[i + 1] ?? closed[1]

    d += ` Q${f(closed[i])} ${f(mid(closed[i], next))}`
  }

  return `${d} Z`
}

const TRACED = [
  smooth([[-11, -11], [-0.6, -11], [-0.4, -9.6], [-1, -7.6], [-2.3, -6.7], [-3.4, -5.9], [-3.6, -4.4], [-4.6, -4.6], [-6, -4.8], [-7, -4.3], [-7, -3], [-6.6, -1.6], [-5.8, -0.4], [-5, 0.2], [-6.6, 0.2], [-8.4, -0.4], [-9.7, -2.7], [-11, -2.6]]),
  smooth([[-4.6, 0.2], [-2.7, -1], [-0.4, -0.4], [1.9, 0.4], [3.3, 1.6], [3.7, 2.7], [2.4, 4.1], [0.7, 5.9], [-0.1, 7.3], [-0.2, 9.4], [0.4, 10.4], [-1.6, 9.6], [-2.4, 7.4], [-3.2, 5], [-4.2, 2.8], [-4.9, 1.2]]),
  smooth([[11, -5.2], [8.7, -4.8], [6.4, -3.9], [4.9, -2.6], [4.7, -1], [5.6, 0.4], [6.4, 2.4], [6.9, 4.7], [6.7, 7.3], [7.4, 9], [11, 9]]),
  smooth([[6.6, -11], [11, -11], [11, -6.2], [8.7, -5.6], [7, -5.8], [5.9, -6.6], [6.1, -8], [6.6, -9.4]]),
]

const AMERICAS = [
  smooth([[-11, -11], [1.4, -11], [0.8, -8.4], [-1, -6.8], [-1.4, -4.6], [-3, -3.6], [-4.4, -1.6], [-3.6, 0.2], [-6, -0.8], [-8.2, -2.2], [-11, -2.6]]),
  smooth([[-3.4, 0.6], [0, -0.6], [3.6, 1.2], [4, 3.8], [1.8, 6.6], [0.2, 10.8], [-1.6, 8.2], [-3, 4.6], [-4, 2]]),
]

const AFRICA = [
  smooth([[-6, -1.4], [-4.4, -4], [-0.6, -5], [2.6, -4.2], [4.6, -2.8], [5.6, -0.6], [6.6, 1.2], [5.2, 3.2], [3.6, 5.6], [1.8, 8], [0.4, 8.6], [-0.4, 6.4], [-0.8, 3.8], [-2.2, 1.6], [-4.6, 0.8]]),
  smooth([[-7.4, -6.4], [-4.6, -8.8], [-0.6, -10.4], [3.8, -9.8], [3.4, -7.6], [0.4, -6.6], [-3.4, -6.2]]),
  smooth([[5.4, -4.2], [8.2, -3.6], [7.8, -1.2], [6, -2]]),
]

const BLOBS = [
  'M-9 -6 C-6 -9 -1 -8 -1.5 -4.5 C-2 -2 -6 -1.5 -9 -3 Z',
  'M-2 1 C1 -0.5 4 1.5 3 4.5 C2 7 0 8.5 -1 7 C-2 5 -3.5 3 -2 1 Z',
  'M6 -5 C9 -6 10 -2 9 1 C8 3 6 2 6 -1 Z',
]

const SWOOSH = [
  'M-11 -3 C-6 -8 -1 -4 3 -8 C6 -10.5 9 -9 11 -7 V-11 H-11 Z',
  'M-11 5 C-6 1 -2 6 2 3 C5 0.6 8 2 11 4 V8 C8 6 5 5 2 7.4 C-2 10 -6 6 -11 9 Z',
]



// GLOBE

function Globe({ sea, land, shapes, islands, grid, ring }) {
  return (
    <>
      {ring && <circle r="10.8" fill="none" stroke={sea} strokeWidth="0.9" opacity="0.5" />}
      <Clipped shape={<circle r="10" />}>
        <circle r="10" fill={sea} />
        {shapes.map(d => <path key={d} d={d} fill={land} />)}
        {islands && <><ellipse cx="-2.4" cy="-2.9" rx="1.1" ry="0.55" fill={land} /><ellipse cx="6.4" cy="5" rx="0.6" ry="1.4" fill={land} /></>}
        {grid && (
          <g fill="none" stroke="var(--frost)" strokeWidth="0.7" opacity="0.35">
            <ellipse rx="4.2" ry="10" />
            <path d="M0 -10 V10 M-10 0 H10" />
            <path d="M-8.7 -5 Q0 -3 8.7 -5 M-8.7 5 Q0 7 8.7 5" />
          </g>
        )}
      </Clipped>
    </>
  )
}

const EARTH = { sea: 'var(--earth-sea)', land: 'var(--earth-land)' }
const SOFT = { sea: 'var(--neptune)', land: 'var(--meteor-teal)' }

const VERSIONS = [
  ['1 · Traced', 'Last round’s, for comparison', { ...EARTH, shapes: TRACED, islands: false }],
  ['2 · Americas, simple', 'Like the 🌎 emoji: two big shapes', { ...EARTH, shapes: AMERICAS }],
  ['3 · Africa and Europe', 'Like the 🌍 emoji: the most recognizable outline', { ...EARTH, shapes: AFRICA, islands: true }],
  ['4 · Globe lines', 'Americas with faint globe lines, like a classroom globe', { ...EARTH, shapes: AMERICAS, grid: true }],
  ['5 · Africa and lines', 'The 🌍 view with globe lines', { ...EARTH, shapes: AFRICA, grid: true }],
  ['6 · Soft blobs', 'Three rounded land shapes, no real map', { ...EARTH, shapes: BLOBS }],
  ['7 · Swooshes', 'Two wavy land bands: very simple, still reads as a planet with land', { ...EARTH, shapes: SWOOSH }],
  ['8 · Thin ring', 'Americas with a thin outer ring, like an atmosphere', { ...EARTH, shapes: AMERICAS, ring: true }],
  ['9 · Site colors', 'The 🌍 view in the site’s own blue and teal', { ...SOFT, shapes: AFRICA }],
  ['10 · Site colors, Americas', 'The 🌎 view in the site’s own blue and teal', { ...SOFT, shapes: AMERICAS }],
]



// IN USE

const CRESCENT = 'M0 -10 A10 10 0 1 0 8 6 A8 8 0 1 1 0 -10 Z'

function Earth({ globe, x = 0, y = 0, r = 10 }) {
  return <g transform={`translate(${x} ${y}) scale(${r / 10})`}><Globe {...globe} /></g>
}

function Alone({ globe }) {
  return <svg viewBox="-13 -13 26 26" aria-hidden="true"><Earth globe={globe} /></svg>
}

function MoonClose({ globe }) {
  return (
    <svg viewBox="-13 -13 26 26" aria-hidden="true">
      <Earth globe={globe} x={-6} y={6} r={5} />
      <path d="M-1.6 1.6 L0.4 -0.4" stroke="var(--mist)" strokeWidth="1" strokeDasharray="1.2 1.4" strokeLinecap="round" />
      <path d={CRESCENT} fill="var(--moon)" transform="translate(5 -5) scale(0.62)" />
    </svg>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Earth options</h1>
      <p>Each Earth is shown big, at real size, and inside the “Moon closest” icon, where it appears small.</p>

      <div className="options">
        {VERSIONS.map(([name, note, globe]) => (
          <div key={name} className="option">
            <svg className="huge" viewBox="-11 -11 22 22" aria-hidden="true"><Earth globe={globe} /></svg>
            <div className="uses">
              <IconWell><Alone globe={globe} /></IconWell>
              <IconWell><MoonClose globe={globe} /></IconWell>
            </div>
            <strong>{name}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
