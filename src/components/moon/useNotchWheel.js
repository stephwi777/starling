import { useEffect, useRef } from 'react'



// SETTINGS

const WHEEL_STEP = 40



// WHEEL

function useNotchWheel(target, onStep) {
  const step = useRef(onStep)
  const sum = useRef(0)

  useEffect(() => {
    step.current = onStep
  })

  useEffect(() => {
    const element = target.current

    const wheel = event => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY

      event.preventDefault()

      if (!delta) return

      sum.current = Math.sign(delta) === Math.sign(sum.current) ? sum.current + delta : delta

      if (Math.abs(sum.current) < WHEEL_STEP && event.deltaMode === 0) return

      sum.current = 0
      step.current(Math.sign(delta))
    }

    element.addEventListener('wheel', wheel, { passive: false })

    return () => element.removeEventListener('wheel', wheel)
  }, [target])
}

export default useNotchWheel
