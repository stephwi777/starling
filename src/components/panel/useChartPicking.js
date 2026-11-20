import { useRef } from 'react'
import useTabRing from './useTabRing.js'



// KEYS

const KEYS = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }



// CHART PICKING

function useChartPicking(count, { onChoose, onStep, onNight, bigStep = 1 }) {
  const dragging = useRef(false)
  const ring = useTabRing()

  function pick(event) {
    const box = event.currentTarget.getBoundingClientRect()
    const index = Math.floor(((event.clientX - box.left) / box.width) * count)

    onChoose(Math.max(0, Math.min(count - 1, index)))
  }

  return {
    ...ring,
    onPointerDown(event) {
      dragging.current = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      pick(event)
    },
    onPointerMove(event) {
      if (dragging.current) pick(event)
    },
    onPointerUp() {
      dragging.current = false
    },
    onPointerCancel() {
      dragging.current = false
    },
    onKeyDown(event) {
      const jumps = {
        Home: () => onChoose(0),
        End: () => onChoose(count - 1),
        PageUp: () => onNight(-1),
        PageDown: () => onNight(1),
      }

      if (KEYS[event.key]) {
        event.preventDefault()
        onStep(KEYS[event.key] * (event.shiftKey ? bigStep : 1))
      } else if (jumps[event.key]) {
        event.preventDefault()
        jumps[event.key]()
      }
    },
  }
}

export default useChartPicking
