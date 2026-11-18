import { expect, test } from 'vitest'
import { NORTH, SOUTH } from '../../sky/monthConstellation.js'
import { SHAPES, shapePath } from './constellationShapes.js'



// TESTS

test('every month has a drawn shape', () => {
  new Set([...NORTH, ...SOUTH]).forEach(name => expect(SHAPES[name], name).toBeDefined())
})

test('every shape fits inside the icon frame', () => {
  Object.entries(SHAPES).forEach(([name, shape]) => {
    shape.stars.forEach(([x, y]) => expect(Math.abs(x) <= 11 && Math.abs(y) <= 11, name).toBe(true))
  })
})

test('every line joins stars that exist', () => {
  Object.entries(SHAPES).forEach(([name, shape]) => {
    shape.lines.flat().forEach(i => expect(shape.stars[i], name).toBeDefined())
    expect(shape.stars[shape.bright], name).toBeDefined()
  })
})

test('Cassiopeia keeps its original W', () => {
  expect(shapePath(SHAPES.Cassiopeia)).toBe('M -11 -4 L -5 6 L 0 -2 L 5 6 L 11 -5')
  expect(SHAPES.Cassiopeia.bright).toBe(1)
})
