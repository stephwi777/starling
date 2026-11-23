import { useEffect, useState } from 'react'
import { loadFavorites, saveFavorites } from '../../sky/calendar/favoriteStorage.js'



// FAVORITES

function useFavorites() {
  const [favorites, setFavorites] = useState(() => loadFavorites())

  useEffect(() => saveFavorites(favorites), [favorites])

  function toggle(key) {
    setFavorites(current => (current.includes(key) ? current.filter(item => item !== key) : [...current, key]))
  }

  return { favorites, toggle }
}

export default useFavorites
