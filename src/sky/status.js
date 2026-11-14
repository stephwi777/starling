import { clock, compass, fists, where } from './words.js'



// STATUS

export function statusAt(object, at, night, timeZone) {
  const point = object.track[at]

  if (point.alt > 0) {
    const title = night.sun[at] > -6 ? 'Up, sky still bright' : `Up, ${fists(point.alt)}`

    return { title, detail: where(point.alt, point.az), up: true }
  }

  if (object.rise !== null && object.rise > at) {
    return { title: `Rises ${clock(night.times[object.rise], timeZone)}`, detail: `in the ${compass(object.track[object.rise].az)}`, up: false }
  }

  if (object.set !== null && object.set <= at) {
    return { title: `Set at ${clock(night.times[object.set], timeZone)}`, detail: `in the ${compass(object.track[object.set].az)}`, up: false }
  }

  return { title: 'Below the horizon', detail: object.visible ? '' : object.reason, up: false }
}
