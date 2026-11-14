import { statusAt } from '../../sky/status.js'
import { clock, compass, fists, height, where } from '../../sky/words.js'



// PICKED OBJECT

function PickedObject({ object, sky, at, timeZone }) {
  if (!object) return <p className="tip">Pick anything in the list to find it here.</p>

  const point = object.track[at]
  const status = statusAt(object, at, sky.night, timeZone)
  const best = object.track[object.bestIndex]

  return (
    <>
      <h3>{object.name}</h3>
      {status.up
        ? <p><strong>{where(point.alt, point.az)}</strong>, about {fists(point.alt)}.</p>
        : <p><strong>{status.title}</strong> {status.detail}.</p>}
      {object.visible
        ? <p>Best at {clock(sky.night.times[object.bestIndex], timeZone)}, {height(best.alt)} in the {compass(best.az)}.</p>
        : <p>Not visible tonight: {object.reason}.</p>}
      <p className="adv tip">
        Alt {Math.round(point.alt)}°, az {Math.round(point.az)}°, RA {point.ra.toFixed(2)}h, Dec {point.dec.toFixed(1)}°{Number.isFinite(object.mag) ? `, mag ${object.mag.toFixed(1)}` : ''}
      </p>
    </>
  )
}

export default PickedObject
