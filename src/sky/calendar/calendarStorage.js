import { DEFAULT_KINDS, KINDS } from './kinds.js'



// SETTINGS

const STORAGE_KEY = 'starling.calendar'
const VERSION = 1
const IDS = KINDS.map(kind => kind.id)

export const DEFAULT_CALENDAR = { kinds: DEFAULT_KINDS, world: false, favoritesOnly: false }



// LOAD

export function loadCalendar(storage) {
  try {
    const saved = JSON.parse((storage ?? globalThis.localStorage).getItem(STORAGE_KEY))

    if (saved?.version !== VERSION || !Array.isArray(saved.kinds) || !Array.isArray(saved.known)) return DEFAULT_CALENDAR

    const chosen = saved.kinds.filter(id => IDS.includes(id))
    const added = DEFAULT_KINDS.filter(id => !saved.known.includes(id))

    return { kinds: [...chosen, ...added], world: saved.world === true, favoritesOnly: saved.favoritesOnly === true }
  } catch {
    return DEFAULT_CALENDAR
  }
}



// SAVE

export function saveCalendar(calendar, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, known: IDS, ...calendar }))
  } catch {
    return
  }
}
