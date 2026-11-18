import { expect, test } from 'vitest'
import { meteorKind } from './meteorKind.js'



// TESTS

test('most meteors are the original soft meteor', () => {
  expect(meteorKind(0)).toBe('meteor')
  expect(meteorKind(0.47)).toBe('meteor')
})

test('some original meteors end in a burst of sparks', () => {
  expect(meteorKind(0.48)).toBe('meteor burst')
  expect(meteorKind(0.79)).toBe('meteor burst')
})

test('about one in ten is a wide fireball', () => {
  expect(meteorKind(0.8)).toBe('fireball')
  expect(meteorKind(0.89)).toBe('fireball')
})

test('about one in ten is a wide fireball that bursts', () => {
  expect(meteorKind(0.9)).toBe('fireball burst')
  expect(meteorKind(0.999)).toBe('fireball burst')
})
