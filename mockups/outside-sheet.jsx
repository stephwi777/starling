import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import Card from '../src/components/ui/Card.jsx'
import {
  ClearIcon,
  ClockIcon,
  CloudIcon,
  MoonsetIcon,
  PatchyIcon,
  SparkleIcon,
  SunsetIcon,
  TwilightIcon,
} from '../src/components/ui/icons.jsx'



// SAMPLE NIGHT

const rainy = i => i === 7 || i === 8

const BARS = [5, 5, 5, 5, 10, 40, 85, 95, 95, 80, 40, 10, 5].map((cover, i) => ({
  cover,
  kind: cover < 20 ? 'clear' : cover < 60 ? 'patchy' : 'cloudy',
  rain: rainy(i),
  now: i === 0,
}))

const PANEL = [
  [5, 0, 0, 5], [5, 0, 0, 5], [5, 0, 0, 5], [5, 0, 0, 5], [10, 0, 5, 5], [40, 10, 20, 10],
  [85, 40, 30, 15], [95, 60, 25, 10], [95, 65, 20, 10], [80, 45, 25, 10], [40, 15, 15, 10], [10, 0, 5, 5], [5, 0, 0, 5], [5, 0, 0, 5],
].map(([cover, low, mid, high], i) => ({ cover, low, mid, high, rain: rainy(i) }))

const PANEL_LABELS = ['6pm', '9pm', '12am', '3am', '6am']

const HOURS = [
  ['4:45pm', 'sunset', 'Sunset', 43, 'moment'],
  ['5pm', 'twilight', 'Twilight', 42],
  ['6pm', 'twilight', 'Twilight', 40],
  ['6:17pm', 'fully-dark', 'Fully dark', 39, 'moment'],
  ['7pm', 'clear', 'Clear', 38],
  ['8pm', 'clear', 'Clear', 37],
  ['Now', 'clear', 'Clear', 36, 'now'],
  ['10pm', 'patchy', 'Patchy', 35],
  ['11pm', 'cloudy', 'Cloudy', 34],
  ['12am', 'rain', 'Rain', 34],
  ['1am', 'rain', 'Rain', 33],
  ['2am', 'cloudy', 'Cloudy', 32],
  ['3am', 'patchy', 'Patchy', 31],
  ['3:21am', 'moonset', 'Moonset', 31, 'moment'],
  ['4am', 'clear', 'Clear', 30],
]



// ICONS

const DROP = 'M0 -4.2 Q3.2 0 3.2 1.6 A3.2 3.2 0 0 1 -3.2 1.6 Q-3.2 0 0 -4.2 Z'

function RainIcon() {
  return (
    <svg viewBox="-13 -13 26 26" aria-hidden="true">
      <g fill="var(--frost)" transform="translate(0 -3)">
        <circle cx="-5.5" cy="2.5" r="4.5" />
        <circle cx="0.5" cy="-1" r="6.5" />
        <circle cx="5.5" cy="2.5" r="4.5" />
        <rect x="-5.5" y="2.5" width="11" height="4.5" />
      </g>
      <path d={DROP} fill="var(--star-blue)" transform="translate(-4 9) scale(0.7)" />
      <path d={DROP} fill="var(--star-blue)" transform="translate(4 9) scale(0.7)" />
    </svg>
  )
}

function Flake({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="var(--frost)" strokeWidth="1.3" strokeLinecap="round">
      <path d="M0 -3.6 V3.6 M-3.1 -1.8 L3.1 1.8 M-3.1 1.8 L3.1 -1.8" />
    </g>
  )
}

const ICONS = {
  'sunset': SunsetIcon,
  'twilight': TwilightIcon,
  'fully-dark': SparkleIcon,
  'clear': ClearIcon,
  'patchy': PatchyIcon,
  'cloudy': CloudIcon,
  'rain': RainIcon,
  'moonset': MoonsetIcon,
}



// CLOUD BARS

const SHADES = {
  clear: 'var(--raised)',
  patchy: 'var(--snow-shade)',
  cloudy: 'var(--mist)',
}

function Fall({ snow, x, y, scale = 1 }) {
  if (snow) return <g transform={`scale(${scale})`}><Flake x={x / scale} y={y / scale} /></g>

  return <path d={DROP} fill="var(--star-blue)" transform={`translate(${x} ${y}) scale(${scale})`} />
}

function CloudBars({ snow }) {
  const slot = 160 / BARS.length
  const width = slot * 0.74

  return (
    <svg viewBox="0 -12 160 60" width="100%" height="60" aria-hidden="true">
      {BARS.map((bar, i) => {
        const x = i * slot + (slot - width) / 2
        const height = 6 + bar.cover * 0.3
        const top = 40 - height

        return (
          <g key={i}>
            <rect x={x} y={top} width={width} height={height} rx={Math.min(4, width / 2)} fill={SHADES[bar.kind]} />
            {bar.rain && <Fall snow={snow} x={x + width / 2} y={top - 6} />}
            {bar.now && <circle cx={x + width / 2} cy="45" r="2.5" fill="var(--frost)" />}
          </g>
        )
      })}
    </svg>
  )
}

function CloudsTile({ snow }) {
  return (
    <section className="tile">
      <h2>Clouds</h2>
      <CloudBars snow={snow} />
      <strong>Clear till 10pm</strong>
      <p>{snow ? 'Snow' : 'Rain'} likely 12am–2am.</p>
    </section>
  )
}

