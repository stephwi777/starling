import { expect, test } from 'vitest'
import { submits } from './searchKeys.js'



// TESTS

test('Enter goes to the next match', () => {
  expect(submits({ key: 'Enter', isComposing: false }, 'Perseids')).toBe(true)
})

test('Enter while still composing text does nothing', () => {
  expect(submits({ key: 'Enter', isComposing: true }, 'ペルセウス')).toBe(false)
})

test('Enter in an empty box does nothing', () => {
  expect(submits({ key: 'Enter', isComposing: false }, '   ')).toBe(false)
  expect(submits({ key: 'a', isComposing: false }, 'Perseids')).toBe(false)
})
