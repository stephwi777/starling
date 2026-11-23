import { useEffect, useSyncExternalStore } from 'react'
import { SAMPLE_COMETS } from './cometSample.js'
import { cometState, loadComets, setCometState, subscribeComets } from './cometStore.js'



// LOADING ONCE

let started = false

function wantsSample() {
  return import.meta.env.DEV && new URLSearchParams(globalThis.location?.search).get('comets') === 'sample'
}

function start() {
  if (started) return

  started = true

  if (wantsSample()) {
    setCometState({ comets: SAMPLE_COMETS, status: 'ready', now: new Date() })
    return
  }

  loadComets()
    .then(({ comets, status }) => setCometState({ comets, status, now: new Date() }))
    .catch(() => setCometState({ comets: [], status: 'failed', now: new Date() }))
}



// HOOK

function useComets() {
  const state = useSyncExternalStore(subscribeComets, cometState)

  useEffect(start, [])

  return state
}

export default useComets