function TileCase({ snow, title }) {
  return (
    <div className="case">
      <h3>{title}</h3>
      <div className="sizes">
        <div className="desktop"><CloudsTile snow={snow} /></div>
        <div className="phone"><CloudsTile snow={snow} /></div>
      </div>
    </div>
  )
}



// PANEL CHART

const WIDTH = 320
const HEIGHT = 104
const BASE = HEIGHT - 6
const SCALE = (HEIGHT - 32) / 100

const FILLS = {
  low: { fill: 'var(--frost)', opacity: 1 },
  mid: { fill: 'var(--snow-shade)', opacity: 1 },
  high: { fill: 'var(--snow)', opacity: 0.45 },
}

function PanelCloud({ x, top, size, lift = 0 }) {
  const k = size / 22

  return (
    <g transform={`translate(${x} ${top - 2 - 7 * k - lift}) scale(${k})`} fill="var(--frost)">
      <circle cx="-5.5" cy="2.5" r="4.5" />
      <circle cx="0.5" cy="-1" r="6.5" />
      <circle cx="5.5" cy="2.5" r="4.5" />
      <rect x="-5.5" y="2.5" width="11" height="4.5" />
    </g>
  )
}

function PanelBar({ hour, x, width, cell, look, snow }) {
  let top = BASE

  const parts = [['low', hour.low], ['mid', hour.mid], ['high', hour.high]].filter(([, v]) => v > 0).map(([layer, value]) => {
    const sum = hour.low + hour.mid + hour.high
    const height = ((value * hour.cover) / sum) * SCALE

    top -= height

    return <rect key={layer} x={x} y={top} width={width} height={height} {...FILLS[layer]} />
  })

  const size = cell * 0.9
  const middle = x + width / 2
  const k = size / 22
  const lift = hour.rain && look === 'under' ? 7 : 0
  const cloudTop = top - 2 - 7 * k - lift - 7.5 * k

  return (
    <g>
      {parts}
      {hour.cover < 5 && <rect x={x} y={BASE - 3} width={width} height="3" rx="1.5" fill="var(--raised)" />}
      {hour.cover >= 60 && <PanelCloud x={middle} top={top} size={size} lift={lift} />}
      {hour.rain && look === 'above' && <Fall snow={snow} x={middle} y={cloudTop - 5} scale={0.9} />}
      {hour.rain && look === 'under' && (
        <>
          <Fall snow={snow} x={middle - 3.2} y={top - 4.5} scale={0.62} />
          <Fall snow={snow} x={middle + 3.2} y={top - 4.5} scale={0.62} />
        </>
      )}
    </g>
  )
}

function PanelChart({ look, snow }) {
  const cell = WIDTH / PANEL.length
  const width = cell * 0.62

  return (
    <div className="mini-panel">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" aria-hidden="true">
        {PANEL.map((hour, i) => <PanelBar key={i} hour={hour} x={i * cell + (cell - width) / 2} width={width} cell={cell} look={look} snow={snow} />)}
      </svg>
      <div className="mini-labels">{PANEL_LABELS.map(label => <span key={label}>{label}</span>)}</div>
    </div>
  )
}

function PanelCase({ look, snow, title, note }) {
  return (
    <div className="case">
      <h3>{title}</h3>
      <PanelChart look={look} snow={snow} />
      <small>{note}</small>
    </div>
  )
}



// HOURS CARD

function HoursCard() {
  return (
    <Card className="hours-card">
      <h2><ClockIcon />Hour by hour</h2>

      <p className="hours-summary">Clear until clouds roll in around 10pm, with rain likely 12am–2am. The Moon sets at 3:21am.</p>

      <div className="hours-row">
        <ul className="hours" tabIndex={0}>
          {HOURS.map(([time, kind, word, temp, type]) => {
            const Icon = ICONS[kind]

            return (
              <li key={time} className={type}>
                <span className="hour-time">{time}</span>
                <Icon />
                {type === 'moment'
                  ? <span className="hour-word">{word}</span>
                  : <span className="hour-word"><span className="visually-hidden">{word}, </span>{temp}°</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </Card>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Rain, snow and temperature</h1>
      <p>A made-up night: clear until 10pm, clouds roll in, rain (or snow) likely 12am–2am, slowly cooling from 43° to 30°. Drawn with the page’s real styles and icons.</p>

      <section>
        <h2>Hour by hour</h2>
        <p>One line under each icon. Key moments keep their word; every other hour shows its temperature. The icon still tells the sky, and screen readers hear the word too (“Clear, 38°”).</p>
        <div className="wide">
          <HoursCard />
        </div>
      </section>

      <section>
        <h2>Clouds tile</h2>
        <p>A drop or flake floats above each rainy or snowy bar. Desktop width on the left, phone width on the right.</p>

        <div className="cases">
          <TileCase title="Rain" />
          <TileCase snow title="Snow" />
        </div>
      </section>

      <section>
        <h2>Clouds panel</h2>
        <p>Here bars at 60% or more already wear a small cloud, so the drop has to work with it. Two ways, each with rain and snow.</p>

        <div className="cases">
          <PanelCase look="above" title="1 · Drop above the cloud" note="Drop, then cloud, then bar, the same order as the tile." />
          <PanelCase look="above" snow title="1 · Snow" note="A small flake above the cloud." />
          <PanelCase look="under" title="2 · Rain falling from the cloud" note="The cloud lifts a little and two drops fall under it, like the hourly row’s Rain icon." />
          <PanelCase look="under" snow title="2 · Snow" note="Two flakes under the cloud." />
        </div>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
