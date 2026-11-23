import { expect, test } from 'vitest'
import { monthEvents } from './monthEvents.js'
import { cometSeason } from './cometEvents.js'
import { SAMPLE_COMETS } from './cometSample.js'
import { brightness, degrees, look } from './skyTools.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }

const span = (from, count) => Array.from({ length: count }, (_, i) => {
  const index = from - 1 + i

  return monthEvents(KC, 2026 + Math.floor(index / 12), (index % 12) + 1)
}).flat()

const all = span(11, 26)
const comets = cometSeason(SAMPLE_COMETS, KC, new Date('2027-01-15T12:00:00Z'))
const of = kind => all.filter(event => event.kinds.includes(kind))
const labels = events => new Set(events.flatMap(event => event.rows.map(([label]) => label)))
const values = events => events.flatMap(event => event.rows.map(([, value]) => value))



// SHARED WORDS

test('brightness words are short', () => {
  expect(brightness(-4.5)).toBe('Brightest after the Moon')
  expect(brightness(0)).toBe('Very bright')
  expect(brightness(7)).toBe('Needs binoculars')
  expect(brightness(9)).toBe('Needs a telescope')
})

test('degrees drop a trailing .0', () => {
  expect(degrees(0.97)).toBe('1°')
  expect(degrees(0.64)).toBe('0.6°')
})

test('halfway up reads as midway up', () => {
  expect(look({ alt: 40, az: 270 })).toBe('Midway up west')
})

test('look rows leave the time to Best seen', () => {
  expect(all.flatMap(event => event.rows).filter(([label, value]) => label === 'Look' && /around/.test(value))).toEqual([])
})



// ECLIPSES

test('solar eclipses seen elsewhere do not repeat where in a row', () => {
  expect(labels(of('solar-eclipse').filter(event => !event.here)).has('Where')).toBe(false)
})

test('a partial solar eclipse gives coverage its own row', () => {
  const partial = of('solar-eclipse').find(event => event.here)

  expect(partial.time).not.toMatch(/covered/)
  expect(partial.rows.some(([label]) => label === 'Covered')).toBe(true)
})

test('a solar eclipse that is a different kind elsewhere says so in a full sentence', () => {
  expect(of('solar-eclipse').map(event => event.note).filter(note => /\. (Annular|Total|Hybrid) near/.test(note))).toEqual([])
})

test('lunar eclipse wording is plain and short', () => {
  const lunar = of('lunar-eclipse')

  expect(lunar.filter(event => event.name.startsWith('Penumbral')).every(event => event.note === 'A subtle dimming of the Moon that’s easy to miss.')).toBe(true)
  expect(values(lunar).filter(value => /partway through/.test(value))).toEqual([])
})



// PLANETS

test('planet notes are joined into full sentences', () => {
  const notes = [...of('planet-pair'), ...of('moon-planet'), ...of('planet-star')].map(event => event.note)

  expect(notes.filter(note => /apart\. |\. They fit|\. A lovely|\. Easy to find/.test(note))).toEqual([])
})

test('pairs and Moon meetings use short chips', () => {
  expect(of('planet-pair').every(event => /^\w+ & \w+$/.test(event.short))).toBe(true)
  expect(of('moon-planet').every(event => /^Moon & \w+$/.test(event.short))).toBe(true)
})

test('planet cards don’t repeat themselves', () => {
  expect(of('opposition').filter(event => event.rows.length && /Look low/.test(event.note))).toEqual([])
  expect(labels(of('venus-brightest')).has('Brightness')).toBe(false)
  expect(labels(of('parade')).has('Planets')).toBe(false)
  expect([...of('mars-closest'), ...of('planet-distance')].filter(event => /\.0 million/.test(event.note))).toEqual([])
})



// SHOWERS AND SEASONS

test('shower rows are short', () => {
  const showers = [...of('major-shower'), ...of('minor-shower')]

  expect(showers.every(event => !/radiant/.test(event.rows.find(([label]) => label === 'Best time')[1]))).toBe(true)
  expect(showers.every(event => !/,/.test(event.rows.find(([label]) => label === 'Radiant')[1]))).toBe(true)
  expect(showers.filter(event => event.here).every(event => event.rows.some(([label]) => label === 'Look'))).toBe(true)
})

test('seasons do not repeat their time', () => {
  expect(labels(of('season')).has('Exact at')).toBe(false)
})



