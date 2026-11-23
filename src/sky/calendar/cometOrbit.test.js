import { expect, test } from 'vitest'
import { cometMagnitude, cometPlace, parseComets } from './cometOrbit.js'
import { ASTEROID, BIELA, FRAGMENT, HARTLEY, LEMMON, SKIFF, SOHO } from './__fixtures__/cometLines.js'



// PARSING

test('reads a non-periodic comet', () => {
  const [lemmon] = parseComets(LEMMON)

  expect(lemmon.name).toBe('Lemmon')
  expect(lemmon.id).toBe('CK25A060')
  expect(lemmon.designation).toBe('C/2025 A6')
  expect(lemmon.q).toBeCloseTo(0.529802, 6)
  expect(lemmon.e).toBeCloseTo(0.995603, 6)
  expect(lemmon.H).toBe(8.6)
  expect(lemmon.G).toBe(4)
  expect(lemmon.perihelion.toISOString().slice(0, 10)).toBe('2025-11-08')
})

test('reads a periodic comet name', () => {
  const [hartley] = parseComets(HARTLEY)

  expect(hartley.name).toBe('Hartley-IRAS')
  expect(hartley.id).toBe('0161P')
})

test('names comet fragments after the comet', () => {
  expect(parseComets(FRAGMENT)[0].name).toBe('Schwassmann-Wachmann')
})

test('skips long-gone comets and asteroids', () => {
  expect(parseComets(`${BIELA}\n${ASTEROID}\n${LEMMON}`).map(comet => comet.name)).toEqual(['Lemmon'])
})

test('skips lines without a brightness', () => {
  expect(parseComets(`${LEMMON}\n${LEMMON.slice(0, 91)}      ${LEMMON.slice(97)}\n`)).toHaveLength(1)
})



// POSITION

test('matches JPL Horizons for Comet Lemmon on 2025-10-21 00:00 UT', () => {
  const [lemmon] = parseComets(LEMMON)
  const { vector, r, delta } = cometPlace(lemmon, new Date('2025-10-21T00:00:00Z'))
  const ra = (Math.atan2(vector.y, vector.x) * 180 / Math.PI + 360) % 360
  const dec = Math.asin(vector.z / delta) * 180 / Math.PI

  expect(Math.abs(ra - 214.37623) * Math.cos(dec * Math.PI / 180)).toBeLessThan(0.5)
  expect(Math.abs(dec - 30.43394)).toBeLessThan(0.5)
  expect(r).toBeCloseTo(0.6804, 2)
  expect(delta).toBeCloseTo(0.5962, 2)
})

test('works for a hyperbolic orbit', () => {
  const [skiff] = parseComets(SKIFF)
  const { r, delta } = cometPlace(skiff, new Date('2026-11-23T00:00:00Z'))

  expect(Number.isFinite(r) && Number.isFinite(delta)).toBe(true)
})

test('works for an orbit right at parabolic', () => {
  const [lemmon] = parseComets(LEMMON)
  const { r, delta } = cometPlace({ ...lemmon, e: 1 }, new Date('2025-10-21T00:00:00Z'))

  expect(Number.isFinite(r) && Number.isFinite(delta)).toBe(true)
  expect(r).toBeGreaterThan(lemmon.q)
})



test('near-parabolic orbits stay between perihelion and aphelion', () => {
  const [lemmon] = parseComets(LEMMON)
  const [soho] = parseComets(SOHO)
  const cases = [
    [{ ...lemmon, q: 0.01, e: 1.005 }, 365],
    [{ ...lemmon, q: 0.01, e: 1.005 }, -365],
    [{ ...lemmon, q: 0.005, e: 0.981 }, 30],
    [{ ...lemmon, q: 0.01, e: 0.995 }, 730],
    [{ ...lemmon, q: 0.005, e: 1.005 }, 365],
    [soho, -200],
    [soho, 120],
  ]

  cases.forEach(([comet, days]) => {
    const { r } = cometPlace(comet, new Date(comet.perihelion.getTime() + days * 86400000))
    const far = comet.e < 1 ? comet.q * (1 + comet.e) / (1 - comet.e) : Infinity

    expect(Number.isFinite(r)).toBe(true)
    expect(r).toBeGreaterThanOrEqual(comet.q * 0.999)
    expect(r).toBeLessThanOrEqual(far * 1.001)
  })
})



// BRIGHTNESS

test('predicted magnitude follows H + 5 log Δ + 2.5 G log r', () => {
  const [lemmon] = parseComets(LEMMON)

  expect(cometMagnitude(lemmon, 1, 1)).toBeCloseTo(8.6, 6)
  expect(cometMagnitude(lemmon, 0.5, 2)).toBeCloseTo(8.6 + 5 * Math.log10(2) + 10 * Math.log10(0.5), 6)
})
