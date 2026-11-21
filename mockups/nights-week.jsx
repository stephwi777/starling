import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import Card from '../src/components/ui/Card.jsx'
import IconWell from '../src/components/ui/IconWell.jsx'
import { NightsIcon, PhaseMoon, RainIcon, SnowIcon } from '../src/components/ui/icons.jsx'



// MADE-UP WEEK

const HOURS = 14

const MARKS = [['6pm', 1], ['midnight', 7], ['6am', 13]]

const WEEK = [
  { day: 'Tonight', lit: 72, hours: 'ttdddmmmmmmmtt' },
  { day: 'Sat', lit: 62, hours: 'ttcccccccccctt', fall: 'rain' },
  { day: 'Sun', lit: 52, hours: 'ttccddmmmmcctt' },
  { day: 'Mon', lit: 41, hours: 'ttddddddmmmmtt', best: true },
  { day: 'Tue', lit: 31, hours: 'ttcccccccmmmtt' },
  { day: 'Wed', lit: 21, hours: 'ttcccccccccctt', fall: 'snow' },
  { day: 'Thu', lit: 12, hours: 'ttddddcccccctt' },
]

const share = hours => `${(hours / HOURS) * 100}%`
const count = (night, kind) => [...night.hours].filter(hour => hour === kind).length
const cloudy = night => !count(night, 'd') && !count(night, 'm')

function angleOf(lit) {
  return 360 - (Math.acos(1 - 2 * (lit / 100)) * 180) / Math.PI
}

function runs(hours) {
  const list = []

  ;[...hours].forEach((kind, i) => {
    const last = list.at(-1)

    if (last && last.kind === kind) last.to = i + 1
    else list.push({ kind, from: i, to: i + 1 })
  })

  return list
}



// SHARED PIECES

function Day({ night }) {
  return (
    <span className="night-day">
      <strong>{night.day}</strong>
      {night.best && <span className="night-best">Best night</span>}
    </span>
  )
}

function Moon({ night }) {
  return (
    <span className="night-moon">
      <PhaseMoon angle={angleOf(night.lit)} size={24} />
      {night.lit}%
    </span>
  )
}

function Wet({ fall }) {
  const Icon = fall === 'snow' ? SnowIcon : RainIcon

  return <span className="night-none"><Icon />{fall === 'snow' ? 'Snow' : 'Rain'} likely</span>
}

function Scale() {
  return (
    <div className="nights-scale" aria-hidden="true">
      <div>{MARKS.map(([label, at]) => <span key={label} style={{ left: share(at) }}>{label}</span>)}</div>
    </div>
  )
}

function Key() {
  return (
    <div className="key4" aria-hidden="true">
      <span><i className="d" />Clear & truly dark</span>
      <span><i className="m" />Clear, Moon up</span>
      <span><i className="c" />Cloudy</span>
      <span><i className="t" />Twilight</span>
    </div>
  )
}

function Shell({ children, scale = true, keyed = true }) {
  return (
    <Card>
      <div className="card-head">
        <IconWell><NightsIcon /></IconWell>
        <h2>Next 7 nights</h2>
        <a className="card-link" href="#calendar">Calendar</a>
      </div>

      <div className="nights-body three-up">
        {scale && <Scale />}
        <ul className="nights">{children}</ul>
        {keyed && <Key />}
      </div>
    </Card>
  )
}



// 1 · BRIGHTER IS BETTER

function GlowRow({ night }) {
  const pieces = runs(night.hours)

  return (
    <li>
      <Day night={night} />
      <Moon night={night} />
      {night.fall ? <Wet fall={night.fall} /> : (
        <span className="glow-bar" aria-hidden="true">
          {pieces.map((piece, i) => (
            <i
              key={piece.from}
              className={[piece.kind, i === 0 && 'first', i === pieces.length - 1 && 'last'].filter(Boolean).join(' ')}
              style={{ left: share(piece.from), width: share(piece.to - piece.from) }}
            />
          ))}
        </span>
      )}
    </li>
  )
}



// 2 · HOUR BLOCKS

function BlockRow({ night }) {
  return (
    <li>
      <Day night={night} />
      <Moon night={night} />
      {night.fall ? <Wet fall={night.fall} /> : (
        <span className="blocks" aria-hidden="true">
          {[...night.hours].map((kind, i) => <i key={i} className={kind} />)}
        </span>
      )}
    </li>
  )
}



// 3 · JUST THE NUMBER

function CountRow({ night }) {
  const dark = count(night, 'd')
  const moonlit = count(night, 'm')

  return (
    <li>
      <Day night={night} />
      <Moon night={night} />
      {night.fall && <Wet fall={night.fall} />}
      {!night.fall && cloudy(night) && <span className="night-none">Cloudy all night</span>}
      {!night.fall && !cloudy(night) && (
        <span className="count">
          {dark > 0 && <b>{dark} hr dark</b>}
          {dark > 0 && moonlit > 0 && <span> · </span>}
          {moonlit > 0 && <span>{moonlit} hr under the Moon</span>}
        </span>
      )}
    </li>
  )
}



// SHEET

function Both({ Row, scale, keyed }) {
  return (
    <div className="sizes">
      <div className="desktop"><Shell scale={scale} keyed={keyed}>{WEEK.map(night => <Row key={night.day} night={night} />)}</Shell></div>
      <div className="phone"><Shell scale={scale} keyed={keyed}>{WEEK.map(night => <Row key={night.day} night={night} />)}</Shell></div>
    </div>
  )
}

function Sheet() {
  return (
    <main className="sheet">
      <h1>Next 7 nights: reading the bars</h1>
      <p>One made-up week three ways. Moon waning from 72% to 12%. Monday is best: clear and truly dark 6pm–1am. Sunday is clear but mostly under the Moon, Tuesday clears only after 2am, Thursday clouds over at 11pm. Desktop width on the left, phone width on the right.</p>

      <section>
        <h2>1 · Brighter means better</h2>
        <p>One smooth bar per night in one color family: bright teal is clear and truly dark, dim teal is clear under the Moon, soft gray is cloudy, and the plain track at the ends is twilight.</p>
        <Both Row={GlowRow} />
      </section>

      <section>
        <h2>2 · Hour blocks</h2>
        <p>The same colors, one block per hour from 5pm to 7am. Count the bright blocks to compare nights.</p>
        <Both Row={BlockRow} />
      </section>

      <section>
        <h2>3 · Just the number</h2>
        <p>No bar: the hours of clear dark sky, then the clear hours under the Moon. Fastest to compare, but it doesn’t say when.</p>
        <Both Row={CountRow} scale={false} keyed={false} />
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
