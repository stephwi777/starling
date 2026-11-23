// SETTINGS

const STORAGE_KEY = 'starling.favorites'
const VERSION = 1



// LOAD

export function loadFavorites(storage) {
  try {
    const saved = JSON.parse((storage ?? globalThis.localStorage).getItem(STORAGE_KEY))

    if (saved?.version !== VERSION || !Array.isArray(saved.keys)) return []

    return saved.keys.filter(key => typeof key === 'string')
  } catch {
    return []
  }
}



// SAVE

export function saveFavorites(keys, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, keys }))
  } catch {
    return
  }
}
