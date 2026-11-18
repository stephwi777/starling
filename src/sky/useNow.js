import { useEffect, useState } from 'react'



// HOOK

export function useNow(every = 10 * 60 * 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const wake = () => {
      if (!document.hidden) tick()
    }

    const timer = setInterval(tick, every)
    document.addEventListener('visibilitychange', wake)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [every])

  return now
}
