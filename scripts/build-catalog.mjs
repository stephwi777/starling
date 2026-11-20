import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import * as Astronomy from 'astronomy-engine'
import { CALDWELL } from '../src/sky/catalog/caldwell.js'
import { DOUBLES } from '../src/sky/catalog/doubles.js'
import { ASTERISM_PICKS } from '../src/sky/catalog/asterismPicks.js'
import { MESSIER_NAMES } from '../src/sky/catalog/messierNames.js'
import { CLUSTER_RADIUS, CLUSTER_STARS, FIGURE_FIXES } from '../src/sky/catalog/figureFixes.js'



// SETTINGS

const RAW = new URL('../data/raw/', import.meta.url)
const OUT = new URL('../src/sky/catalog/', import.meta.url)
const STAR_LIMIT = 4
const LEFT_OUT = [65477, 100027]
const NAME_OWNERS = [7607, 17448, 20535, 29655, 113963, 109268, 97165, 97278, 14135]
const NAME_FIXES = { 3179: 'Schedar' }

const MESSIER_KINDS = {
  M24: { kind: 'cluster', type: 'cloud' },
  M40: { kind: 'double', type: null },
  M73: { kind: 'cluster', type: 'asterism' },
}



// HELPERS

export function raHours(lon) {
  return (((lon % 360) + 360) % 360) / 15
}

export function colorWord(bv) {
  if (bv === '' || bv === null || bv === undefined) return null

  const index = Number(bv)

  if (index < 0) return 'blue-white'
  if (index < 0.3) return 'white'
  if (index < 0.58) return 'yellow-white'
  if (index < 0.81) return 'yellow'
  if (index < 1.4) return 'orange'
  return 'red'
}

const GALAXIES = ['s', 'sd', 's0', 'e', 'i', 'g', 'gg']
const NEBULAS = { snr: 'remnant', dn: 'dark', rn: 'reflection', en: 'emission', bn: 'emission', sfr: 'emission' }

function galaxyShape(code, morph = '') {
  if (/^E/.test(morph)) return 'elliptical'
  if (/^S[AB]?0/.test(morph)) return 'lenticular'
  if (/^SB/.test(morph)) return 'barred'
  if (/^S/.test(morph)) return 'spiral'
  if (/^I/.test(morph)) return 'irregular'

  return { e: 'elliptical', s0: 'lenticular', i: 'irregular' }[code] ?? 'spiral'
}

export function kindOf(code, morph) {
  if (GALAXIES.includes(code)) return { kind: 'galaxy', type: galaxyShape(code, morph) }
  if (code === 'oc') return { kind: 'cluster', type: 'open' }
  if (code === 'gc') return { kind: 'globular', type: null }
  if (code === 'pn') return { kind: 'planetary', type: null }
  if (NEBULAS[code]) return { kind: 'nebula', type: NEBULAS[code] }

  throw new Error(`Unknown object type: ${code}`)
}

export function gearFor(mag, kind, type) {
  if (mag === null) return kind === 'nebula' && type === 'dark' ? 1 : 3
  if (mag <= 4.5) return 1
  if (mag <= 7.5) return 2
  return 3
}

export function sizeOf(dim) {
  if (!dim) return null

  const parts = String(dim).split('x').map(Number).filter(Number.isFinite)

  if (!parts.length) return null

  return parts.length === 1 ? [parts[0], parts[0]] : parts.slice(0, 2)
}

function magOf(value) {
  const mag = Number(value)

  return value === '' || !Number.isFinite(mag) || mag >= 99 ? null : mag
}

function round(value, places) {
  return Number(value.toFixed(places))
}

let conNames = null

function conOf(ra, dec) {
  conNames ??= Object.fromEntries(read('constellations.json').features.map(place => [place.id, place.id === 'Ser' ? 'Serpens' : place.properties.name]))

  return conNames[Astronomy.Constellation(ra, dec).symbol]
}

function lineOf(points) {
  return points.map(([lon, lat]) => [round(raHours(lon), 3), round(lat, 2)])
}



// FIGURES

const RAD = Math.PI / 180

function raGap(a, b) {
  return ((((a - b) % 24) + 36) % 24) - 12
}

