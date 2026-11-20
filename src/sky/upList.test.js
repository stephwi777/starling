import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { buildSky } from './useNight.js'
import { filterRows, upList } from './upList.js'
import { nextShower } from './meteors.js'



// HELPERS

const ZONE = SAMPLE_PLACE.timeZone
const NINE_PM = new Date('2026-11-21T03:00:00Z')
const sky = buildSky(SAMPLE_PLACE, 0, NINE_PM)
const list = upList(sky, NINE_PM, ZONE)

function row(name) {
  return list.rows.find(each => each.name === name)
}



// GROUPS

test('stars up at 9pm are in Up now with where to look', () => {
  expect(list.atDark).toBe(false)
  expect(row('Capella')).toMatchObject({ group: 'now', note: '4 fists up · northeast' })
})

test('planets that rise late are best before dawn', () => {
  expect(row('Jupiter')).toMatchObject({ group: 'dawn', note: '6am · 6 fists up · south' })
})

test('objects that have already set are left out', () => {
  const step = Math.round((NINE_PM - sky.night.start) / (sky.night.times[1] - sky.night.times[0]))

  for (const each of list.rows.filter(entry => entry.type !== 'meteor')) {
    expect(each.object.track[step].alt > 0 || each.object.bestIndex > step, each.name).toBe(true)
  }
})

test('setting objects come last in Up now', () => {
  const now = list.rows.filter(each => each.group === 'now')
  const first = now.findIndex(each => each.setting)

  expect(first).toBeGreaterThan(0)
  expect(now.slice(first).every(each => each.setting)).toBe(true)
  expect(now[first].note).toMatch(/^Low in the [a-z]+ · setting$/)
})

test('before dark the list starts at dark', () => {
  const afternoon = new Date('2026-11-20T21:00:00Z')
  const early = upList(buildSky(SAMPLE_PLACE, 0, afternoon), afternoon, ZONE)

  expect(early.atDark).toBe(true)
  expect(early.rows.find(each => each.group === 'now').note).toMatch(/^(\d+ fists? up · [a-z]+|Nearly overhead)$/)
})

test('short northern nights split inside the dark hours', () => {
  const oslo = { ...SAMPLE_PLACE, latitude: 59.91, longitude: 10.75, timeZone: 'Europe/Oslo', country: 'NO' }
  const late = new Date('2026-05-20T21:00:00Z')
  const result = upList(buildSky(oslo, 0, late), late, oslo.timeZone)

  expect(result.rows.length).toBeGreaterThan(0)
  expect(new Set(result.rows.map(each => each.group)).size).toBeGreaterThan(1)
})



// FILTER

test('filters keep the gear, type and name asked for', () => {
  expect(filterRows(list.rows, { gear: 1, type: 'all', query: '' }).every(each => each.gear === 1)).toBe(true)
  expect(filterRows(list.rows, { gear: 3, type: 'deep', query: '' }).every(each => each.type === 'deep')).toBe(true)
  expect(filterRows(list.rows, { gear: 3, type: 'all', query: 'andro' }).map(each => each.name)).toEqual(expect.arrayContaining(['Andromeda Galaxy', 'Andromeda']))
})



// NEXT SHOWER

test('the next strong shower after November 20 is the Geminids', () => {
  const next = nextShower(NINE_PM, ZONE)

  expect(next.name).toBe('Geminids')
  expect(new Intl.DateTimeFormat('en-US', { timeZone: ZONE, month: 'long', day: 'numeric' }).format(next.peak)).toBe('December 14')
})
