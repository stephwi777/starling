import { useMemo } from 'react'
import { buildNight, observerFor } from './night.js'
import { trackObject } from './tracks.js'
import { activeShowers } from './meteors.js'
import { bestWindow, verdict } from './best.js'
import { MOON, PLANETS } from './catalog/planets.js'
import { STARS } from './catalog/stars.js'
import { CONSTELLATIONS } from './catalog/constellations.js'
import { DEEP_SKY } from './catalog/deepSky.js'



// HELPERS

function trackAll(list, defaults, night, observer) {
  return list.map(object => trackObject({ ...defaults, ...object }, night, observer))
}

function nowIndexFor(night, now) {
  const index = Math.round((now - night.start) / (night.times[1] - night.times[0]))

  return index >= 0 && index < night.times.length ? index : null
}



// HOOK

export function useNight(place, index, weather, now) {
  const sky = useMemo(() => {
    const night = buildNight(place, index, now)
    const observer = observerFor(place)
    const middle = night.times[Math.floor(night.times.length / 2)]

    return {
      night,
      observer,
      moon: trackObject(MOON, night, observer),
      planets: trackAll(PLANETS, {}, night, observer),
      stars: trackAll(STARS, { kind: 'star', gear: 1, color: '--frost' }, night, observer),
      shapes: trackAll(CONSTELLATIONS, { kind: 'shape', gear: 1, color: '--snow', mag: 2 }, night, observer),
      deep: trackAll(DEEP_SKY, { color: '--snow' }, night, observer),
      showers: trackAll(activeShowers(middle), { mag: 0 }, night, observer),
      nowIndex: nowIndexFor(night, now),
    }
  }, [place, index, now])

  return useMemo(() => {
    const clouds = weather?.clouds ?? null
    const best = bestWindow(sky.night, clouds)

    return {
      ...sky,
      weather,
      clouds,
      best,
      verdict: verdict({ night: sky.night, clouds, best, planets: sky.planets, timeZone: place.timeZone }),
    }
  }, [sky, weather, place.timeZone])
}
