import { useEffect, useState } from 'react'



// MEDIA QUERY

function useMedia(query) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches)

  useEffect(() => {
    const list = matchMedia(query)
    const change = () => setMatches(list.matches)

    change()
    list.addEventListener('change', change)

    return () => list.removeEventListener('change', change)
  }, [query])

  return matches
}

export default useMedia
