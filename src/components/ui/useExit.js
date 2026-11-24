import { useEffect, useState } from 'react'



// SETTINGS

const EXIT = 80



// HELPERS

function motionOff() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('still')
}



// EXIT

function useExit(open) {
  const [shown, setShown] = useState(open)

  if (open && !shown) setShown(true)

  useEffect(() => {
    if (open || !shown) return undefined

    const timer = setTimeout(() => setShown(false), motionOff() ? 0 : EXIT)

    return () => clearTimeout(timer)
  }, [open, shown])

  return { shown: open || shown, leaving: !open && shown }
}

export default useExit
