import { createContext, useContext } from 'react'



// CONTEXT

export const SettingsContext = createContext(null)



// HOOK

export function useSettings() {
  const value = useContext(SettingsContext)

  if (!value) throw new Error('useSettings must be used inside SettingsProvider')

  return value
}
