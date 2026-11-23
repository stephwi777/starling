import { expect, test } from 'vitest'
import { favoredSubjects, isFavorite } from './favorites.js'



// HELPERS

const FULL = { key: 'full-moon', label: 'every Full Moon' }
const SUPER = { key: 'supermoon', label: 'every supermoon' }
const superFull = { subjects: [FULL, SUPER] }



// TESTS

test('an event is a favorite when any of its subjects is', () => {
  expect(isFavorite(superFull, ['supermoon'])).toBe(true)
  expect(isFavorite(superFull, ['new-moon'])).toBe(false)
})

test('favored subjects come back in the event’s own order', () => {
  expect(favoredSubjects(superFull, ['supermoon', 'full-moon'])).toEqual([FULL, SUPER])
  expect(favoredSubjects(superFull, ['supermoon'])).toEqual([SUPER])
})
