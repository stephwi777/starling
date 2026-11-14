import { statusAt } from '../../sky/status.js'
import { meteorRate } from '../../sky/meteors.js'
import { clock, shortCompass } from '../../sky/words.js'
import { GearIcons, ObjectIcon } from './Icons.jsx'



// HELPERS

function details(object, sky, timeZone) {
  const best = object.visible ? `best ${clock(sky.night.times[object.bestIndex], timeZone)}` : `not visible, ${object.reason}`
  const parts = [object.id, best, object.size]

  if (object.kind === 'shower') parts.push(`ZHR ${object.zhr}`, `${object.speed} km/s`, object.parent)

  const text = parts.filter(Boolean).join(', ')

  return text[0].toUpperCase() + text.slice(1)
}

function riseSet(object, sky, timeZone) {
  const rise = object.rise !== null ? `↑${clock(sky.night.times[object.rise], timeZone)}` : ''
  const set = object.set !== null ? `↓${clock(sky.night.times[object.set], timeZone)}` : ''

  return `${rise} ${set}`.trim() || '—'
}



// STRIP

function Strip({ object, at, last }) {
  return (
    <span className="strip" style={{ '--c': `var(${object.color})` }} aria-hidden="true">
      {object.cells.map((cell, i) => (
        <span key={i} className={`s${cell.level}${cell.level && cell.twilight ? ' twilight' : ''}`}></span>
      ))}
      <i style={{ '--t': at / last }}></i>
    </span>
  )
}



// ROW

function ObjectRow({ object, sky, at, picked, onPick, timeZone }) {
  const point = object.track[at]
  const status = statusAt(object, at, sky.night, timeZone)
  const title = object.kind === 'shower' && status.up ? `About ${meteorRate(object, point.alt)} an hour` : status.title

  return (
    <li className={status.up ? '' : 'down'} aria-current={picked === object.name ? 'true' : undefined}>
      <ObjectIcon object={object} moonAngle={sky.night.moonAngle} />

      <span className="name">
        <button type="button" onClick={() => onPick(object.name)}>{object.name}</button>
        <small className="hob">{object.hint}</small>
        <small className="adv">{details(object, sky, timeZone)}</small>
      </span>

      <span className="status">
        <strong>{title}</strong>
        <span>{status.detail}</span>
      </span>

      <Strip object={object} at={at} last={sky.night.times.length - 1} />
      <GearIcons level={object.gear} />

      <span className="num adv">{status.up ? `${Math.round(point.alt)}°` : '—'}</span>
      <span className="num adv">{status.up ? `${Math.round(point.az)}° ${shortCompass(point.az)}` : '—'}</span>
      <span className="num adv">{Number.isFinite(object.mag) && object.kind !== 'shower' && object.kind !== 'shape' ? object.mag.toFixed(1) : '—'}</span>
      <span className="num adv">{riseSet(object, sky, timeZone)}</span>
    </li>
  )
}

export default ObjectRow
