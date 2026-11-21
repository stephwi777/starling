import { useMemo } from 'react'
import { buildNight } from './night.js'
import { bestWindow, shortVerdict } from './best.js'
import { nightWeather } from './weather.js'



// TONIGHT SUMMARY

export function useSummary(place, forecast, now) {
  const night = useMemo(() => buildNight(place, 0, now), [place, now])

  return useMemo(() => {
    const weather = forecast ? nightWeather(forecast, night) : null
    const clouds = weather?.clouds ?? null
    const best = bestWindow(night, clouds)

    return { night, weather, summary: shortVerdict({ night, clouds, best, timeZone: place.timeZone }) }
  }, [night, forecast, place.timeZone])
}
