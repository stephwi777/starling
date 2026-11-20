import { useEffect, useRef, useState } from 'react'
import { hourCells, hoursSummary } from '../../sky/hours.js'
import Card from '../ui/Card.jsx'
import {
  ClearIcon,
  ClockIcon,
  CloudIcon,
  DarkIcon,
  MoonriseIcon,
  MoonsetIcon,
  PatchyIcon,
  SparkleIcon,
  SunriseIcon,
  SunsetIcon,
  TwilightIcon,
} from '../ui/icons.jsx'



// ICONS

const ICONS = {
  'sunset': SunsetIcon,
  'twilight': TwilightIcon,
  'fully-dark': SparkleIcon,
  'clear': ClearIcon,
  'patchy': PatchyIcon,
  'cloudy': CloudIcon,
  'dark': DarkIcon,
  'moonrise': MoonriseIcon,
  'moonset': MoonsetIcon,
  'dawn': TwilightIcon,
  'sunrise': SunriseIcon,
}



// ARROW

function Arrow({ side, shown, onClick }) {
  return (
    <button type="button" className={`hours-arrow ${side}`} onClick={onClick} disabled={!shown} tabIndex={-1} aria-hidden="true">
      <svg viewBox="0 0 14 28">
        <path d={side === 'left' ? 'M11 2 L3 14 L11 26' : 'M3 2 L11 14 L3 26'} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}



// HOURS CARD

function HoursCard({ sky, status, timeZone, now }) {
  const details = { night: sky.night, moon: sky.moon, clouds: sky.clouds, showers: sky.showers, status, timeZone, now }
  const cells = hourCells(details)
  const words = cells.map(cell => cell.word).join()
  const row = useRef(null)
  const placed = useRef(false)
  const hasNow = cells.some(cell => cell.now)
  const [ends, setEnds] = useState({ start: true, end: false })

  function check() {
    const list = row.current

    setEnds({
      start: list.scrollLeft <= 1,
      end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 1,
    })
  }

  function move(direction) {
    const list = row.current

    list.scrollBy({ left: direction * (list.clientWidth - 80) })
  }

  useEffect(() => {
    const watcher = new ResizeObserver(check)

    watcher.observe(row.current)
    return () => watcher.disconnect()
  }, [])

  useEffect(check, [words])

  useEffect(() => {
    if (placed.current || !hasNow) return

    const list = row.current
    const cell = list.querySelector('.now')

    list.scrollTo({ left: cell.offsetLeft - list.offsetLeft, behavior: 'instant' })
    placed.current = true
  }, [hasNow])

  return (
    <Card labelledBy="hours-title" className="hours-card">
      <h2 id="hours-title" data-appear><ClockIcon />Hour by hour</h2>

      <p className="hours-summary">{hoursSummary(details)}</p>

      <div className="hours-row">
        <ul className="hours" ref={row} onScroll={check} tabIndex={0} aria-labelledby="hours-title">
          {cells.map(cell => {
            const Icon = ICONS[cell.kind]

            return (
              <li
                key={cell.now ? 'now' : `${cell.kind}${cell.time.getTime()}`}
                className={cell.moment ? 'moment' : cell.now ? 'now' : undefined}
                aria-current={cell.now ? 'time' : undefined}
              >
                <span className="hour-time">{cell.label}</span>
                <Icon />
                <span className="hour-word">{cell.word}</span>
              </li>
            )
          })}
        </ul>

        <Arrow side="left" shown={!ends.start} onClick={() => move(-1)} />
        <Arrow side="right" shown={!ends.end} onClick={() => move(1)} />
      </div>
    </Card>
  )
}

export default HoursCard
