import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GROUPS } from '../../sky/calendar/kinds.js'
import { popoverPlace } from '../panel/popoverPlace.js'
import EventIcon from './EventIcon.jsx'
import '../panel/Popover.css'



// SETTINGS

const LEAVE = 200
const WIDTH = 352
const HEIGHT = 640
const PHONE = '(max-width: 700px)'



// HELPERS

function motionOff() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('still')
}

export function eventDate(event) {
  const [year, month, day] = event.day.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(Date.UTC(year, month - 1, day))
}



// EVENT CARD

function EventCard({ event, anchor, placeName, south, onClose }) {
  const card = useRef(null)
  const scroller = useRef(null)
  const closeButton = useRef(null)
  const closing = useRef(false)
  const [spot, setSpot] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const group = GROUPS.find(item => item.id === event.group)

  function close() {
    if (closing.current) return

    closing.current = true
    setLeaving(true)
    setTimeout(onClose, motionOff() ? 0 : LEAVE)
  }

  useLayoutEffect(() => {
    let frame

    const place = () => {
      if (matchMedia(PHONE).matches || !anchor.isConnected) return setSpot({ sheet: true })

      const size = { width: Math.min(WIDTH, window.innerWidth - 32), height: Math.min(HEIGHT, scroller.current.scrollHeight) }
      const found = popoverPlace(anchor.getBoundingClientRect(), size, { width: window.innerWidth, height: window.innerHeight })

      setSpot(found.fits ? found : { sheet: true })
    }

    const later = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }

    document.documentElement.style.setProperty('--scrollbar-gap', `${window.innerWidth - document.documentElement.clientWidth}px`)
    document.documentElement.classList.add('popover-open')
    card.current.showPopover?.()
    place()
    window.addEventListener('resize', later)

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('popover-open')
      window.removeEventListener('resize', later)
      if (anchor.isConnected) anchor.focus({ preventScroll: true })
    }
  }, [anchor])

  const placed = Boolean(spot)

  useEffect(() => {
    if (placed) closeButton.current.focus({ preventScroll: true })
  }, [placed])

  useEffect(() => {
    const outside = pointer => {
      if (!card.current.contains(pointer.target) && !anchor.contains(pointer.target)) close()
    }

    const escape = key => {
      if (key.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)

    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  })

  return (
    <div
      ref={card}
      popover="manual"
      role="dialog"
      aria-labelledby="event-title"
      className={['popover', 'event-card', spot?.sheet ? 'sheet' : spot?.side, spot ? '' : 'unplaced', leaving ? 'leaving' : ''].filter(Boolean).join(' ')}
      style={spot && !spot.sheet ? { left: spot.left, top: spot.top, '--arrow': `${spot.arrow}px` } : undefined}
      data-group={event.group}
    >
      <span className="popover-arrow" aria-hidden="true" />

      <div className="popover-scroll" ref={scroller}>
        <div className="event-card-head">
          <span className="event-card-icon"><EventIcon icon={event.icon} south={south} /></span>

          <div>
            <p className="event-card-group">{group?.name}</p>
            <h2 id="event-title">{event.name}</h2>
          </div>

          <button ref={closeButton} type="button" className="popover-close" aria-label="Close" onClick={close}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </button>
        </div>

        <p className="event-card-when">{eventDate(event)} · {event.time}</p>

        {!event.here && (
          <p className="event-card-away"><strong>Not visible from {placeName}.</strong> {event.where}</p>
        )}

        <p className="event-card-note">{event.note}</p>

        {event.rows.length > 0 && (
          <dl className="popover-rows">
            {event.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        )}
      </div>
    </div>
  )
}

export default EventCard
