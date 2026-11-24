import { expect, test } from 'vitest'
import { fallPieces } from './fallPieces.js'



// TESTS

test('rain is 52 quick drops', () => {
  const drops = fallPieces('rain')
  expect(drops).toHaveLength(52)

  for (const drop of drops) {
    expect(drop.duration).toBeGreaterThanOrEqual(1.2)
    expect(drop.duration).toBeLessThanOrEqual(1.8)
    expect(drop.size).toBeGreaterThanOrEqual(5)
    expect(drop.size).toBeLessThanOrEqual(9)
  }
})

test('snow is 42 slow flakes', () => {
  const flakes = fallPieces('snow')
  expect(flakes).toHaveLength(42)

  for (const flake of flakes) {
    expect(flake.duration).toBeGreaterThanOrEqual(9)
    expect(flake.duration).toBeLessThanOrEqual(14)
    expect(flake.size).toBeGreaterThanOrEqual(10)
    expect(flake.size).toBeLessThanOrEqual(14)
  }
})

test('every piece starts part way through its fall, spread across the sky', () => {
  for (const piece of fallPieces('rain')) {
    expect(piece.delay).toBeLessThanOrEqual(0)
    expect(-piece.delay).toBeLessThanOrEqual(piece.duration)
    expect(piece.left).toBeGreaterThanOrEqual(0)
    expect(piece.left).toBeLessThanOrEqual(100)
  }
})

test('the scatter is the same every visit', () => {
  expect(fallPieces('snow')).toEqual(fallPieces('snow'))
  expect(fallPieces('rain')).not.toEqual(fallPieces('snow'))
})
