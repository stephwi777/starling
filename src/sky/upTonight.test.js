import { expect, test } from 'vitest'
import { upTonight } from './upTonight.js'



// HELPERS

const ZONE = 'America/Chicago'
const MINUTE = 60 * 1000
const FIVE_PM = new Date('2026-11-18T23:00:00Z').getTime()
const STEPS = Array.from({ length: 85 }, (_, i) => i * 10)
const NINE_PM = 24
const FOUR_AM = 66

const NIGHT = {
  times: STEPS.map(m => new Date(FIVE_PM + m * MINUTE)),
  sun: STEPS.map(m => (m < 4 ? 2 : m < 96 || m >= 749 ? -10 : -30)),
}

function object(name, kind, extra = {}) {
  const alt = extra.alt ?? 40
  const best = extra.best ?? NINE_PM

  return {
    name,
    kind,
    gear: 1,
    mag: 1,
    visible: true,
    bestIndex: best,
    track: STEPS.map((_, i) => ({ alt: i === best ? alt : alt - 10, az: extra.az ?? 180 })),
    ...extra,
  }
}

function shower(name, zhr) {
  const track = STEPS.map((_, i) => ({ alt: i === FOUR_AM ? 90 : 30, az: 60 }))

  return object(name, 'shower', { zhr, daysFromPeak: 0, best: FOUR_AM, track })
}

function sky(lists = {}) {
  return {
    night: NIGHT,
    moon: object('Moon', 'moon'),
    planets: [object('Saturn', 'planet', { mag: 0.9 })],
    showers: [shower('Leonids', 15)],
    deep: [object('Pleiades', 'cluster', { mag: 1.6, az: 90 })],
    shapes: [object('Orion', 'shape', { mag: 2, az: 100 })],
    stars: [object('Sirius', 'star', { mag: -1.46, az: 120 })],
    ...lists,
  }
}

function names(result) {
  return result.picks.map(pick => pick.name)
}



// PICKS

test('one easy highlight of each kind', () => {
  expect(names(upTonight(sky(), ZONE))).toEqual(['Saturn', 'Leonid meteors', 'Pleiades', 'Orion'])
})

test('a bright star fills in when there is no shower', () => {
  expect(names(upTonight(sky({ showers: [] }), ZONE))).toEqual(['Saturn', 'Pleiades', 'Orion', 'Sirius'])
})

test('a second planet fills in when the other kinds run out', () => {
  const planets = [object('Saturn', 'planet', { mag: 0.9 }), object('Jupiter', 'planet', { mag: -2.5 })]

  expect(names(upTonight(sky({ planets, showers: [], shapes: [], stars: [] }), ZONE))).toEqual(['Jupiter', 'Pleiades', 'Saturn'])
})

test('hidden objects, telescope objects, the Moon and weak showers are left out', () => {
  const result = upTonight(sky({
    planets: [object('Neptune', 'planet', { gear: 3 }), object('Mars', 'planet', { visible: false })],
    showers: [shower('Taurids', 5)],
  }), ZONE)

  expect(names(result)).toEqual(['Pleiades', 'Orion', 'Sirius'])
})

test('well-placed objects come before low ones', () => {
  const planets = [object('Venus', 'planet', { mag: -4, alt: 10 }), object('Saturn', 'planet', { mag: 0.9, alt: 40 })]

  expect(upTonight(sky({ planets }), ZONE).picks[0].name).toBe('Saturn')
})

test('faint deep-sky objects are left out when it never gets fully dark', () => {
  const twilight = { ...NIGHT, sun: NIGHT.sun.map(alt => Math.max(alt, -15)) }
  const deep = [object('Andromeda Galaxy', 'galaxy', { mag: 3.4 })]
  const result = upTonight({ ...sky({ deep, showers: [] }), night: twilight }, ZONE)

  expect(names(result)).toEqual(['Saturn', 'Orion', 'Sirius'])
})

test('binocular objects say so', () => {
  const result = upTonight(sky({ deep: [object('Double Cluster', 'cluster', { gear: 2, mag: 3.7 })] }), ZONE)

  expect(result.picks.find(pick => pick.name === 'Double Cluster').gear).toBe('Binoculars')
})



// NOTES

test('notes say where and when in fists and compass words', () => {
  const saturn = upTonight(sky(), ZONE).picks[0]

  expect(saturn.note).toBe('4 fists up in the south at 9pm')
})

test('very high objects are nearly overhead', () => {
  const vega = upTonight(sky({ planets: [], stars: [object('Vega', 'star', { alt: 80 })] }), ZONE).picks.find(pick => pick.name === 'Vega')

  expect(vega.note).toBe('Nearly overhead at 9pm')
})

test('faint deep-sky objects need a dark sky', () => {
  const andromeda = upTonight(sky({ deep: [object('Andromeda Galaxy', 'galaxy', { mag: 3.4, az: 45, alt: 70 })] }), ZONE).picks[2]

  expect(andromeda.note).toBe('7 fists up in the northeast at 9pm. Needs a dark sky.')
})

test('showers say how many meteors and when', () => {
  expect(upTonight(sky(), ZONE).picks[1].note).toBe('About 15 an hour at 4am')
})



// COUNT

test('the count covers everything up tonight, including what is not shown', () => {
  const result = upTonight(sky({ planets: [object('Saturn', 'planet'), object('Neptune', 'planet', { gear: 3 })] }), ZONE)

  expect(result.total).toBe(7)
})

test('nothing to show when the sky stays bright', () => {
  const bright = { ...NIGHT, sun: NIGHT.sun.map(() => -5) }
  const result = upTonight({ ...sky({ planets: [], showers: [], deep: [], shapes: [], stars: [] }), night: bright, moon: object('Moon', 'moon', { visible: false }) }, ZONE)

  expect(result).toEqual({ picks: [], total: 0, empty: 'The sky stays too bright tonight.' })
})
