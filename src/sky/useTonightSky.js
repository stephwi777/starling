import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { skyConditions, skyMoment } from './skyMoment.js'
import { skyLook } from './skyLook.js'
import { PREVIEWS } from './skyPreviews.js'



// HOOK

export function useTonightSky({ sky, place, now }) {
  const { search } = useLocation()
  const preview = import.meta.env.DEV ? PREVIEWS[new URLSearchParams(search).get('sky')] : null
  const south = place.latitude < 0

  return useMemo(() => {
    if (preview) return skyLook({ ...preview, south })

    const moment = skyMoment(sky.night, now)

    return skyLook(skyConditions({ night: sky.night, moment, observer: sky.observer, clouds: sky.clouds, falls: sky.falls, south }))
  }, [preview, sky, south, now])
}