// COMETS

test('comet chips leave out the word Comet', () => {
  expect(comets.filter(event => event.short.includes('Comet'))).toEqual([])
})

test('only a comet’s best night carries the naked eye tag', () => {
  expect(comets.filter(event => event.tags.includes('Naked eye') && !event.id.endsWith('-best'))).toEqual([])
})

test('comet cards don’t repeat the forecast warning or say reach on arrival', () => {
  expect(values(comets).filter(value => /\(predicted\)/.test(value))).toEqual([])
  expect(comets.filter(event => event.id.endsWith('-arrives') && /reach magnitude/.test(event.note))).toEqual([])
})



// PLANET BATCH

test('at-its-best notes are full sentences', () => {
  const best = of('opposition')
  const outer = best.filter(event => !/Mercury|Venus/.test(event.name))
  const inner = best.filter(event => /Mercury|Venus/.test(event.name))

  expect(outer.every(event => event.note.startsWith(`${event.name.split(' ')[0]} is opposite the Sun`))).toBe(true)
  expect(inner.filter(event => event.here).every(event => /^(Mercury|Venus) swings \d+° from the Sun, its easiest time to spot (before sunrise|after sunset)\.$/.test(event.note))).toBe(true)
  expect(inner.filter(event => !event.here).every(event => /^(Mercury|Venus) swings \d+° from the Sun in the (morning|evening) sky\.$/.test(event.note))).toBe(true)
})

test('planet chips and notes from the planet review', () => {
  expect(of('venus-brightest').every(event => event.note.startsWith('Venus outshines everything in the night sky except the Moon'))).toBe(true)
  expect(of('mars-closest').every(event => event.short === 'Mars closest')).toBe(true)
  expect(of('parade').every(event => event.short === 'Planet parade')).toBe(true)
  expect(of('planet-distance').every(event => / (near|far from) Sun$/.test(event.short))).toBe(true)
  expect(of('planet-star').filter(event => /Pleiades is|Beehive are/.test(event.note))).toEqual([])
  expect(of('station').filter(event => /backward/.test(event.name)).every(event => /overtaking/.test(event.note))).toBe(true)
})



// ECLIPSE BATCH

const transits = monthEvents(KC, 2032, 11).filter(event => event.kinds.includes('transit'))

test('eclipse and transit cards don’t repeat their main time', () => {
  expect(labels([...of('solar-eclipse'), ...of('lunar-eclipse'), ...transits]).has('Greatest')).toBe(false)
  expect(labels(transits).has('Middle')).toBe(false)
})

test('lunar eclipses list only the part you can see', () => {
  const lunar = of('lunar-eclipse')
  const faint = lunar.filter(event => event.name.startsWith('Penumbral'))
  const deep = lunar.filter(event => !event.name.startsWith('Penumbral'))

  expect(faint.every(event => event.rows[0][0] === 'Begins' && event.rows[1][0] === 'Ends')).toBe(true)
  expect(deep.every(event => event.rows[0][0] === 'Partial' && /–/.test(event.rows[0][1]))).toBe(true)
  expect(labels(deep).has('Begins')).toBe(false)
  expect(labels(deep).has('Partial begins')).toBe(false)
})

test('eclipse chips and labels from the eclipse review', () => {
  const lunar = of('lunar-eclipse')

  expect(lunar.filter(event => event.name.startsWith('Penumbral')).every(event => event.short === 'Faint lunar')).toBe(true)
  expect(lunar.filter(event => event.name.startsWith('Total')).every(event => event.tiny === 'Total eclipse')).toBe(true)
  expect(transits.every(event => event.short === 'Mercury transit')).toBe(true)
})



// METEOR BATCH

test('shower cards are trimmed to six rows', () => {
  const showers = [...of('major-shower'), ...of('minor-shower')]

  expect(labels(showers).has('Peak night')).toBe(false)
  expect(labels(showers).has('Exact peak')).toBe(false)
  expect(showers.every(event => /^\w{3} \d+–(\w{3} )?\d+$/.test(event.rows.find(([label]) => label === 'Active')[1]))).toBe(true)
  expect(showers.filter(event => !event.name.startsWith('Southern Delta')).every(event => event.short === event.name.replace(' peak', ''))).toBe(true)
  expect(showers.filter(event => event.name.startsWith('Southern Delta')).every(event => event.short === 'S. Delta Aquariids')).toBe(true)
  expect(showers.every(event => / meteors an hour from a dark site, fewer near towns\.$/.test(event.note))).toBe(true)
})