function magAt(ra, dec, stars) {
  let best = null
  let gap = 0.25

  for (const star of stars) {
    const distance = Math.hypot(raGap(star.ra, ra) * 15 * Math.cos(dec * RAD), star.dec - dec)

    if (distance < gap) {
      gap = distance
      best = star.mag
    }
  }

  return best ?? 4.8
}

function projector(points) {
  const sum = points
    .map(([ra, dec]) => [Math.cos(dec * RAD) * Math.cos(ra * 15 * RAD), Math.cos(dec * RAD) * Math.sin(ra * 15 * RAD), Math.sin(dec * RAD)])
    .reduce((total, vector) => total.map((value, i) => value + vector[i]), [0, 0, 0])
  const length = Math.hypot(...sum)
  const ra0 = Math.atan2(sum[1], sum[0])
  const dec0 = Math.asin(sum[2] / length)

  return ([ra, dec]) => {
    const a = ra * 15 * RAD - ra0
    const d = dec * RAD
    const cosc = Math.sin(dec0) * Math.sin(d) + Math.cos(dec0) * Math.cos(d) * Math.cos(a)

    return [-(Math.cos(d) * Math.sin(a)) / cosc, (Math.cos(dec0) * Math.sin(d) - Math.sin(dec0) * Math.cos(d) * Math.cos(a)) / cosc]
  }
}

function fit(groups, box) {
  const all = groups.flat()
  const xs = all.map(point => point[0])
  const ys = all.map(point => point[1])
  const scale = box / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1e-6)
  const middleX = (Math.max(...xs) + Math.min(...xs)) / 2
  const middleY = (Math.max(...ys) + Math.min(...ys)) / 2

  return groups.map(group => group.map(([x, y, ...rest]) => [round((x - middleX) * scale, 2), round(-(y - middleY) * scale, 2), ...rest]))
}

function rdp(points, epsilon) {
  if (points.length < 3) return points

  const [a, b] = [points[0], points.at(-1)]
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])
  let far = 0
  let index = 0

  points.slice(1, -1).forEach((point, i) => {
    const distance = length < 1e-6
      ? Math.hypot(point[0] - a[0], point[1] - a[1])
      : Math.abs((b[0] - a[0]) * (a[1] - point[1]) - (a[0] - point[0]) * (b[1] - a[1])) / length

    if (distance > far) {
      far = distance
      index = i + 1
    }
  })

  if (far <= epsilon) return [a, b]

  return [...rdp(points.slice(0, index + 1), epsilon).slice(0, -1), ...rdp(points.slice(index), epsilon)]
}

export function simplify(line, epsilon = 0.85) {
  const cuts = [0, ...line.map((point, i) => (point[2] <= 3 && i > 0 && i < line.length - 1 ? i : -1)).filter(i => i > 0), line.length - 1]

  return cuts.slice(1).flatMap((end, k) => rdp(line.slice(cuts[k], end + 1), epsilon).slice(k ? 1 : 0))
}

export function figureOf(lines, stars) {
  const marked = lines.map(line => line.map(([ra, dec]) => [ra, dec, magAt(ra, dec, stars)]))
  const mags = [...new Set(marked.flat().map(point => point[2]))].sort((a, b) => a - b)
  const limit = Math.max(4.1, mags[Math.min(7, mags.length - 1)])
  const kept = marked.map(line => {
    const bright = line.filter(point => point[2] <= limit)

    return bright.length > 1 ? bright : line
  })
  const project = projector(kept.flat())
  const fitted = fit(kept.map(line => line.map(([ra, dec, mag]) => [...project([ra, dec]), mag])), 20)
  const simple = fitted.map(line => simplify(line))
  const dots = []

  simple.flat().forEach(([x, y, mag]) => {
    if (!dots.some(dot => Math.hypot(dot[0] - x, dot[1] - y) < 0.5)) dots.push([x, y, mag])
  })

  return { lines: simple.map(line => line.map(([x, y]) => [x, y])), stars: dots }
}

