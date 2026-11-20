import * as Astronomy from 'astronomy-engine'
import { trackObject } from './tracks.js'



// ANGLES

const RAD = Math.PI / 180



// PRECESSION

export function ofDate(ra, dec, rotation) {
  const vector = Astronomy.VectorFromSphere(new Astronomy.Spherical(dec, ra * 15, 1), new Astronomy.AstroTime(new Date(0)))
  const turned = Astronomy.RotateVector(rotation, vector)
  const equator = Astronomy.EquatorFromVector(turned)

  return { ra: equator.ra, dec: equator.dec }
}



// HORIZON

export function horizonAt(ra, dec, siderealHours, latitude) {
  const hourAngle = (siderealHours - ra) * 15 * RAD
  const lat = latitude * RAD
  const d = dec * RAD
  const sinAlt = Math.sin(lat) * Math.sin(d) + Math.cos(lat) * Math.cos(d) * Math.cos(hourAngle)
  const geometric = Math.asin(Math.max(-1, Math.min(1, sinAlt))) / RAD
  const south = Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(lat) - Math.tan(d) * Math.cos(lat)) / RAD

  return { alt: geometric + Astronomy.Refraction('normal', geometric), az: (south + 180 + 360) % 360 }
}



// FIXED TRACKER

export function fixedTracker(night, observer) {
  const rotation = Astronomy.Rotation_EQJ_EQD(night.midnight)
  const sidereal = night.times.map(time => (Astronomy.SiderealTime(time) + observer.longitude / 15 + 24) % 24)

  return object => {
    const place = ofDate(object.ra, object.dec, rotation)
    const track = sidereal.map(hours => ({ ...horizonAt(place.ra, place.dec, hours, observer.latitude), ra: place.ra, dec: place.dec }))

    return trackObject(object, night, observer, track)
  }
}
