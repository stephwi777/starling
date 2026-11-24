import { expect, test } from 'vitest'
import * as Astronomy from 'astronomy-engine'
import { observerFor } from '../night.js'
import { monthEvents } from './monthEvents.js'
import { findCover, isCovered, occultationEvent } from './occultations.js'



// HELPERS

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }
const SYDNEY = { name: 'Sydney', latitude: -33.87, longitude: 151.21, timeZone: 'Australia/Sydney', country: 'AU' }
const NONE = { comets: [], version: 'test', now: new Date('2026-11-23T12:00:00Z') }

const covers = (place, year, month) => monthEvents(place, year, month, NONE).filter(event => event.kinds.includes('occultation'))



// TESTS

test('the Moon covers the Pleiades over Kansas City on September 21, 2027', () => {
  const [pleiades] = covers(KC, 2027, 9).filter(event => event.name === 'Moon covers the Pleiades')
  const near = monthEvents(KC, 2027, 9, NONE).filter(event => event.kinds.includes('moon-star') && event.name.includes('Pleiades') && Math.abs(event.date - pleiades.date) < 86400000)

  expect(['2027-09-20', '2027-09-21']).toContain(pleiades.day)
  expect(pleiades.tags).toContain('Rare')
  expect(pleiades.tags).not.toContain('Daytime')
  expect(near).toEqual([])
}, 30000)

test('Sydney sees the Moon cover Antares in March and June 2027', () => {
  expect(covers(SYDNEY, 2027, 3).map(event => event.name)).toContain('Moon covers Antares')
  expect(covers(SYDNEY, 2027, 6).map(event => event.name)).toContain('Moon covers Antares')
}, 30000)

test('a star covered in daylight is left out', () => {
  expect(covers(KC, 2027, 6)).toEqual([])
}, 30000)

test('Jupiter covered in daylight shows with a Daytime tag', () => {
  const jupiter = covers(SYDNEY, 2026, 11).find(event => event.name === 'Moon covers Jupiter')

  expect(jupiter.tags).toEqual(['Rare', 'Daytime'])
  expect(jupiter.note).toMatch(/binoculars or a telescope/)
}, 30000)

test('occultations are only ever ones seen from here, with their times first', () => {
  const all = [...covers(KC, 2027, 9), ...covers(SYDNEY, 2027, 3), ...covers(SYDNEY, 2026, 11)]

  expect(all.length).toBeGreaterThan(2)
  expect(all.every(event => event.here)).toBe(true)
  expect(all.every(event => ['Disappears', 'Moon arrives'].includes(event.rows[0][0]) && ['Reappears', 'Moon leaves'].includes(event.rows[1][0]))).toBe(true)
  expect(all.every(event => event.subjects[0].key.startsWith('occultation:'))).toBe(true)
}, 30000)

test('long occultations say hours, not hundreds of minutes', () => {
  const notes = covers(KC, 2027, 12).map(event => event.note)

  expect(notes.length).toBeGreaterThan(0)
  expect(notes.filter(note => /\d{3} minutes/.test(note))).toEqual([])
  expect(notes.some(note => /about \d hours?( \d+ minutes)?/.test(note))).toBe(true)
}, 30000)



// EDGES AND VISIBILITY

const QUITO = { name: 'Quito', latitude: -0.18, longitude: -78.47, timeZone: 'America/Guayaquil', country: 'EC' }

test('a long occultation is followed all the way to both edges', () => {
  const observer = observerFor(QUITO)
  const cover = findCover(Astronomy.Body.Star1, new Date('2028-06-20T08:00:00Z'), observer, 0.5)
  const minute = 60 * 1000

  expect(isCovered(Astronomy.Body.Star1, new Date(cover.from.getTime() - minute), observer, 0.5)).toBe(false)
  expect(isCovered(Astronomy.Body.Star1, new Date(cover.to.getTime() + minute), observer, 0.5)).toBe(false)
}, 30000)

test('a moment that can’t be seen says why instead of giving a time', () => {
  const august = covers(KC, 2026, 8).find(event => event.name === 'Moon covers the Pleiades')

  expect(august.rows.find(([label]) => label === 'Moon arrives')[1]).toBe('Moon too low to see')
}, 30000)

test('an occultation with neither moment visible is left out', () => {
  expect(covers(QUITO, 2026, 6).filter(event => event.name === 'Moon covers the Beehive')).toEqual([])
}, 30000)

test('a star’s moment in daylight says the sky is too bright', () => {
  const february = covers(SYDNEY, 2029, 2).find(event => event.name === 'Moon covers the Pleiades')

  expect(february.rows.some(([, value]) => value === 'Sky too bright')).toBe(true)
  expect(february.tags).not.toContain('Daytime')
}, 30000)



// WORDING

const at = new Date('2027-09-21T03:00:00Z')
const quick = (sight, extra = {}) => occultationEvent({ id: 'Regulus', short: 'Regulus', label: 'Regulus', cover: { from: at, to: at, middle: at }, sight, place: KC, observer: observerFor(KC), ...extra })

test('a graze under a minute says so plainly', () => {
  expect(quick({ from: 'dark', to: 'dark', light: 'dark' }).note).toMatch(/for about a minute\./)
})

test('a twilight occultation says twilight, not daylight, and has no Daytime tag', () => {
  const twilight = quick({ from: 'twilight', to: 'dark', light: 'twilight' })

  expect(twilight.note).toMatch(/twilight/)
  expect(twilight.note).not.toMatch(/daylight/)
  expect(twilight.tags).toEqual(['Rare'])
})

test('a star cluster is reached and left, never fully hidden', () => {
  const cluster = quick({ from: 'dark', to: 'dark', light: 'dark' }, { cluster: true })

  expect(cluster.rows.map(([label]) => label).slice(0, 2)).toEqual(['Moon arrives', 'Moon leaves'])
})
