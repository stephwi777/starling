import { expect, test } from 'vitest'
import { LAYOUTS } from './cloudLayouts.js'
import { SHAPES } from './cloudShapes.js'



// TESTS

test('every cloud uses one of the five shapes and a known shade', () => {
  const clouds = [LAYOUTS[1].desktop, LAYOUTS[1].phone, LAYOUTS[2].desktop, LAYOUTS[2].phone, LAYOUTS[3].canvas].flat()

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

test('cloudy nights are four huge clouds', () => {
  expect(LAYOUTS[3].canvas.map(cloud => cloud.shape)).toEqual(['tall', 'wide', 'long', 'hump'])
})
