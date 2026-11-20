import { useMemo } from 'react'
import { Link } from 'react-router'
import { cloudBars, cloudWords } from '../../sky/clouds.js'
import { darknessWords } from '../../sky/darkness.js'
import { moonLine, skyPath, trulyDark } from '../../sky/darkPanel.js'
import { seeingWords } from '../../sky/seeing.js'
import { moonTiming, nextFull } from '../../sky/moon.js'
import { PhaseMoon } from '../ui/icons.jsx'
import SunStrokes from '../darkness/SunStrokes.jsx'



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



// SUN CURVE

const STEP = 10 * 60 * 1000

function SunCurve({ path, nowIndex }) {
  const top = Math.max(...path.sun) + 5
  const bottom = Math.min(...path.sun) - 5
  const x = i => 4 + (i / (path.sun.length - 1)) * 152
  const y = alt => 6 + ((top - alt) / (top - bottom)) * 52
  const now = nowIndex === null ? null : [x(nowIndex), y(path.sun[nowIndex])]

  return (
    <svg viewBox="0 0 160 64" width="100%" height="64" aria-hidden="true">
      <line x1="0" y1={y(0)} x2="160" y2={y(0)} stroke="var(--mist)" strokeWidth="1.5" strokeDasharray="3 5" />
      <SunStrokes path={path} x={x} y={y} width={4} />
      {now && <circle cx={now[0]} cy={now[1]} r="5" fill="var(--frost)" />}
    </svg>
  )
}



// DARKNESS TILE

export function DarknessTile({ sky, place, now, link, panelClose }) {
  const { night } = sky
  const words = darknessWords(night, place.timeZone)
  const path = useMemo(() => skyPath(night.observer, night.noon), [night])
  const windows = useMemo(() => trulyDark(night), [night])
  const moon = moonLine(night, windows, place.timeZone)
  const step = Math.round((now - night.noon) / STEP)
  const nowIndex = step >= 0 && step < path.sun.length ? step : null

  return (
    <section className="tile" aria-labelledby="tile-dark">
      <h2 id="tile-dark">Darkness</h2>
      <TileLink id="tile-dark" to="darkness" link={link} panelClose={panelClose} />
      <SunCurve path={path} nowIndex={nowIndex} />
      <strong>{words.value}</strong>
      <p>{words.line}</p>
      {moon && <p>{moon}</p>}
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

export function SeeingTile({ sky, place, status, link, panelClose }) {
  const words = seeingWords({ night: sky.night, air: sky.weather?.air ?? null, status, timeZone: place.timeZone })

  return (
    <section className="tile" aria-labelledby="tile-seeing">
      <h2 id="tile-seeing">Seeing</h2>
      <TileLink id="tile-seeing" to="seeing" link={link} panelClose={panelClose} />
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

function TonightTiles({ sky, place, now, status, links, panelClose }) {
  return (
    <div className="tiles">
      <MoonTile sky={sky} place={place} link={links.moon} panelClose={panelClose} />

      <DarknessTile sky={sky} place={place} now={now} link={links.darkness} panelClose={panelClose} />

      <CloudsTile sky={sky} place={place} status={status} link={links.clouds} panelClose={panelClose} />

      <SeeingTile sky={sky} place={place} status={status} link={links.seeing} panelClose={panelClose} />
    </div>
  )
}

export default TonightTiles
