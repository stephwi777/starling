import * as Astronomy from 'astronomy-engine'



// SETTINGS

const GAUSS = 0.01720209895
const OBLIQUITY = 23.4392911 * Math.PI / 180
const RADIAN = Math.PI / 180
const PARABOLIC = 1e-6
const GONE = /^(\d+D|D\/|A\/)/



// PARSING

function familiar(text) {
  const named = /\(([^)]+)\)\s*$/.exec(text)

  if (named) return named[1]

  const periodic = /^\d+P(-[A-Z]+)?\/(.+)$/.exec(text)

  return periodic ? periodic[2] : text
}

function perihelionTime(year, month, day) {
  const whole = Math.floor(day)

  return new Date(Date.UTC(year, month - 1, whole) + (day - whole) * 86400000)
}

function parseLine(line) {
  const H = Number(line.slice(91, 95))
  const text = line.slice(102, 158).trim()

  if (!line.slice(91, 95).trim() || !Number.isFinite(H) || !text || GONE.test(text)) return null

  return {
    id: line.slice(0, 12).trim().replace(/[^\w-]/g, ''),
    designation: text.replace(/\s*\([^)]*\)\s*$/, ''),
    name: familiar(text),
    perihelion: perihelionTime(Number(line.slice(14, 18)), Number(line.slice(19, 21)), Number(line.slice(22, 29))),
    q: Number(line.slice(30, 39)),
    e: Number(line.slice(41, 49)),
    peri: Number(line.slice(51, 59)),
    node: Number(line.slice(61, 69)),
    incl: Number(line.slice(71, 79)),
    H,
    G: Number(line.slice(96, 100)),
  }
}

export function parseComets(text) {
  return text.split('\n').map(parseLine).filter(Boolean)
}



// ORBIT

function parabolic(q, days) {
  const w = 3 * GAUSS * days / Math.sqrt(2 * q * q * q)
  const y = Math.cbrt(w / 2 + Math.sqrt(w * w / 4 + 1))
  const s = y - 1 / y

  return [q * (1 - s * s), 2 * q * s]
}

function kepler(q, e, days) {
  const a = q / (1 - e)
  const turn = 2 * Math.PI
  const mean = ((GAUSS * days / Math.pow(a, 1.5)) % turn + turn) % turn
  let low = 0
  let high = turn
  let anomaly = mean < Math.PI ? Math.min(mean + e, Math.PI) : Math.max(mean - e, Math.PI)

  for (let step = 0; step < 100; step++) {
    const miss = anomaly - e * Math.sin(anomaly) - mean

    if (Math.abs(miss) < 1e-14) break
    if (miss > 0) high = anomaly
    else low = anomaly

    const next = anomaly - miss / (1 - e * Math.cos(anomaly))

    anomaly = next > low && next < high ? next : (low + high) / 2
  }

  return [a * (Math.cos(anomaly) - e), a * Math.sqrt(1 - e * e) * Math.sin(anomaly)]
}

function hyperbolic(q, e, days) {
  const a = q / (e - 1)
  const mean = GAUSS * days / Math.pow(a, 1.5)
  let anomaly = Math.asinh(mean / e)

  for (let step = 0; step < 100; step++) {
    const next = anomaly - (e * Math.sinh(anomaly) - anomaly - mean) / (e * Math.cosh(anomaly) - 1)

    if (Math.abs(next - anomaly) < 1e-13) {
      anomaly = next
      break
    }

    anomaly = next
  }

  return [a * (e - Math.cosh(anomaly)), a * Math.sqrt(e * e - 1) * Math.sinh(anomaly)]
}

function inPlane(comet, days) {
  if (Math.abs(comet.e - 1) < PARABOLIC) return parabolic(comet.q, days)

  return comet.e < 1 ? kepler(comet.q, comet.e, days) : hyperbolic(comet.q, comet.e, days)
}

function heliocentric(comet, date) {
  const days = Astronomy.MakeTime(date).tt - Astronomy.MakeTime(comet.perihelion).ut
  const [x, y] = inPlane(comet, days)
  const peri = comet.peri * RADIAN
  const node = comet.node * RADIAN
  const incl = comet.incl * RADIAN
  const px = Math.cos(peri) * x - Math.sin(peri) * y
  const py = Math.sin(peri) * x + Math.cos(peri) * y
  const ex = Math.cos(node) * px - Math.sin(node) * Math.cos(incl) * py
  const ey = Math.sin(node) * px + Math.cos(node) * Math.cos(incl) * py
  const ez = Math.sin(incl) * py

  return {
    x: ex,
    y: ey * Math.cos(OBLIQUITY) - ez * Math.sin(OBLIQUITY),
    z: ey * Math.sin(OBLIQUITY) + ez * Math.cos(OBLIQUITY),
  }
}

export function cometPlace(comet, date, earth = Astronomy.HelioVector('Earth', date)) {
  const sun = heliocentric(comet, date)
  const vector = { x: sun.x - earth.x, y: sun.y - earth.y, z: sun.z - earth.z }

  return {
    vector,
    r: Math.hypot(sun.x, sun.y, sun.z),
    delta: Math.hypot(vector.x, vector.y, vector.z),
  }
}



// BRIGHTNESS

export function cometMagnitude(comet, r, delta) {
  return comet.H + 5 * Math.log10(delta) + 2.5 * comet.G * Math.log10(r)
}
