import { expect, test } from 'vitest'
import { CLOUD_PATHS, SHAPES, bottomAt, topAt } from './cloudShapes.js'



// TESTS

test('every cloud is solid from its top edge to its bottom', () => {
  for (const bumps of Object.values(SHAPES)) {
    const start = bumps[0][0] - bumps[0][2]
    const end = bumps.at(-1)[0] + bumps.at(-1)[2]

    for (let x = start + 0.5; x < end; x += 0.5) {
      expect(topAt(bumps, x)).not.toBeNull()
      expect(topAt(bumps, x)).toBeLessThanOrEqual(bottomAt(bumps, x))
      expect(bottomAt(bumps, x)).toBeLessThanOrEqual(70)
    }
  }
})

test('the end bumps curve down to the flat bottom', () => {
  for (const bumps of Object.values(SHAPES)) {
    expect(bumps[0][1] + bumps[0][2]).toBe(70)
    expect(bumps.at(-1)[1] + bumps.at(-1)[2]).toBe(70)
  }
})

test('the bottom is flat between the end bumps', () => {
  const bumps = SHAPES.wide
  expect(bottomAt(bumps, 100)).toBe(70)
  expect(bottomAt(bumps, bumps[0][0] - bumps[0][2] + 1)).toBeLessThan(70)
})

test('paths are closed and drawn once per shape', () => {
  expect(Object.keys(CLOUD_PATHS)).toEqual(['wide', 'tall', 'long', 'hump', 'small'])

  for (const name of Object.keys(SHAPES)) expect(CLOUD_PATHS[name]).toMatch(/^M.*Z$/)
})
