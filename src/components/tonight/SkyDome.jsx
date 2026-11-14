import { useMemo } from 'react'
import { positionAt } from '../../sky/tracks.js'
import { clock, compass, height } from '../../sky/words.js'
import { CONSTELLATIONS } from '../../sky/catalog/constellations.js'
import { MoonShape } from './Icons.jsx'
import './SkyDome.css'



// HELPERS

const CARDINALS = [['N', 0], ['E', 90], ['S', 180], ['W', 270]]

function project(alt, az) {
  const r = ((90 - alt) / 90) * 150
  const a = (az * Math.PI) / 180

  return [-r * Math.sin(a), -r * Math.cos(a)]
}

function skyColor(alt) {
  if (alt > 0) return 'var(--sky-day)'
  if (alt > -6) return 'var(--sky-civil)'
  if (alt > -12) return 'var(--sky-nautical)'
  if (alt > -18) return 'var(--sky-astro)'
  return 'var(--sky-night)'
}

function figureLines(date, observer) {
  return CONSTELLATIONS.flatMap(constellation =>
    constellation.lines.flatMap(line => {
      const points = line.map(([ra, dec]) => positionAt({ ra, dec }, date, observer))

      return points.slice(1).flatMap((point, i) => {
        const before = points[i]
        if (before.alt < 0 || point.alt < 0) return []

        return [[...project(before.alt, before.az), ...project(point.alt, point.az)]]
      })
    })
  )
}

function placeLabels(objects, at) {
  const placed = []

  return objects.map(object => {
    const point = object.track[at]
    const [x, y] = project(point.alt, point.az)
    const width = object.name.length * 7
    let labelY = y + 4

    while (placed.some(box => Math.abs(box.y - labelY) < 14 && Math.abs(box.x - x) < width + 20)) labelY += 14

    placed.push({ x, y: labelY })

    return { object, x, y, labelY, left: x > 60 }
  })
}



// SKY DOME

function SkyDome({ sky, at, gear, picked, timeZone }) {
  const date = sky.night.times[at]
  const lines = useMemo(() => figureLines(date, sky.observer), [date, sky.observer])
  const up = object => object.track[at].alt > 0
  const named = [...sky.planets.filter(planet => planet.gear <= gear), sky.moon].filter(up).sort((a, b) => a.mag - b.mag)
  const labels = placeLabels(named, at)
  const everything = [sky.moon, ...sky.planets, ...sky.stars, ...sky.shapes, ...sky.deep, ...sky.showers]
  const chosen = everything.find(object => object.name === picked)
  const summary = named.map(object => `${object.name} ${height(object.track[at].alt)} in the ${compass(object.track[at].az)}`)

  return (
    <svg
      className="dome"
      viewBox="-175 -175 350 350"
      role="img"
      aria-label={`Sky map at ${clock(date, timeZone)}. ${summary.length ? summary.join('. ') : 'No planets or Moon up'}.`}
    >
      <circle r="150" fill={skyColor(sky.night.sun[at])} stroke="var(--rule)" strokeWidth="2" />
      <circle r="100" fill="none" stroke="var(--rule)" strokeDasharray="2 5" />
      <circle r="50" fill="none" stroke="var(--rule)" strokeDasharray="2 5" />

      {CARDINALS.map(([label, az]) => {
        const [x, y] = project(-9, az)
        return <text key={label} x={x} y={y + 5} textAnchor="middle" className="cardinal">{label}</text>
      })}

      {lines.map(([x1, y1, x2, y2]) => (
        <line key={`${x1}${y1}${x2}`} x1={x1} y1={y1} x2={x2} y2={y2} className="figure" />
      ))}

      {sky.stars.filter(up).map(star => {
        const [x, y] = project(star.track[at].alt, star.track[at].az)
        return <circle key={star.name} cx={x} cy={y} r={Math.max(1.2, 3 - star.mag)} fill="var(--frost)" />
      })}

      {sky.deep.filter(object => up(object) && object.gear <= gear).map(object => {
        const [x, y] = project(object.track[at].alt, object.track[at].az)
        return <circle key={object.name} cx={x} cy={y} r="3.5" className="deep" />
      })}

      {labels.map(({ object, x, y, labelY, left }) => (
        <g key={object.name}>
          {object.kind === 'moon'
            ? <g transform={`translate(${x} ${y})`}><MoonShape angle={sky.night.moonAngle} r={8} /></g>
            : <circle cx={x} cy={y} r={object.gear === 1 ? 5 : 3.5} fill={`var(${object.color})`} />}
          <text x={left ? x - 10 : x + 10} y={labelY} textAnchor={left ? 'end' : 'start'} className="label">{object.name}</text>
        </g>
      ))}

      {chosen && up(chosen) && (() => {
        const [x, y] = project(chosen.track[at].alt, chosen.track[at].az)
        return (
          <g>
            <circle cx={x} cy={y} r="11" className="chosen" />
            {!named.includes(chosen) && <text x={x + 14} y={y - 8} className="chosen-label">{chosen.name}</text>}
          </g>
        )
      })()}
    </svg>
  )
}

export default SkyDome
