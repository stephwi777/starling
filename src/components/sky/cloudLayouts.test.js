import { expect, test } from 'vitest'
import { LAYOUTS } from './cloudLayouts.js'
import { SHAPES } from './cloudShapes.js'



// TESTS

test('every cloud uses one of the five shapes and a known shade', () => {
  const clouds = [LAYOUTS[1].desktop, LAYOUTS[1].phone, LAYOUTS[2].desktop, LAYOUTS[2].phone, LAYOUTS[3].desktop, LAYOUTS[3].phone].flat()

  for (const cloud of clouds) {
    expect(Object.keys(SHAPES)).toContain(cloud.shape)
    expect(cloud.shade).toBeGreaterThanOrEqual(0)
    expect(cloud.shade).toBeLessThanOrEqual(6)
  }
})

test('a few clouds are two clouds, one by the Moon', () => {
  for (const size of ['desktop', 'phone']) {
    expect(LAYOUTS[1][size]).toHaveLength(2)
    expect(LAYOUTS[1][size].filter(cloud => cloud.moon)).toHaveLength(1)
  }
})

test('patchy on phones is the top-right cluster with no Moon cloud', () => {
  expect(LAYOUTS[2].desktop).toHaveLength(4)
  expect(LAYOUTS[2].phone).toHaveLength(4)
  expect(LAYOUTS[2].phone.some(cloud => cloud.moon)).toBe(false)
  expect(LAYOUTS[2].desktop.find(cloud => cloud.moon)).toMatchObject({ shape: 'wide', moon: { right: -64, top: -16 }, w: 34 })
})

test('cloudy nights are four huge clouds on desktop and on phones', () => {
  expect(LAYOUTS[3].desktop.map(cloud => cloud.shape)).toEqual(['tall', 'wide', 'long', 'hump'])
  expect(LAYOUTS[3].phone).toHaveLength(4)
})

test('cloudy clouds sit on the hills, and the front ones reach below their lowest edge', () => {
  const lowestEdge = 0.6

  for (const cloud of [...LAYOUTS[3].desktop, ...LAYOUTS[3].phone]) {
    expect(cloud.ground, cloud.shape).toBeGreaterThan(0)
    expect(cloud.y, cloud.shape).toBeUndefined()
    if (cloud.front) expect(cloud.ground, cloud.shape).toBeLessThan(lowestEdge)
  }
})

test('on wide screens the two low patchy clouds tuck behind the hills', () => {
  const low = LAYOUTS[2].desktop.filter(cloud => cloud.tuck !== undefined)
  expect(low.map(cloud => cloud.shape)).toEqual(['long', 'small'])
  for (const cloud of low) expect(cloud.tuck).toBeLessThan(0.6)
})