export function clusterMembers(item, stars) {
  if (CLUSTER_STARS[item.id]) {
    const project = projector(CLUSTER_STARS[item.id])

    return fit([CLUSTER_STARS[item.id].map(([ra, dec, mag, tint]) => [...project([ra, dec]), mag, tint])], 18)[0]
  }

  if (item.kind !== 'cluster' || item.type !== 'open' || !item.size) return null

  const radius = CLUSTER_RADIUS[item.id] ?? Math.max(...item.size) / 2 / 60
  const near = stars.filter(star => Math.hypot(raGap(star.ra, item.ra) * 15 * Math.cos(item.dec * RAD), star.dec - item.dec) <= radius)

  if (near.length < 7) return null

  const brightest = [...near].sort((a, b) => a.mag - b.mag).slice(0, 14)
  const project = projector([[item.ra, item.dec]])

  return fit([brightest.map(star => [...project([star.ra, star.dec]), star.mag, colorWord(star.bv)])], 19)[0]
}



// OUTPUT

export function literal(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (Array.isArray(value)) return `[${value.map(literal).join(', ')}]`
  if (typeof value === 'object') return `{ ${Object.entries(value).map(([key, item]) => `${key}: ${literal(item)}`).join(', ')} }`

  return String(value)
}

function writeModule(file, title, name, rows) {
  const body = rows.map(row => `  ${literal(row)},`).join('\n')

  writeFileSync(new URL(file, OUT), `// ${title}\n\nexport const ${name} = [\n${body}\n]\n`)
}

function read(file) {
  return JSON.parse(readFileSync(new URL(file, RAW), 'utf8'))
}

let starPoints = null

function points() {
  starPoints ??= read('stars.6.json').features.map(star => ({
    ra: raHours(star.geometry.coordinates[0]),
    dec: star.geometry.coordinates[1],
    mag: star.properties.mag,
    bv: star.properties.bv,
  }))

  return starPoints
}

function withFigure(row) {
  return { ...row, figure: FIGURE_FIXES[row.id] ?? figureOf(row.lines, points()) }
}



// STARS

function genitives() {
  return Object.fromEntries(read('constellations.json').features.map(place => [place.id, place.properties.gen]))
}

function buildStars() {
  const stars = read('stars.6.json').features
  const names = read('starnames.json')
  const doubles = new Map(DOUBLES.map(double => [double.hip, double]))
  const gen = genitives()
  const shared = name => Object.entries(names).filter(([, label]) => label.name === name).length > 1

  const rows = stars
    .filter(star => !LEFT_OUT.includes(star.id))
    .filter(star => doubles.has(star.id) || (names[star.id]?.name && star.properties.mag <= STAR_LIMIT))
    .map(star => {
      const [lon, lat] = star.geometry.coordinates
      const ra = raHours(lon)
      const label = names[star.id] ?? {}
      const double = doubles.get(star.id)
      const letter = label.desig?.replace('undefined', '')
      const desig = letter && label.c ? `${letter} ${label.c}` : null
      const borrowed = label.name && shared(label.name) && !NAME_OWNERS.includes(star.id)
      const name = NAME_FIXES[star.id] ?? (borrowed && letter ? `${letter} ${gen[label.c]}` : label.name)

      return {
        id: double?.name ?? name,
        hip: star.id,
        kind: double ? 'double' : 'star',
        ra: round(ra, 4),
        dec: round(lat, 3),
        mag: star.properties.mag,
        tint: colorWord(star.properties.bv),
        con: conOf(ra, lat),
        desig,
        gear: double?.gear ?? 1,
        ...(double ? { apart: double.apart, colors: double.colors } : {}),
      }
    })
    .sort((a, b) => a.mag - b.mag)

  if (rows.length !== new Set(rows.map(row => row.id)).size) throw new Error('Two stars share a name')

  const missing = DOUBLES.filter(double => !rows.some(row => row.hip === double.hip))

  if (missing.length) throw new Error(`Doubles not found: ${missing.map(double => double.name).join(', ')}`)

  return rows
}



// CONSTELLATIONS

