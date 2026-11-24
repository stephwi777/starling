import { useEffect, useState } from 'react'
import { DEFAULT_KINDS, KINDS } from '../../sky/calendar/kinds.js'
import { loadCalendar, saveCalendar } from '../../sky/calendar/calendarStorage.js'



// CALENDAR SETTINGS

function useCalendarSettings() {
  const [calendar, setCalendar] = useState(() => loadCalendar())

  useEffect(() => saveCalendar(calendar), [calendar])

  function toggleKind(id) {
    setCalendar(current => ({
      ...current,
      kinds: current.kinds.includes(id) ? current.kinds.filter(kind => kind !== id) : [...current.kinds, id],
    }))
  }

  function setGroup(group, on) {
    const ids = KINDS.filter(kind => kind.group === group).map(kind => kind.id)

    setCalendar(current => ({
      ...current,
      kinds: on ? [...new Set([...current.kinds, ...ids])] : current.kinds.filter(kind => !ids.includes(kind)),
    }))
  }

  return {
    ...calendar,
    toggleKind,
    setGroup,
    suggest: () => setCalendar(current => ({ ...current, kinds: DEFAULT_KINDS })),
    setWorld: world => setCalendar(current => ({ ...current, world })),
    setFavoritesOnly: favoritesOnly => setCalendar(current => ({ ...current, favoritesOnly })),
  }
}

export default useCalendarSettings
