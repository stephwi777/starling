import { useEffect, useState } from 'react'
import { fetchWeather } from './weather.js'



// HOOK

export function useForecast(place, refresh = 0) {
  const key = `${place.latitude} ${place.longitude}`
  const [forecast, setForecast] = useState({ key: '', raw: null, status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    fetchWeather(place, controller.signal)
      .then(raw => setForecast({ key, raw, status: 'ready' }))
      .catch(() => {
        if (!controller.signal.aborted) setForecast({ key, raw: null, status: 'failed' })
      })

    return () => controller.abort()
  }, [place, key, refresh])

  return forecast.key === key ? forecast : { raw: null, status: 'loading' }
}
