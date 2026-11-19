import { useEffect, useRef, useState } from 'react'
import Card from '../ui/Card.jsx'
import { ClockIcon, ClearIcon, CloudIcon, DawnIcon, MoonsetIcon, SparkleIcon, SunsetIcon, TwilightIcon } from '../ui/icons.jsx'



// HOURS

const ICONS = {
  sunset: SunsetIcon,
  twilight: TwilightIcon,
  dark: SparkleIcon,
  clear: ClearIcon,
  moonset: MoonsetIcon,
  cloud: CloudIcon,
  dawn: DawnIcon,
}

const HOURS = [
  { time: '5:04pm', icon: 'sunset', word: 'Sunset', moment: true },
  { time: '6pm', icon: 'twilight', word: 'Twilight' },
  { time: '6:36pm', icon: 'dark', word: 'Fully dark', moment: true },
  { time: '7pm', icon: 'clear', word: 'Clear' },
  { time: '8pm', icon: 'clear', word: 'Clear' },
  { time: '9pm', icon: 'clear', word: 'Clear' },
  { time: '10pm', icon: 'clear', word: 'Clear' },
  { time: '11pm', icon: 'clear', word: 'Clear' },
  { time: '12am', icon: 'clear', word: 'Clear' },
  { time: '12:40am', icon: 'moonset', word: 'Moonset', moment: true },
  { time: '1am', icon: 'cloud', word: 'Patchy' },
  { time: '2am', icon: 'cloud', word: 'Patchy' },
  { time: '3am', icon: 'cloud', word: 'Patchy' },
  { time: '4am', icon: 'clear', word: 'Clear' },
  { time: '5:29am', icon: 'dawn', word: 'Dawn', moment: true },
]



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

function HoursCard() {
  const row = useRef(null)
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

  return (
    <Card labelledBy="hours-title" className="hours-card">
      <h2 id="hours-title" data-appear><ClockIcon />Hour by hour</h2>

      <p className="hours-summary">Patchy clouds roll in around 1am. Leonid meteors are best after the Moon sets at 12:40am.</p>

      <div className="hours-row">
        <ul className="hours" ref={row} onScroll={check} tabIndex={0} aria-labelledby="hours-title">
          {HOURS.map(hour => {
            const Icon = ICONS[hour.icon]

            return (
              <li key={hour.time} className={hour.moment ? 'moment' : undefined}>
                <span className="hour-time">{hour.time}</span>
                <Icon />
                <span className="hour-word">{hour.word}</span>
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
