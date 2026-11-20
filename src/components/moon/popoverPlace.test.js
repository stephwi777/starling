import { expect, test } from 'vitest'
import { popoverPlace } from './popoverPlace.js'



// HELPERS

const VIEWPORT = { width: 1200, height: 900 }
const PANEL = { width: 380, height: 600 }

function tile(left, top, width = 220, height = 200) {
  return { left, top, right: left + width, bottom: top + height }
}



// SIDES

test('opens to the right of the tile with a gap, its arrow at the tile’s middle', () => {
  const place = popoverPlace(tile(100, 300), PANEL, VIEWPORT)

  expect(place.side).toBe('right')
  expect(place.left).toBe(334)
  expect(place.top + place.arrow).toBe(400)
})

test('opens to the left when the right side has no room', () => {
  const place = popoverPlace(tile(880, 300), PANEL, VIEWPORT)

  expect(place.side).toBe('left')
  expect(place.left).toBe(880 - 14 - 380)
})



test('says when neither side has room for the panel', () => {
  expect(popoverPlace(tile(100, 300), PANEL, VIEWPORT).fits).toBe(true)
  expect(popoverPlace(tile(60, 300, 300), PANEL, { width: 720, height: 900 }).fits).toBe(false)
})



// STAYING ON SCREEN

test('stays inside the window near the top and bottom', () => {
  expect(popoverPlace(tile(100, 20), PANEL, VIEWPORT).top).toBe(16)
  expect(popoverPlace(tile(100, 700), PANEL, VIEWPORT).top).toBe(900 - 16 - 600)
})

test('the arrow never slides past the rounded corners', () => {
  const place = popoverPlace(tile(100, -150), PANEL, VIEWPORT)

  expect(place.arrow).toBe(36)
})

test('a panel taller than the window starts at the top margin', () => {
  expect(popoverPlace(tile(100, 300), { width: 380, height: 1200 }, VIEWPORT).top).toBe(16)
})
