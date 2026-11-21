import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { GROUPS } from '../../sky/calendar/kinds.js'
import { calendarFile, fileName } from '../../sky/calendar/ics.js'
import { popoverPlace } from '../panel/popoverPlace.js'
import { eventDate } from './dates.js'
import { download, eventLink } from './download.js'
import EventIcon from './EventIcon.jsx'
import '../panel/Popover.css'



// SETTINGS

const LEAVE = 200
const WIDTH = 352
const HEIGHT = 640
const PHONE = '(max-width: 700px)'
const WEEK = 7
const DAY = 24 * 60 * 60 * 1000
const COPIED = 2000



// HELPERS

function motionOff() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('still')
}

function daysAhead(event, today) {
  const at = key => Date.UTC(...key.split('-').map((part, i) => Number(part) - (i === 1 ? 1 : 0)))

  return Math.round((at(event.day) - at(today)) / DAY)
}




// EVENT CARD

function EventCard({ event, anchor, place, today, south, onClose }) {
  const card = useRef(null)
  const scroller = useRef(null)
  const closeButton = useRef(null)
  const closing = useRef(false)
  const [spot, setSpot] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const group = GROUPS.find(item => item.id === event.group)
  const ahead = daysAhead(event, today)

  function addToCalendar() {
    download(fileName(event.name), calendarFile([event], { place, linkFor: eventLink }))
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(eventLink(event))
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED)
    } catch {
      setCopied(false)
    }
  }

  function close() {
    if (closing.current) return

    closing.current = true
    setLeaving(true)
    setTimeout(onClose, motionOff() ? 0 : LEAVE)
  }

  useLayoutEffect(() => {
    let frame

    const place = () => {
      if (matchMedia(PHONE).matches || !anchor?.isConnected) return setSpot({ sheet: true })

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
      if (anchor?.isConnected) anchor.focus({ preventScroll: true })
    }
  }, [anchor])

  const placed = Boolean(spot)

  useEffect(() => {
    if (placed) closeButton.current.focus({ preventScroll: true })
  }, [placed])

  useEffect(() => {
    const outside = pointer => {
      if (!card.current.contains(pointer.target) && !anchor?.contains(pointer.target)) close()
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
          <p className="event-card-away"><strong>Not visible from {place.name}.</strong> {event.where}</p>
        )}

        <p className="event-card-note">{event.note}</p>

        {event.rows.length > 0 && (
          <dl className="popover-rows">
            {event.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        )}

        {ahead >= 0 && ahead < WEEK && event.here && (
          <Link className="event-card-tonight" to="/tonight">
            {ahead === 0 ? 'See tonight’s sky conditions' : 'See the forecast for this night'}
            <span aria-hidden="true"> ›</span>
          </Link>
        )}

        <div className="event-card-actions">
          <button type="button" onClick={addToCalendar}>Add to calendar</button>
          <button type="button" onClick={copyLink}>{copied ? 'Link copied' : 'Copy link'}</button>
          <span className="visually-hidden" role="status">{copied ? 'Link copied' : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default EventCard
