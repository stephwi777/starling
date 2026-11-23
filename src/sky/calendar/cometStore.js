import { parseComets } from './cometOrbit.js'



// SETTINGS

const SOURCE = 'https://www.minorplanetcenter.net/iau/MPCORB/CometEls.txt'
const KEY = 'starling.comets'
const FRESH = 24 * 60 * 60 * 1000



// CACHE

function readCache(storage) {
  try {
    const saved = JSON.parse((storage ?? globalThis.localStorage).getItem(KEY))

    return saved && typeof saved.text === 'string' && Number.isFinite(saved.fetchedAt) ? saved : null
  } catch {
    return null
  }
}

function writeCache(storage, text, now) {
  try {
    (storage ?? globalThis.localStorage).setItem(KEY, JSON.stringify({ text, fetchedAt: now.getTime() }))
  } catch {
    return
  }
}



// LOADING

export async function loadComets({ fetcher = globalThis.fetch, storage, now = new Date() } = {}) {
  const cached = readCache(storage)

  if (cached && now.getTime() - cached.fetchedAt < FRESH) return { comets: parseComets(cached.text), status: 'ready' }

  try {
    const response = await fetcher(SOURCE)

    if (!response.ok) throw new Error(`Comet list request failed with ${response.status}`)

    const text = await response.text()
    const comets = parseComets(text)

    if (!comets.length) throw new Error('Comet list came back empty')

    writeCache(storage, text, now)

    return { comets, status: 'ready' }
  } catch {
    return cached ? { comets: parseComets(cached.text), status: 'ready' } : { comets: [], status: 'failed' }
  }
}



// STORE

let state = { comets: [], status: 'loading', version: 0, now: new Date() }
const listeners = new Set()

export function cometState() {
  return state
}

export function setCometState(next) {
  state = { ...state, ...next, version: state.version + 1 }
  listeners.forEach(listener => listener())
}

export function subscribeComets(listener) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}
