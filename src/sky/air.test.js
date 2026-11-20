import { expect, test } from 'vitest'
import { SAMPLE_PLACE } from '../place/placeStorage.js'
import { airUrl, fetchAir } from './air.js'



// TESTS

test('the haze request asks for aerosol optical depth around this week', () => {
  const url = airUrl(SAMPLE_PLACE)

  expect(url).toContain('air-quality-api.open-meteo.com')
  expect(url).toContain('hourly=aerosol_optical_depth')
  expect(url).toContain('past_days=2')
  expect(url).toContain('forecast_days=7')
  expect(url).toContain('timezone=America%2FChicago')
})

test('a failed haze request throws', async () => {
  const fetcher = async () => ({ ok: false, status: 500 })

  await expect(fetchAir(SAMPLE_PLACE, undefined, fetcher)).rejects.toThrow('500')
})
