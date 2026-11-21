import { useMemo } from 'react'
import { buildNight, observerFor } from './night.js'
import { trackObject } from './tracks.js'
import { activeShowers } from './meteors.js'
import { bestWindow, shortVerdict, verdict } from './best.js'
import { nightWeather } from './weather.js'
import { MOON, PLANETS } from './catalog/planets.js'
import { SKY_DEEP, SKY_SHAPES, SKY_STARS } from './catalog/sky.js'
import { fixedTracker } from './fastSky.js'



// HELPERS

function trackAll(list, defaults, night, observer) {
  return list.map(object => trackObject({ ...defaults, ...object }, night, observer))
}

function trackFixed(list, defaults, fixed) {
  return list.map(object => fixed({ ...defaults, ...object }))
}

function nowIndexFor(night, now) {
  const index = Math.round((now - night.start) / (night.times[1] - night.times[0]))

  return index >= 0 && index < night.times.length ? index : null
}



// SKY

export function buildSky(place, index, now) {
  const night = buildNight(place, index, now)
  const observer = observerFor(place)
  const middle = night.times[Math.floor(night.times.length / 2)]
  const fixed = fixedTracker(night, observer)

  return {
    night,
    observer,
    moon: trackObject(MOON, night, observer),
    planets: trackAll(PLANETS, {}, night, observer),
    stars: trackFixed(SKY_STARS, { gear: 1, color: '--frost' }, fixed),
    shapes: trackFixed(SKY_SHAPES, { kind: 'shape', gear: 1, color: '--snow' }, fixed),
    deep: trackFixed(SKY_DEEP, { color: '--snow' }, fixed),
    showers: trackAll(activeShowers(middle), { mag: 0 }, night, observer),
    nowIndex: nowIndexFor(night, now),
  }
}



// HOOK

export function useNight(place, index, forecast, now) {
  const sky = useMemo(() => buildSky(place, index, now), [place, index, now])

  return useMemo(() => {
    const weather = forecast ? nightWeather(forecast, sky.night) : null
    const clouds = weather?.clouds ?? null
    const best = bestWindow(sky.night, clouds)

    return {
      ...sky,
      weather,
      clouds,
      temps: weather?.temps ?? null,
      falls: weather?.falls ?? null,
      best,
      verdict: verdict({ night: sky.night, clouds, best, planets: sky.planets, timeZone: place.timeZone }),
      summary: shortVerdict({ night: sky.night, clouds, best, timeZone: place.timeZone }),
    }
  }, [sky, forecast, place.timeZone])
}
