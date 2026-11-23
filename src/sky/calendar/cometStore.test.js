import { expect, test } from 'vitest'
import { cometState, loadComets, setCometState, subscribeComets } from './cometStore.js'
import { HARTLEY, LEMMON, SKIFF } from './__fixtures__/cometLines.js'



// HELPERS

const TEXT = `${LEMMON}\n${HARTLEY}\n${SKIFF}\n`
const NOW = new Date('2026-11-23T12:00:00Z')
const HOUR = 60 * 60 * 1000

function memory(saved = null) {
  const items = new Map(saved ? [['starling.comets', JSON.stringify(saved)]] : [])

  return {
    items,
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
  }
}

function fetcher(text = TEXT) {
  const calls = []
  const fetch = async url => {
    calls.push(url)

    return { ok: true, text: async () => text }
  }

  return { calls, fetch }
}

const failing = async () => {
  throw new Error('offline')
}



// LOADING

test('uses a fresh cached copy without fetching', async () => {
  const storage = memory({ text: LEMMON, fetchedAt: NOW.getTime() - 2 * HOUR })
  const network = fetcher()
  const result = await loadComets({ fetcher: network.fetch, storage, now: NOW })

  expect(network.calls).toHaveLength(0)
  expect(result.status).toBe('ready')
  expect(result.comets).toHaveLength(1)
})

test('refreshes a copy older than 24 hours and saves it', async () => {
  const storage = memory({ text: LEMMON, fetchedAt: NOW.getTime() - 25 * HOUR })
  const network = fetcher()
  const result = await loadComets({ fetcher: network.fetch, storage, now: NOW })

  expect(network.calls).toEqual(['https://www.minorplanetcenter.net/iau/MPCORB/CometEls.txt'])
  expect(result.status).toBe('ready')
  expect(result.comets).toHaveLength(3)
  expect(JSON.parse(storage.items.get('starling.comets')).fetchedAt).toBe(NOW.getTime())
})

test('falls back to an old copy when the fetch fails', async () => {
  const storage = memory({ text: `${LEMMON}\n${HARTLEY}`, fetchedAt: NOW.getTime() - 72 * HOUR })
  const result = await loadComets({ fetcher: failing, storage, now: NOW })

  expect(result.status).toBe('ready')
  expect(result.comets).toHaveLength(2)
})

test('treats a bad response like a failed fetch', async () => {
  const result = await loadComets({ fetcher: async () => ({ ok: false, text: async () => '' }), storage: memory(), now: NOW })

  expect(result).toEqual({ comets: [], status: 'failed' })
})

test('reports failure with no data at all', async () => {
  expect(await loadComets({ fetcher: failing, storage: memory(), now: NOW })).toEqual({ comets: [], status: 'failed' })
})

test('still works when storage throws', async () => {
  const storage = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }
  const result = await loadComets({ fetcher: fetcher().fetch, storage, now: NOW })

  expect(result.status).toBe('ready')
  expect(result.comets).toHaveLength(3)
})



test('loads even when reading localStorage itself throws', async () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('SecurityError')
    },
  })

  try {
    const result = await loadComets({ fetcher: fetcher().fetch, now: NOW })

    expect(result.status).toBe('ready')
    expect(result.comets).toHaveLength(3)
  } finally {
    if (saved) Object.defineProperty(globalThis, 'localStorage', saved)
    else delete globalThis.localStorage
  }
})

test('a response with no comets keeps the old copy', async () => {
  const storage = memory({ text: `${LEMMON}\n${HARTLEY}`, fetchedAt: NOW.getTime() - 25 * HOUR })
  const result = await loadComets({ fetcher: fetcher('<html>Maintenance</html>').fetch, storage, now: NOW })

  expect(result.status).toBe('ready')
  expect(result.comets).toHaveLength(2)
  expect(JSON.parse(storage.items.get('starling.comets')).text).toContain('Lemmon')
})

test('a response with no comets and no old copy is a failure', async () => {
  expect(await loadComets({ fetcher: fetcher('').fetch, storage: memory(), now: NOW })).toEqual({ comets: [], status: 'failed' })
})



// STORE

test('the store starts loading and counts each change', () => {
  const before = cometState()
  const heard = []
  const stop = subscribeComets(() => heard.push(cometState().version))

  setCometState({ comets: [], status: 'ready', now: NOW })
  stop()
  setCometState({ comets: [], status: 'failed', now: NOW })

  expect(before.status).toBe('loading')
  expect(heard).toEqual([before.version + 1])
  expect(cometState().version).toBe(before.version + 2)
  expect(cometState().status).toBe('failed')
})
