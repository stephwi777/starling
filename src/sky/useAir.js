import { useEffect, useState } from 'react'
import { fetchAir } from './air.js'



// HOOK

export function useAir(place) {
  const key = `${place.latitude} ${place.longitude}`
  const [air, setAir] = useState({ key: '', raw: null, status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    fetchAir(place, controller.signal)
      .then(raw => setAir({ key, raw, status: 'ready' }))
      .catch(() => {
        if (!controller.signal.aborted) setAir({ key, raw: null, status: 'failed' })
      })

    return () => controller.abort()
  }, [place, key])

  return air.key === key ? air : { raw: null, status: 'loading' }
}
