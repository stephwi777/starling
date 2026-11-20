import { expect, test } from 'vitest'
import { clusterMembers, colorWord, figureOf, gearFor, kindOf, literal, raHours, simplify, sizeOf } from './build-catalog.mjs'



// POSITIONS

test('map longitudes become right ascension in hours', () => {
  expect(raHours(0)).toBe(0)
  expect(raHours(90)).toBe(6)
  expect(raHours(-90)).toBe(18)
  expect(raHours(-165)).toBe(13)
})



// COLORS

test('the B–V index names a star’s color', () => {
  expect(colorWord(-0.2)).toBe('blue-white')
  expect(colorWord(0.0)).toBe('white')
  expect(colorWord(0.4)).toBe('yellow-white')
  expect(colorWord(0.65)).toBe('yellow')
  expect(colorWord(1.2)).toBe('orange')
  expect(colorWord(1.8)).toBe('red')
  expect(colorWord('')).toBeNull()
})



// KINDS

test('type codes become kinds and shapes', () => {
  expect(kindOf('s', 'SB(s)m')).toEqual({ kind: 'galaxy', type: 'barred' })
  expect(kindOf('s', 'SA(s)b')).toEqual({ kind: 'galaxy', type: 'spiral' })
  expect(kindOf('s0', 'S0')).toEqual({ kind: 'galaxy', type: 'lenticular' })
  expect(kindOf('e', 'E2')).toEqual({ kind: 'galaxy', type: 'elliptical' })
  expect(kindOf('i', '')).toEqual({ kind: 'galaxy', type: 'irregular' })
  expect(kindOf('oc', '')).toEqual({ kind: 'cluster', type: 'open' })
  expect(kindOf('gc', '')).toEqual({ kind: 'globular', type: null })
  expect(kindOf('pn', '')).toEqual({ kind: 'planetary', type: null })
  expect(kindOf('snr', '')).toEqual({ kind: 'nebula', type: 'remnant' })
  expect(kindOf('dn', '')).toEqual({ kind: 'nebula', type: 'dark' })
  expect(kindOf('rn', '')).toEqual({ kind: 'nebula', type: 'reflection' })
  expect(kindOf('sfr', '')).toEqual({ kind: 'nebula', type: 'emission' })
})



// GEAR

test('brightness sets the gear needed', () => {
  expect(gearFor(3.4, 'galaxy')).toBe(1)
  expect(gearFor(5.7, 'galaxy')).toBe(2)
  expect(gearFor(9.6, 'galaxy')).toBe(3)
  expect(gearFor(null, 'nebula', 'dark')).toBe(1)
  expect(gearFor(null, 'nebula', 'emission')).toBe(3)
})



// SIZES

test('sizes become arcminutes', () => {
  expect(sizeOf('65x60')).toEqual([65, 60])
  expect(sizeOf('110')).toEqual([110, 110])
  expect(sizeOf('')).toBeNull()
})



// OUTPUT

test('values are written as tidy JavaScript', () => {
  expect(literal({ id: 'Barnard’s Galaxy', ra: 1.5, lines: [[1, 2]], name: null, quote: "it's" })).toBe("{ id: 'Barnard’s Galaxy', ra: 1.5, lines: [[1, 2]], name: null, quote: 'it\\'s' }")
})



// FIGURES

test('trimming keeps bright stars and drops in-between faint ones', () => {
  const line = [[-10, 0, 2], [-5, 0.1, 4.5], [0, 0, 2.5], [5, 0.1, 4.6], [10, 0, 3.5]]

  expect(simplify(line).map(point => point[2])).toEqual([2, 2.5, 3.5])
})

test('a closed loop keeps its corners', () => {
  const square = [[-5, -5, 3.5], [5, -5, 3.5], [5, 5, 3.5], [-5, 5, 3.5], [-5, -5, 3.5]]

  expect(simplify(square)).toHaveLength(5)
})

test('figures fit inside the icon', () => {
  const figure = figureOf([[[5.92, 7.41], [5.42, 6.35], [5.53, -0.3]]], [{ ra: 5.92, dec: 7.41, mag: 0.5 }, { ra: 5.42, dec: 6.35, mag: 1.6 }, { ra: 5.53, dec: -0.3, mag: 2.2 }])
  const all = figure.stars.flatMap(([x, y]) => [x, y])

  expect(Math.max(...all.map(Math.abs))).toBeLessThanOrEqual(10)
  expect(figure.stars.map(star => star[2])).toEqual([0.5, 1.6, 2.2])
})

test('the Hyades use their V stars with Aldebaran first', () => {
  const members = clusterMembers({ id: 'C41', kind: 'cluster', type: 'open', ra: 4.45, dec: 15.87, size: [330, 330] }, [])

  expect(members).toHaveLength(8)
  expect(members[0]).toEqual([expect.any(Number), expect.any(Number), 0.87, 'orange'])
})
