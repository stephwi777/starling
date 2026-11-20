import { Link } from 'react-router'
import { cloudBars, cloudWords } from '../../sky/clouds.js'
import { darkNow, darknessWords } from '../../sky/darkness.js'
import { seeingWords } from '../../sky/seeing.js'
import { moonTiming, nextFull } from '../../sky/moon.js'
import { PhaseMoon } from '../ui/icons.jsx'



// TILE LINK

function TileLink({ id, to, link, panelClose }) {
  function toggle(event) {
    if (!panelClose.current) return

    event.preventDefault()
    panelClose.current()
  }

  return <Link ref={link} className="tile-link" aria-labelledby={id} to={to} state={{ fromTonight: true }} onClick={toggle} />
}



// CLOUD BARS

const SHADES = {
  clear: 'var(--raised)',
  patchy: 'var(--snow-shade)',
  cloudy: 'var(--mist)',
}

function CloudBars({ bars }) {
  const slot = 160 / Math.max(bars.length, 1)
  const width = slot * 0.74

  return (
    <svg viewBox="0 0 160 48" width="100%" height="48" aria-hidden="true">
      {bars.map((bar, i) => {
        const x = i * slot + (slot - width) / 2
        const height = 6 + (bar.cover ?? 0) * 0.3

        return (
          <g key={i}>
            <rect x={x} y={40 - height} width={width} height={height} rx={Math.min(4, width / 2)} fill={SHADES[bar.kind] ?? 'var(--raised)'} opacity={bar.kind ? 1 : 0.5} />
            {bar.now && <circle cx={x + width / 2} cy="45" r="2.5" fill="var(--frost)" />}
          </g>
        )
      })}
    </svg>
  )
}



// CLOUDS TILE

export function CloudsTile({ sky, place, status, link, panelClose }) {
  const words = cloudWords({ night: sky.night, clouds: sky.clouds, status, timeZone: place.timeZone })

  return (
    <section className="tile" aria-labelledby="tile-clouds">
      <h2 id="tile-clouds">Clouds</h2>
      <TileLink id="tile-clouds" to="clouds" link={link} panelClose={panelClose} />
      <CloudBars bars={cloudBars(sky.night, sky.clouds, sky.nowIndex)} />
      <strong>{words.value}</strong>
      <p>{words.line}</p>
    </section>
  )
}



// SUN PATH

const HORIZON = 44
const RISE = 38
const SOFT = 25

function height(alt) {
  if (alt >= 0) return Math.min(53, HORIZON + (alt * RISE) / SOFT)

  return HORIZON - Math.tanh(-alt / SOFT) * RISE
}

function stretches(points, alts, keep) {
  return points.map(([x, y], i) => (keep(alts[i]) ? `${i > 0 && keep(alts[i - 1]) ? 'L' : 'M'}${x} ${y}` : '')).join(' ').trim()
}

function Stroke({ d, color, opacity }) {
  return d ? <path d={d} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} /> : null
}

function SunPath({ night, nowIndex }) {
  const points = night.sun.map((alt, i) => [4 + (i / (night.sun.length - 1)) * 152, height(alt)])
  const now = nowIndex === null ? null : points[nowIndex]

  return (
    <svg viewBox="0 0 160 56" width="100%" height="56" aria-hidden="true">
      <Stroke d={stretches(points, night.sun, () => true)} color="var(--snow-shade)" opacity="0.8" />
      <Stroke d={stretches(points, night.sun, alt => alt > 0)} color="var(--beak)" opacity="0.7" />
      <Stroke d={stretches(points, night.sun, alt => alt < -18)} color="var(--teal)" />
      <line x1="0" y1={HORIZON} x2="160" y2={HORIZON} stroke="var(--mist)" strokeWidth="1.5" strokeDasharray="3 5" />
      {now && <circle cx={now[0]} cy={now[1]} r="5" fill="var(--frost)" />}
    </svg>
  )
}



// DARKNESS TILE

export function DarknessTile({ sky, place }) {
  const words = darknessWords(sky.night, place.timeZone)
  const now = darkNow(sky.night, sky.nowIndex)

  return (
    <section className="tile still" aria-labelledby="tile-dark">
      <h2 id="tile-dark">Darkness</h2>
      <SunPath night={sky.night} nowIndex={sky.nowIndex} />
      <strong>{words.value}</strong>
      <p>{words.line}</p>
      {now && <p>{now}</p>}
    </section>
  )
}



// SEEING DOTS

function SeeingDots({ score }) {
  return (
    <svg viewBox="0 0 160 30" width="100%" height="30" aria-hidden="true" opacity={score ? 1 : 0.5}>
      {[0, 1, 2, 3, 4].map(i => <circle key={i} cx={12 + i * 32} cy="15" r="9" fill={i < score ? 'var(--teal)' : 'var(--raised)'} />)}
    </svg>
  )
}



// SEEING TILE

export function SeeingTile({ sky, place, status }) {
  const words = seeingWords({ night: sky.night, jets: sky.weather?.jets ?? null, status, timeZone: place.timeZone })

  return (
    <section className="tile still" aria-labelledby="tile-seeing">
      <h2 id="tile-seeing">Seeing</h2>
      <SeeingDots score={words.score} />
      <strong>{words.value}</strong>
      <p>{words.line}</p>
      {words.best && <p>{words.best}</p>}
    </section>
  )
}



// MOON TILE

function MoonTile({ sky, place, link, panelClose }) {
  const { night, moon } = sky

  return (
    <section className="tile moon-tile" aria-labelledby="tile-moon">
      <h2 id="tile-moon">Moon</h2>
      <TileLink id="tile-moon" to="moon" link={link} panelClose={panelClose} />
      <PhaseMoon angle={night.moonAngle} size={64} south={place.latitude < 0} />
      <strong>{Math.round(night.moonLit * 100)}% lit</strong>
      <p>{moonTiming(moon, night, place.timeZone)}</p>
      <p>{nextFull(night, place.timeZone)}</p>
    </section>
  )
}



// TILES

function TonightTiles({ sky, place, status, links, panelClose }) {
  return (
    <div className="tiles">
      <MoonTile sky={sky} place={place} link={links.moon} panelClose={panelClose} />

      <DarknessTile sky={sky} place={place} />

      <CloudsTile sky={sky} place={place} status={status} link={links.clouds} panelClose={panelClose} />

      <SeeingTile sky={sky} place={place} status={status} />
    </div>
  )
}

export default TonightTiles
