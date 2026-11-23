import { expect, test } from 'vitest'
import { parseComets } from './cometOrbit.js'
import { cometNotes, cometSeason } from './cometEvents.js'
import { SAMPLE_COMETS } from './cometSample.js'
import { HARTLEY, LEMMON } from './__fixtures__/cometLines.js'



// PLACES

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const OSLO = { name: 'Oslo', latitude: 59.91, longitude: 10.75, timeZone: 'Europe/Oslo', country: 'NO' }



// SEASONS

test('Comet Lemmon in autumn 2025 arrives, peaks as naked eye and fades', () => {
  const events = cometSeason(parseComets(LEMMON), KC, new Date('2025-09-15T12:00:00Z'))
  const best = events[1]

  expect(events.map(event => event.name)).toEqual(['Comet Lemmon arrives', 'Comet Lemmon at its best', 'Last look at Comet Lemmon'])
  expect(best.day >= '2025-10-15' && best.day <= '2025-11-10').toBe(true)
  expect(best.tags).toContain('Naked eye')
  expect(best.kinds).toEqual(['comet'])
  expect(best.group).toBe('comet')
  expect(best.tiny).toBe('Lemmon')
  expect(best.id).toBe('comet-CK25A060-best')
  expect(best.note).toMatch(/predict/i)
  expect(best.rows.find(([label]) => label === 'Brightness')[1]).toMatch(/\(predicted\)$/)
})

test('a faint comet is a telescope comet', () => {
  const events = cometSeason(parseComets(HARTLEY), KC, new Date('2026-11-23T12:00:00Z'))

  expect(events.length).toBeGreaterThan(0)
  expect(events.every(event => event.kinds[0] === 'telescope-comet' && event.tags.includes('Telescope'))).toBe(true)
  expect(events.map(event => event.name)).not.toContain('Comet Hartley-IRAS arrives')
})

test('nothing before the current month or past 12 months', () => {
  expect(cometSeason(parseComets(LEMMON), KC, new Date('2026-11-23T12:00:00Z'))).toEqual([])
})



// WORLDWIDE

test('a southern comet shows worldwide only from the north', () => {
  const southwind = SAMPLE_COMETS.filter(comet => comet.name === 'Southwind')
  const [event] = cometSeason(southwind, OSLO, new Date('2026-12-01T12:00:00Z'))

  expect(event.here).toBe(false)
  expect(event.where).toBe('Best seen from the Southern Hemisphere.')
})



// SAMPLES AND PLACES

test('the sample comets cover every case', () => {
  const events = cometSeason(SAMPLE_COMETS, KC, new Date('2026-12-01T12:00:00Z'))

  expect(events.some(event => event.tags.includes('Naked eye'))).toBe(true)
  expect(events.some(event => event.kinds[0] === 'comet' && !event.tags.includes('Naked eye'))).toBe(true)
  expect(events.some(event => event.kinds[0] === 'telescope-comet')).toBe(true)
})

test('a different place gets its own events', () => {
  const now = new Date('2026-12-01T12:00:00Z')

  expect(cometSeason(SAMPLE_COMETS, KC, now)).not.toBe(cometSeason(SAMPLE_COMETS, OSLO, now))
})

test('two comets with the same name get their designations added', () => {
  const [lemmon] = parseComets(LEMMON)
  const twin = { ...lemmon, id: 'CK25A061', designation: 'C/2025 A7' }
  const names = new Set(cometSeason([lemmon, twin], KC, new Date('2025-09-15T12:00:00Z')).map(event => event.name))

  expect(names).toContain('Comet Lemmon (C/2025 A6) at its best')
  expect(names).toContain('Comet Lemmon (C/2025 A7) at its best')
})

test('two comets with the same name keep separate favorites', () => {
  const [lemmon] = parseComets(LEMMON)
  const twin = { ...lemmon, id: 'CK25A061', designation: 'C/2025 A7' }
  const subjects = cometSeason([lemmon, twin], KC, new Date('2025-09-15T12:00:00Z')).map(event => event.subjects[0])

  expect(new Set(subjects.map(subject => subject.key))).toEqual(new Set(['comet:CK25A060', 'comet:CK25A061']))
  expect(new Set(subjects.map(subject => subject.label))).toEqual(new Set(['Comet Lemmon (C/2025 A6)', 'Comet Lemmon (C/2025 A7)']))
})



// CHECKLIST NOTES

const binocular = { kinds: ['comet'] }
const faint = { kinds: ['telescope-comet'] }
const BOTH = ['comet', 'telescope-comet']
const EMPTY = 'No upcoming comets of this type yet.'

test('no notes while comets are loading', () => {
  expect(cometNotes('loading', [], BOTH)).toEqual({ group: null, kinds: {} })
})

test('a failed load says so for the whole group', () => {
  expect(cometNotes('failed', [], BOTH)).toEqual({ group: 'Comet predictions couldn’t load right now.', kinds: {} })
})

test('each checked kind with nothing coming gets its own note', () => {
  expect(cometNotes('ready', [faint], BOTH).kinds).toEqual({ comet: EMPTY })
  expect(cometNotes('ready', [binocular], BOTH).kinds).toEqual({ 'telescope-comet': EMPTY })
  expect(cometNotes('ready', [], BOTH)).toEqual({ group: null, kinds: { comet: EMPTY, 'telescope-comet': EMPTY } })
})

test('unchecked kinds get no note', () => {
  expect(cometNotes('ready', [], ['comet']).kinds).toEqual({ comet: EMPTY })
  expect(cometNotes('ready', [binocular, faint], BOTH).kinds).toEqual({})
})
