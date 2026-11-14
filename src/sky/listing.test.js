import { expect, test } from 'vitest'
import { filterObjects, sortEasiest } from './listing.js'



// HELPERS

const sun = [-20, -20]

function object(name, extra = {}) {
  return { name, gear: 1, mag: 1, visible: true, bestIndex: 0, track: [{ alt: 30 }, { alt: -5 }], ...extra }
}

const list = [
  object('Saturn'),
  object('Andromeda Galaxy', { id: 'M31', gear: 2 }),
  object('Mercury', { visible: false, track: [{ alt: -5 }, { alt: -5 }] }),
]



// TESTS

test('search matches names and catalog numbers, ignoring case', () => {
  expect(filterObjects(list, { query: 'm31', show: 'all', gear: 3, at: 0, sun }).map(item => item.name)).toEqual(['Andromeda Galaxy'])
  expect(filterObjects(list, { query: 'SAT', show: 'all', gear: 3, at: 0, sun }).map(item => item.name)).toEqual(['Saturn'])
  expect(filterObjects(list, { query: 'zzz', show: 'all', gear: 3, at: 0, sun })).toEqual([])
})

test('tonight hides objects that are not visible', () => {
  expect(filterObjects(list, { query: '', show: 'tonight', gear: 3, at: 0, sun }).map(item => item.name)).toEqual(['Saturn', 'Andromeda Galaxy'])
})

test('up now needs the object above the horizon in the dark', () => {
  expect(filterObjects(list, { query: '', show: 'now', gear: 3, at: 1, sun }).map(item => item.name)).toEqual([])
  expect(filterObjects(list, { query: '', show: 'now', gear: 3, at: 0, sun }).map(item => item.name)).toEqual(['Saturn', 'Andromeda Galaxy'])
})

test('gear hides objects that need more equipment', () => {
  expect(filterObjects(list, { query: '', show: 'all', gear: 1, at: 0, sun }).map(item => item.name)).toEqual(['Saturn', 'Mercury'])
})

test('easiest first puts naked-eye and bright objects first', () => {
  const sorted = sortEasiest([object('Faint', { mag: 5 }), object('Scope', { gear: 3, mag: -2 }), object('Bright', { mag: -1 })])
  expect(sorted.map(item => item.name)).toEqual(['Bright', 'Faint', 'Scope'])
})
