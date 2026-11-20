import { useState } from 'react'



// TAB RING

function useTabRing() {
  const [ring, setRing] = useState(true)

  return {
    'data-ring': ring ? undefined : 'off',
    onFocus(event) {
      if (event.target === event.currentTarget) setRing(event.target.matches(':focus-visible'))
    },
  }
}

export default useTabRing
