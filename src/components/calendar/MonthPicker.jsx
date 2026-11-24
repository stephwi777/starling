import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Chevron from '../ui/Chevron.jsx'
import { clampYear, leftPicker, pickerRange, refocusTitle } from './monthPicker.js'



// SETTINGS

const NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MOVES = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }



// MONTH PICKER

function MonthPicker({ year, month, current, anchor, leaving = false, onPick, onClose }) {
  const range = pickerRange(current.year)
  const [shownYear, setShownYear] = useState(clampYear(year, range))
  const [turn, setTurn] = useState(null)
  const [spot, setSpot] = useState(null)
  const panel = useRef(null)

  useLayoutEffect(() => {
    const head = panel.current.offsetParent.getBoundingClientRect()
    const title = anchor.current.getBoundingClientRect()
    const width = panel.current.offsetWidth

    setSpot({ top: title.bottom - head.top + 8, left: Math.max(0, Math.min(title.left - head.left, head.width - width)) })
  }, [anchor])

  const placed = Boolean(spot)

  useEffect(() => {
    if (!placed) return

    const chosen = panel.current.querySelector('[aria-pressed="true"]') ?? panel.current.querySelector('.picker-month')

    chosen.focus({ preventScroll: true })
  }, [placed])

  useEffect(() => {
    const outside = pointer => {
      if (panel.current.contains(pointer.target) || anchor.current.contains(pointer.target)) return

      onClose()
      if (refocusTitle(pointer.target)) setTimeout(() => anchor.current?.focus({ preventScroll: true }), 0)
    }

    document.addEventListener('pointerdown', outside)

    return () => document.removeEventListener('pointerdown', outside)
  }, [anchor, onClose])

  function turnYear(delta) {
    setShownYear(now => clampYear(now + delta, range))
    setTurn(delta > 0 ? 'next' : 'prev')
  }

  function keyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      anchor.current.focus()
      return
    }

    const months = [...panel.current.querySelectorAll('.picker-month')]
    const index = months.indexOf(document.activeElement)

    if (index < 0 || !(event.key in MOVES)) return

    event.preventDefault()
    months[Math.min(11, Math.max(0, index + MOVES[event.key]))].focus()
  }

  return (
    <div ref={panel} className={leaving ? 'picker leaving' : 'picker'} role="dialog" aria-label="Choose a month" style={spot ?? { visibility: 'hidden' }} onKeyDown={keyDown} onBlur={event => leftPicker(event.relatedTarget, panel.current, anchor.current) && onClose()}>
      <div className="picker-year">
        <button type="button" className="soft-button" aria-label="Previous year" aria-disabled={shownYear <= range.from} onClick={() => turnYear(-1)}><Chevron left /></button>
        <strong key={shownYear} className={turn ? `year-${turn}` : undefined} aria-live="polite">{shownYear}</strong>
        <button type="button" className="soft-button" aria-label="Next year" aria-disabled={shownYear >= range.to} onClick={() => turnYear(1)}><Chevron /></button>
      </div>

      <div key={shownYear} className={turn ? `picker-months year-${turn}` : 'picker-months'}>
        {NAMES.map((name, i) => {
          const chosen = shownYear === year && i + 1 === month
          const now = shownYear === current.year && i + 1 === current.month

          return (
            <button
              key={name}
              type="button"
              className={now ? 'picker-month this-month' : 'picker-month'}
              aria-pressed={chosen}
              aria-label={`${new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long' }).format(Date.UTC(2000, i, 1))} ${shownYear}`}
              onClick={() => onPick(shownYear, i + 1)}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MonthPicker
