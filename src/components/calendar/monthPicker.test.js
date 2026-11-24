import { expect, test } from 'vitest'
import { clampYear, leftPicker, refocusTitle, pickerRange } from './monthPicker.js'



// TESTS

test('the picker covers last year through ten years ahead', () => {
  expect(pickerRange(2026)).toEqual({ from: 2025, to: 2036 })
})

test('years outside the range snap to its ends', () => {
  expect(clampYear(2040, pickerRange(2026))).toBe(2036)
  expect(clampYear(2020, pickerRange(2026))).toBe(2025)
  expect(clampYear(2030, pickerRange(2026))).toBe(2030)
})

test('clicking blank space outside gives focus back to the title', () => {
  expect(refocusTitle({ closest: () => null })).toBe(true)
  expect(refocusTitle({ closest: () => ({}) })).toBe(false)
  expect(refocusTitle(null)).toBe(true)
})

test('tabbing away from the picker and its title closes it', () => {
  const panel = { contains: node => node === 'month' }
  const title = { contains: node => node === 'title' }

  expect(leftPicker('search', panel, title)).toBe(true)
  expect(leftPicker(null, panel, title)).toBe(true)
  expect(leftPicker('month', panel, title)).toBe(false)
  expect(leftPicker('title', panel, title)).toBe(false)
})
