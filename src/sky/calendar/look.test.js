import { expect, test } from 'vitest'
import { look } from './skyTools.js'



// TESTS

test('look is short: height, then direction', () => {
  expect(look({ alt: 60, az: 180 })).toBe('High south')
  expect(look({ alt: 40, az: 135 })).toBe('Midway up southeast')
  expect(look({ alt: 15, az: 90 })).toBe('Low east')
})

test('near the zenith and near the horizon read naturally', () => {
  expect(look({ alt: 80, az: 10 })).toBe('Nearly overhead')
  expect(look({ alt: 5, az: 270 })).toBe('Very low west')
})
