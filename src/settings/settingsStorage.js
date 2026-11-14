// DEFAULTS

export const DEFAULT_SETTINGS = {
  mode: 'hobbyist',
  gear: 3,
  light: 'normal',
}

const STORAGE_KEY = 'starling.settings'
const VERSION = 1
const MODES = ['hobbyist', 'advanced']
const GEARS = [1, 2, 3]
const LIGHTS = ['normal', 'red']



// HELPERS

function isSettings(settings) {
  return (
    MODES.includes(settings?.mode) &&
    GEARS.includes(settings.gear) &&
    LIGHTS.includes(settings.light)
  )
}



// STORAGE

export function loadSettings(storage) {
  try {
    const saved = JSON.parse((storage ?? globalThis.localStorage).getItem(STORAGE_KEY))

    if (saved?.version === VERSION && isSettings(saved.settings)) {
      return saved.settings
    }
  } catch {
    return DEFAULT_SETTINGS
  }

  return DEFAULT_SETTINGS
}

export function saveSettings(settings, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, settings }))
  } catch {
    return
  }
}
