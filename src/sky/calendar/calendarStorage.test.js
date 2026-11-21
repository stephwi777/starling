import { expect, test } from 'vitest'
import { DEFAULT_CALENDAR, loadCalendar, saveCalendar } from './calendarStorage.js'
import { DEFAULT_KINDS } from './kinds.js'



// HELPERS

function memory(text = null) {
  let value = text

  return {
    getItem: () => value,
    setItem: (_, next) => {
      value = next
    },
  }
}



// TESTS

test('a first visit gets the suggested kinds and Visible from here', () => {
  expect(loadCalendar(memory())).toEqual(DEFAULT_CALENDAR)
})

test('choices are saved and loaded back', () => {
  const storage = memory()

  saveCalendar({ kinds: ['full-moon', 'station'], world: true }, storage)

  expect(loadCalendar(storage)).toEqual({ kinds: ['full-moon', 'station'], world: true })
})

test('kinds added after a save start in their suggested state', () => {
  const storage = memory(JSON.stringify({ version: 1, known: ['full-moon'], kinds: ['full-moon'], world: false }))

  expect(loadCalendar(storage).kinds).toEqual(['full-moon', ...DEFAULT_KINDS.filter(id => id !== 'full-moon')])
})

test('unknown kinds and broken saves are ignored', () => {
  expect(loadCalendar(memory(JSON.stringify({ version: 1, known: [], kinds: ['nope'], world: 'yes' }))).world).toBe(false)
  expect(loadCalendar(memory('{broken'))).toEqual(DEFAULT_CALENDAR)
  expect(loadCalendar({ getItem: () => { throw new Error('blocked') } })).toEqual(DEFAULT_CALENDAR)
})
