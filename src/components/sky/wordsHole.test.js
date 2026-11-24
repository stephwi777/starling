import { expect, test } from 'vitest'
import { HOLE_PAD, wordsHole } from './wordsHole.js'



// HELPERS

const SCENE = { left: 0, top: 0 }

function inside(hole, line) {
  return line.left - hole.left >= HOLE_PAD.x && hole.right - line.right >= HOLE_PAD.x && line.top - hole.top >= HOLE_PAD.y && hole.bottom - line.bottom >= HOLE_PAD.y
}



// TESTS

test('the clear area covers every corner of a long two-line name and sentence', () => {
  const lines = [
    { left: 23, right: 352, top: 150, bottom: 190 },
    { left: 60, right: 315, top: 190, bottom: 228 },
    { left: 110, right: 265, top: 232, bottom: 252 },
    { left: 28, right: 347, top: 262, bottom: 290 },
    { left: 70, right: 305, top: 290, bottom: 318 },
  ]
  const hole = wordsHole(lines, SCENE)

  for (const line of lines) expect(inside(hole, line)).toBe(true)
})

test('the clear area is measured from the scene, not the window', () => {
  const hole = wordsHole([{ left: 300, right: 500, top: 200, bottom: 240 }], { left: 100, top: 150 })
  expect(hole).toEqual({ left: 200 - HOLE_PAD.x, right: 400 + HOLE_PAD.x, top: 50 - HOLE_PAD.y, bottom: 90 + HOLE_PAD.y })
})
