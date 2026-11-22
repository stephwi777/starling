import { expect, test } from 'vitest'
import { afterFailure, shownForecast } from './useForecast.js'



// TESTS

test('a failed refresh keeps the forecast already shown for this place', () => {
  const shown = { key: '39.1 -94.58', raw: { hourly: {} }, status: 'ready' }

  expect(afterFailure(shown, '39.1 -94.58')).toBe(shown)
})

test('a failed first request reports the failure', () => {
  expect(afterFailure({ key: '', raw: null, status: 'loading' }, '39.1 -94.58')).toEqual({ key: '39.1 -94.58', raw: null, status: 'failed' })
})

test('a failed request for a new place does not keep the old place’s forecast', () => {
  const old = { key: '51.51 -0.13', raw: { hourly: {} }, status: 'ready' }

  expect(afterFailure(old, '39.1 -94.58')).toEqual({ key: '39.1 -94.58', raw: null, status: 'failed' })
})

test('a forecast another page already fetched shows right away', () => {
  const saved = { raw: { hourly: {} }, refresh: 5 }
  const fresh = { key: '', raw: null, status: 'loading' }

  expect(shownForecast(fresh, saved, '39.1 -94.58')).toEqual({ key: '39.1 -94.58', raw: saved.raw, status: 'ready' })
})

test('without a saved forecast the request status shows', () => {
  expect(shownForecast({ key: '', raw: null, status: 'loading' }, undefined, '39.1 -94.58')).toEqual({ raw: null, status: 'loading' })
})
