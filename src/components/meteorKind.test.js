import { expect, test } from 'vitest'
import { meteorKind } from './meteorKind.js'



// TESTS

test('most meteors are the everyday streak', () => {
  expect(meteorKind(0)).toBe('streak')
  expect(meteorKind(0.79)).toBe('streak')
})

test('about one in ten is a wide streak', () => {
  expect(meteorKind(0.8)).toBe('fireball')
  expect(meteorKind(0.89)).toBe('fireball')
})

test('about one in ten is a wide streak that bursts', () => {
  expect(meteorKind(0.9)).toBe('fireball burst')
  expect(meteorKind(0.999)).toBe('fireball burst')
})
