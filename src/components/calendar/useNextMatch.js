import { useEffect, useEffectEvent, useState } from 'react'
import { matchSearch, runSearch, searchStart } from '../../sky/calendar/nextMatch.js'



// SETTINGS

const IDLE = { status: 'idle', match: null }



// NEXT MATCH

function useNextMatch({ place, query, shown, current, today, filters, comets }) {
  const words = query.trim()
  const key = JSON.stringify([words, shown, current, today, place.latitude, place.longitude, place.timeZone, filters.kinds, filters.world, filters.favorites, filters.favoritesOnly, comets.version])
  const [result, setResult] = useState({ key: '', ...IDLE })
  const begin = useEffectEvent(() => matchSearch(place, searchStart(shown, current), { ...filters, keep: null }, comets, undefined, today))

  useEffect(() => {
    if (!words) return undefined

    return runSearch(begin(), found => setResult({ key, ...found }))
  }, [key, words])

  return words && result.key === key ? result : IDLE
}

export default useNextMatch