function buildConstellations() {
  const places = read('constellations.json').features
  const lines = read('constellations.lines.json').features
  const merged = new Map()

  places.forEach(place => {
    const id = place.id
    const name = id === 'Ser' ? 'Serpens' : place.properties.name

    if (merged.has(id)) return

    const [lon, lat] = place.geometry.coordinates

    merged.set(id, {
      id: name,
      abbr: id,
      english: place.properties.en.replace(/\s/g, ' '),
      ra: round(raHours(lon), 3),
      dec: round(lat, 2),
      rank: Number(place.properties.rank),
      lines: lines.filter(line => line.id === id).flatMap(line => line.geometry.coordinates.map(lineOf)),
    })
  })

  return [...merged.values()].map(withFigure)
}



// ASTERISMS

function buildAsterisms() {
  const all = read('asterisms.json').features

  return ASTERISM_PICKS.map(pick => {
    const found = all.find(asterism => asterism.id === pick.key)

    if (!found) throw new Error(`Asterism not found: ${pick.key}`)

    const [lon, lat] = found.properties.loc

    return withFigure({
      id: pick.name,
      ra: round(raHours(lon), 3),
      dec: round(lat, 2),
      lines: found.geometry.coordinates.map(lineOf),
    })
  })
}



// DEEP SKY

function deepRow({ id, name, desig, kind, type, lon, lat, ra, dec, mag, size }) {
  const hours = ra ?? raHours(lon)
  const degrees = dec ?? lat

  return {
    id,
    name: name ?? null,
    desig: desig || null,
    kind,
    type,
    ra: round(hours, 4),
    dec: round(degrees, 3),
    mag,
    size,
    con: conOf(hours, degrees),
    gear: gearFor(mag, kind, type),
  }
}

function buildDeepSky() {
  const messier = read('messier.json').features
  const deep = read('dsos.14.json').features
  const find = key => deep.find(object => object.id.replace(/ /g, '') === key.replace(/ /g, '') || object.properties.desig.replace(/ /g, '') === key.replace(/ /g, ''))

  const messierRows = messier.map(object => {
    const props = object.properties
    const match = props.desig ? find(props.desig) : null
    const shape = MESSIER_KINDS[object.id] ?? kindOf(props.type, match?.properties.morph ?? '')
    const [lon, lat] = object.geometry.coordinates

    return deepRow({
      id: object.id,
      name: MESSIER_NAMES[object.id],
      desig: props.desig,
      ...shape,
      lon,
      lat,
      mag: magOf(props.mag),
      size: sizeOf(props.dim),
    })
  })

  const caldwellRows = CALDWELL.map(entry => {
    const id = `C${entry.number}`

    if (entry.ra !== undefined) {
      return deepRow({ id, name: entry.name, desig: entry.desig, kind: entry.kind, type: entry.type, ra: entry.ra, dec: entry.dec, mag: entry.mag, size: sizeOf(entry.size) })
    }

    const match = find(entry.key ?? entry.desig)

    if (!match) throw new Error(`Caldwell ${entry.number} not found: ${entry.desig}`)

    const shape = kindOf(match.properties.type, match.properties.morph)

    if (shape.kind !== entry.kind) throw new Error(`Caldwell ${entry.number} is a ${shape.kind}, not a ${entry.kind}`)

    const [lon, lat] = match.geometry.coordinates

    return deepRow({
      id,
      name: entry.name,
      desig: entry.desig,
      ...shape,
      type: entry.type ?? shape.type,
      lon,
      lat,
      mag: magOf(match.properties.mag),
      size: sizeOf(match.properties.dim),
    })
  })

  return [...messierRows, ...caldwellRows].map(row => {
    const members = clusterMembers(row, points())

    return members ? { ...row, members } : row
  })
}



// MAIN

function main() {
  const stars = buildStars()
  const constellations = buildConstellations()
  const asterisms = buildAsterisms()
  const deepSky = buildDeepSky()

  writeModule('stars.js', 'STARS', 'STARS', stars)
  writeModule('constellations.js', 'CONSTELLATIONS', 'CONSTELLATIONS', constellations)
  writeModule('asterisms.js', 'ASTERISMS', 'ASTERISMS', asterisms)
  writeModule('deepSky.js', 'DEEP SKY', 'DEEP_SKY', deepSky)

  console.log(`Stars ${stars.length} (doubles ${stars.filter(star => star.kind === 'double').length}), constellations ${constellations.length}, asterisms ${asterisms.length}, deep sky ${deepSky.length}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
