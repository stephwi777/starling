import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { popoverPlace } from './popoverPlace.js'
import './Popover.css'



// MOTION

const LEAVE = 200
const WIDTH = 352
const HEIGHT = 640
const PHONE = '(max-width: 700px)'

function motionOff() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('still')
}



// POPOVER

function Popover({ title, titleId, link, panelClose, children }) {
  const panel = useRef(null)
  const scroller = useRef(null)
  const closeButton = useRef(null)
  const closing = useRef(false)
  const [spot, setSpot] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function close() {
    if (closing.current) return

    closing.current = true
    setLeaving(true)

    setTimeout(() => {
      if (location.state?.fromTonight) navigate(-1)
      else navigate('/tonight', { replace: true })
    }, motionOff() ? 0 : LEAVE)
  }

  useLayoutEffect(() => {
    const element = panel.current
    const opener = link.current
    let frame

    const place = () => {
      const tile = link.current?.closest('.tile, .card')

      if (matchMedia(PHONE).matches || !tile) return setSpot({ sheet: true })

      const size = { width: Math.min(WIDTH, window.innerWidth - 32), height: Math.min(HEIGHT, scroller.current.scrollHeight) }

      const spot = popoverPlace(tile.getBoundingClientRect(), size, { width: window.innerWidth, height: window.innerHeight })

      setSpot(spot.fits ? spot : { sheet: true })
    }

    const later = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }

    document.documentElement.style.setProperty('--scrollbar-gap', `${window.innerWidth - document.documentElement.clientWidth}px`)
    document.documentElement.classList.add('popover-open')
    element.showPopover?.()
    place()
    window.addEventListener('resize', later)

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('popover-open')
      window.removeEventListener('resize', later)
      opener?.focus({ preventScroll: true })
    }
  }, [link])

  const placed = Boolean(spot)

  useEffect(() => {
    if (placed) closeButton.current.focus({ preventScroll: true })
  }, [placed])

  useEffect(() => {
    panelClose.current = close

    const outside = event => {
      if (!panel.current.contains(event.target) && !link.current?.closest('.tile, .card')?.contains(event.target)) close()
    }

    const escape = event => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)

    return () => {
      panelClose.current = null
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  })

  return (
    <div
      ref={panel}
      popover="manual"
      role="dialog"
      aria-labelledby={titleId}
      className={['popover', spot?.sheet ? 'sheet' : spot?.side, spot ? '' : 'unplaced', leaving ? 'leaving' : ''].filter(Boolean).join(' ')}
      style={spot && !spot.sheet ? { left: spot.left, top: spot.top, '--arrow': `${spot.arrow}px` } : undefined}
    >
      <span className="popover-arrow" aria-hidden="true" />

      <div className="popover-scroll" ref={scroller}>
        <div className="popover-head">
          <h2 id={titleId}>{title}</h2>
          <button ref={closeButton} type="button" className="popover-close" aria-label="Close" onClick={close}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default Popover
