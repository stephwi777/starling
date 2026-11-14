import * as Astronomy from 'astronomy-engine'



// POSITION

export function positionAt(object, date, observer) {
  const equator = object.body
    ? Astronomy.Equator(object.body, date, observer, true, true)
    : { ra: object.ra, dec: object.dec }
  const horizon = Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal')

  return { alt: horizon.altitude, az: horizon.azimuth, ra: equator.ra, dec: equator.dec }
}



// HELPERS

function bestTime(track, sun) {
  let best = -1

  track.forEach((point, i) => {
    if (sun[i] < -8 && (best === -1 || point.alt > track[best].alt)) best = i
  })

  if (best !== -1) return best

  return track.reduce((top, point, i) => (point.alt > track[top].alt ? i : top), 0)
}

function crossings(track) {
  let rise = null
  let set = null

  for (let i = 1; i < track.length; i++) {
    if (rise === null && track[i - 1].alt <= 0 && track[i].alt > 0) rise = i
    if (set === null && track[i - 1].alt > 0 && track[i].alt <= 0) set = i
  }

  return { rise, set }
}

function hourCells(track, sun, hours) {
  const cells = []

  for (let hour = 0; hour < hours; hour++) {
    const slice = track.slice(hour * 6, hour * 6 + 6)
    const top = Math.max(...slice.map(point => point.alt))
    const level = top <= 0 ? 0 : top < 20 ? 1 : top < 50 ? 2 : 3
    const middle = Math.min(hour * 6 + 3, sun.length - 1)

    cells.push({ level, twilight: sun[middle] >= -18 })
  }

  return cells
}

function whyHidden(object, track, night) {
  if (track.every(point => point.alt <= 0)) return 'below the horizon all night'

  const middle = night.times[Math.floor(night.times.length / 2)]

  if (object.body && object.body !== 'Moon' && Astronomy.AngleFromSun(object.body, middle) < 20) return 'too close to the Sun'

  return 'only up in twilight'
}



// TRACK

export function trackObject(object, night, observer, track = night.times.map(time => positionAt(object, time, observer))) {
  const lowest = object.gear === 3 ? 15 : 8
  const visible = track.some((point, i) => point.alt > lowest && night.sun[i] < -8)
  const bestIndex = bestTime(track, night.sun)
  const mag = object.body ? Astronomy.Illumination(object.body, night.times[bestIndex]).mag : object.mag

  return {
    ...object,
    track,
    visible,
    reason: visible ? '' : whyHidden(object, track, night),
    bestIndex,
    ...crossings(track),
    cells: hourCells(track, night.sun, night.hours),
    mag,
  }
}
