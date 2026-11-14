import { useEffect, useState } from 'react'
import { SettingsContext } from './useSettings.js'
import { loadSettings, saveSettings } from './settingsStorage.js'



// PROVIDER

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => loadSettings())

  useEffect(() => {
    document.documentElement.dataset.light = settings.light
    saveSettings(settings)
  }, [settings])

  const change = key => value => setSettings(current => ({ ...current, [key]: value }))

  const value = {
    ...settings,
    setMode: change('mode'),
    setGear: change('gear'),
    setLight: change('light'),
  }

  return <SettingsContext value={value}>{children}</SettingsContext>
}
