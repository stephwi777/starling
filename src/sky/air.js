// REQUEST

export function airUrl(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    hourly: 'aerosol_optical_depth',
    past_days: 2,
    forecast_days: 7,
    timezone: place.timeZone,
  })

  return `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`
}

export async function fetchAir(place, signal, fetcher = fetch) {
  const response = await fetcher(airUrl(place), { signal })

  if (!response.ok) throw new Error(`Haze request failed with ${response.status}`)

  return response.json()
}