test('shower parents use plain names', () => {
  const showers = [...of('major-shower'), ...of('minor-shower')]
  const parents = showers.map(event => event.rows.find(([label]) => label === 'Comes from')[1])

  expect(parents.filter(parent => parent.includes('/'))).toEqual([])
  expect(parents).toContain('Asteroid 2003 EH1')
  expect(showers.find(event => event.name.startsWith('Leonids')).note.startsWith('Fast, bright streaks, best before dawn.')).toBe(true)
})



// SUN BATCH

test('season notes are one full sentence', () => {
  expect(of('season').every(event => /^The (longest|first) [a-z ]+, when [a-z]/.test(event.note))).toBe(true)
})

test('sun and season chips are short', () => {
  expect(of('season').every(event => ['Solstice', 'Equinox'].includes(event.short))).toBe(true)
  expect(of('milky-way').every(event => ['Milky Way returns', 'Milky Way ends'].includes(event.short))).toBe(true)
  expect(of('earth-distance').every(event => ['Earth closest', 'Earth farthest'].includes(event.short))).toBe(true)
})



// COMET BATCH

test('comet notes are two sentences with the magnitude in brackets', () => {
  expect(comets.every(event => /^[^.]+ \(magnitude −?\d+\.\d\)\. Comet forecasts are often off, so it could be brighter or fainter\.$/.test(event.note))).toBe(true)
  expect(comets.filter(event => /predicted/i.test(event.note))).toEqual([])
})

test('comet cards leave brightness to the note', () => {
  expect(labels(comets).has('Brightness')).toBe(false)
})



// LEFTOVERS

test('no note says dark twice', () => {
  expect([...all, ...comets].map(event => event.note).filter(note => (note.match(/\bdark\b/g) ?? []).length > 1)).toEqual([])
})

test('planets lining up with the Sun use a short chip', () => {
  expect(of('solar-conjunction').every(event => / & Sun$/.test(event.short))).toBe(true)
})



// SOUTHERN BATCH

const SYDNEY = { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney', country: 'AU' }
const south = Array.from({ length: 14 }, (_, i) => {
  const index = 10 + i

  return monthEvents(SYDNEY, 2026 + Math.floor(index / 12), (index % 12) + 1)
}).flat()
const southComets = cometSeason(SAMPLE_COMETS, SYDNEY, new Date('2027-01-15T12:00:00Z'))
const showersIn = events => events.filter(event => event.kinds.some(kind => kind.endsWith('-shower')))
const minutes = text => {
  const [, hour, minute = '0', half] = /^(\d+)(?::(\d+))?(am|pm)$/.exec(text)

  return (Number(hour) % 12 + (half === 'pm' ? 12 : 0)) * 60 + Number(minute)
}
const bestTime = (events, name) => events.find(event => event.name.startsWith(name)).rows.find(([label]) => label === 'Best time')[1]

test('shower best times stay in the dark', () => {
  expect(minutes(bestTime(all, 'Eta Aquariids'))).toBeLessThanOrEqual(5 * 60 + 20)
  expect(minutes(bestTime(south, 'Leonids'))).toBeLessThanOrEqual(4 * 60 + 45)
})

test('showers you can’t see from here skip best time and look', () => {
  const away = showersIn(south).filter(event => !event.here)

  expect(away.length).toBeGreaterThan(0)
  expect(labels(away).has('Best time')).toBe(false)
  expect(labels(away).has('Look')).toBe(false)
})

test('hints don’t assume a hemisphere’s seasons', () => {
  const notes = [...south, ...all].map(event => event.note)

  expect(notes.filter(note => /spring evenings|summer favorite/.test(note))).toEqual([])
})

test('a planet you can’t see from here isn’t called easy to spot', () => {
  expect(south.filter(event => event.kinds.includes('opposition') && !event.here && /easiest/.test(event.note))).toEqual([])
})

test('comets you can’t see from here have no made-up time', () => {
  expect(southComets.filter(event => !event.here).every(event => event.time === '')).toBe(true)
})

test('Boötes keeps its accent', () => {
  expect(values(all).filter(value => value === 'Bootes')).toEqual([])
  expect(values(all)).toContain('Boötes')
})
