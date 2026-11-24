import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import IconWell from '../src/components/ui/IconWell.jsx'
import EventIcon from '../src/components/calendar/EventIcon.jsx'
import { Spark } from '../src/components/sky-icons/parts.jsx'



// FRAME

function Icon({ children }) {
  return <svg viewBox="-13 -13 26 26" aria-hidden="true">{children}</svg>
}

const now = icon => () => <EventIcon icon={icon} />



// MOON COVERS A STAR

const CRESCENT = 'M0 -10 A10 10 0 1 0 8 6 A8 8 0 1 1 0 -10 Z'

function LitEdge() {
  return (
    <Icon>
      <Spark x={-8.6} y={-3.2} s={0.5} fill="var(--frost)" />
      <path d={CRESCENT} fill="var(--moon)" transform="translate(1.4 0.8) scale(0.9)" />
    </Icon>
  )
}

function DarkEdge() {
  return (
    <Icon>
      <Spark x={8.4} y={-5.4} s={0.5} fill="var(--frost)" />
      <circle cx="0.6" cy="0.8" r="9" fill="var(--moon-shadow)" />
      <path d={CRESCENT} fill="var(--moon)" transform="translate(0.6 0.8) scale(0.9)" />
    </Icon>
  )
}

function Peeking() {
  return (
    <Icon>
      <circle cx="-8" cy="-4.6" r="3.6" fill="var(--frost)" opacity="0.18" />
      <Spark x={-8} y={-4.6} s={0.6} fill="var(--star-cream)" />
      <path d={CRESCENT} fill="var(--moon)" transform="translate(1.8 1.2) scale(0.86)" />
    </Icon>
  )
}



// ROWS

const ROWS = [
  {
    title: 'Moon covers a star or planet',
    note: 'A crescent Moon with a star tucked half behind its edge. Shown next to today’s “Moon near Regulus” icon and the Moon’s own icons, so it fits with them.',
    options: [
      ['A · Behind the lit edge', () => <LitEdge />, 'The star slips behind the bright crescent'],
      ['B · Behind the dark edge', () => <DarkEdge />, 'The whole Moon shows faintly, and the star hides at its dark side, the way it usually happens'],
      ['C · Peeking, with a glow', () => <Peeking />, 'Like A, with a bigger cream star and a soft glow'],
      ['Now · Moon near Regulus', now('sky:Regulus'), 'For comparison'],
      ['Now · Moon closest', now('moon-close'), 'For comparison'],
    ],
  },
]



// OPTION

function Option({ name, Draw, note, current }) {
  return (
    <div className={current ? 'option now' : 'option'}>
      <div className="sizes">
        <span className="big"><Draw /></span>
        <IconWell><Draw /></IconWell>
      </div>
      <strong>{name}</strong>
      {note && <small>{note}</small>}
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Icon options</h1>
      <p>Each option is shown large and at its real size in an icon square. Darker cards are today’s icons; the others are the fixes.</p>

      {ROWS.map(row => (
        <section key={row.title}>
          <h2>{row.title}</h2>
          <p>{row.note}</p>
          <div className="options">
            {row.options.map(([name, Draw, note]) => <Option key={name} name={name} Draw={Draw} note={note} current={name.startsWith('Now')} />)}
          </div>
        </section>
      ))}
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
