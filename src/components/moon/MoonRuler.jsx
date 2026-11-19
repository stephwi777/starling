import { useEffect, useMemo, useRef, useState } from 'react'
import { rulerLabel } from '../../sky/moonNights.js'
import { clock } from '../../sky/words.js'



// SETTINGS

const GAP = 14
const WHEEL_STEP = 40
const NOTCH_GLIDE = 140
const NIGHT_GLIDE = 250



// MOTION

function motionOff() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('still')
}



// WHEEL

export function useNotchWheel(target, onStep) {
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



// TICKS

function Ticks({ notches, nights, tonightNight, timeZone }) {
  return (
    <>
      {notches.map((notch, i) => {
        const tall = notch.kind === 'noon' ? 30 : notch.kind === 'midnight' ? 22 : 16
        const opacity = notch.kind === 'noon' ? 0.9 : notch.kind === 'midnight' ? 0.7 : 0.45

        return <rect key={i} x={i * GAP - 1.5} y={(30 - tall) / 2 + 2} width="3" height={tall} rx="1.5" fill={notch.kind === 'noon' ? 'var(--frost)' : 'var(--snow-shade)'} opacity={opacity} />
      })}

      {notches.map((notch, i) => notch.kind === 'midnight' && (
        <text key={`label-${i}`} x={i * GAP} y="54" textAnchor="middle" className={notch.night === tonightNight ? 'tonight' : undefined}>
          {rulerLabel(nights[notch.night], notch.night === tonightNight, timeZone)}
        </text>
      ))}
    </>
  )
}



// RULER

function MoonRuler({ ref, notches, nights, tonightNight, index, glide, timeZone, valueText, onMove, onStep, onNight, onHome }) {
  const own = useRef(null)
  const ruler = ref ?? own
  const shown = useRef(index)
  const [position, setPosition] = useState(index)
  const [drag, setDrag] = useState(null)
  const last = notches.length - 1
  const ticks = useMemo(() => <Ticks notches={notches} nights={nights} tonightNight={tonightNight} timeZone={timeZone} />, [notches, nights, tonightNight, timeZone])

  useNotchWheel(ruler, onStep)

  useEffect(() => {
    if (drag) return

    const from = shown.current

    if (!glide || from === index || motionOff()) {
      shown.current = index
      setPosition(index)
      return
    }

    const duration = Math.abs(index - from) > 1.5 ? NIGHT_GLIDE : NOTCH_GLIDE
    const began = performance.now()
    let frame

    const step = now => {
      const k = Math.min(1, (now - began) / duration)

      shown.current = from + (index - from) * (1 - (1 - k) ** 3)
      setPosition(shown.current)

      if (k < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame)
  }, [index, glide, drag])

  function keyDown(event) {
    const direction = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key]
    const week = { PageUp: 7, PageDown: -7 }[event.key]

    if (week) {
      event.preventDefault()
      onNight(week)
    }

    if (event.key === 'Home') {
      event.preventDefault()
      onHome()
    }

    if (!direction) return

    event.preventDefault()

    if (event.shiftKey) onStep(direction)
    else onNight(direction)
  }

  function pointerDown(event) {
    ruler.current.setPointerCapture(event.pointerId)
    setDrag({ x: event.clientX, from: shown.current })
  }

  function pointerMove(event) {
    if (!drag) return

    const next = Math.max(0, Math.min(last, drag.from - (event.clientX - drag.x) / GAP))

    shown.current = next
    setPosition(next)

    if (Math.round(next) !== index) onMove(Math.round(next), false)
  }

  function pointerUp() {
    if (!drag) return

    setDrag(null)
    onMove(Math.round(shown.current), true)
  }

  return (
    <div
      ref={ruler}
      className={`moon-ruler${drag ? ' dragging' : ''}`}
      tabIndex={0}
      role="slider"
      aria-label="Choose a night and time"
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={index}
      aria-valuetext={valueText}
      onKeyDown={keyDown}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
    >
      <div className="moon-pointer" aria-hidden="true">
        <span>{clock(notches[Math.round(position)].time, timeZone)}</span>
        <i />
      </div>

      <div className="moon-track" aria-hidden="true">
        <svg className="moon-strip" width={notches.length * GAP} height="62" style={{ transform: `translateX(${-position * GAP}px)` }}>
          {ticks}
        </svg>
      </div>
    </div>
  )
}

export default MoonRuler
