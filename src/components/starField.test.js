import { expect, test } from 'vitest'
import { moonDimming, visibleStars } from './starField.js'



// HELPERS

function star(id, left, top) {
  return { id, left, top }
}

const pool = Array.from({ length: 640 }, (_, i) => star(i, 50, 50))
const box = { left: 90, top: 90, right: 110, bottom: 110 }



// TESTS

test('a wide field never shows more than 320 stars', () => {
  expect(visibleStars(pool, { width: 1425, height: 1293 }, []).length).toBe(320)
})

test('narrower fields get fewer stars in step with their width', () => {
  expect(visibleStars(pool, { width: 390, height: 1500 }, []).length).toBe(88)
  expect(visibleStars(pool, { width: 2000, height: 1500 }, []).length).toBe(320)
})

test('text never lowers the star count while clear stars remain', () => {
  const text = { left: 0, top: 0, right: 390, bottom: 750 }
  const spread = Array.from({ length: 640 }, (_, i) => star(i, (i * 37) % 100, (i * 61) % 100))
  expect(visibleStars(spread, { width: 390, height: 1500 }, [text]).length).toBe(88)
})

test('a star on top of text is skipped', () => {
  expect(visibleStars([star(1, 10, 10)], { width: 1000, height: 1000 }, [box])).toEqual([])
})

test('a star just beside text is skipped too', () => {
  expect(visibleStars([star(1, 12, 10)], { width: 1000, height: 1000 }, [box])).toEqual([])
})

test('a skipped star is replaced by the next clear one', () => {
  const stars = [star(1, 10, 10), star(2, 50, 50), star(3, 60, 60)]
  expect(visibleStars(stars, { width: 4, height: 100 }, [{ left: 0, top: 8, right: 4, bottom: 12 }])).toEqual([star(2, 50, 50)])
})

test('the amount scales the star count for moonlight and clouds', () => {
  expect(visibleStars(pool, { width: 1425, height: 1293 }, [], 0.5).length).toBe(160)
  expect(visibleStars(pool, { width: 1425, height: 1293 }, [], 0).length).toBe(0)
})

test('stars are not dimmed when there is no Moon', () => {
  expect(moonDimming(100, 100, null)).toBe(1)
})

test('a star at the center of the Moon is dimmed by 30 percent', () => {
  expect(moonDimming(500, 500, { x: 500, y: 500, radius: 60 })).toBeCloseTo(0.7)
})

test('dimming fades out with distance from the Moon', () => {
  const moon = { x: 500, y: 500, radius: 60 }
  const near = moonDimming(560, 500, moon)
  const middle = moonDimming(660, 500, moon)

  expect(near).toBeLessThan(middle)
  expect(middle).toBeLessThan(1)
  expect(moonDimming(500 + 60 * 4.5, 500, moon)).toBe(1)
  expect(moonDimming(1400, 900, moon)).toBe(1)
})
