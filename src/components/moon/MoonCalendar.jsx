import { useMemo } from 'react'
import { monthMoons } from '../../sky/moonNights.js'
import { PhaseMoon } from '../ui/icons.jsx'



// SETTINGS

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']



// CHEVRONS

function Chevron({ path }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}



// CALENDAR

function MoonCalendar({ nights, year, month, first, last, selectedNight, tonightNight, south, timeZone, onMonth, onPick }) {
  const moons = useMemo(() => monthMoons(nights, year, month), [nights, year, month])
  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const format = options => new Intl.DateTimeFormat('en-US', { timeZone, ...options })
  const title = format({ month: 'long', year: 'numeric' }).format(nights[moons[0].index].noon)
  const atFirst = year === first.year && month === first.month
  const atLast = year === last.year && month === last.month

  return (
    <div className="moon-calendar" role="group" aria-label="Calendar">
      <div className="moon-calendar-head">
        <button type="button" className="moon-month" aria-label="Previous month" aria-disabled={atFirst} onClick={() => atFirst || onMonth(-1)}>
          <Chevron path="M10 3 L5 8 L10 13" />
        </button>
        <strong aria-live="polite">{title}</strong>
        <button type="button" className="moon-month" aria-label="Next month" aria-disabled={atLast} onClick={() => atLast || onMonth(1)}>
          <Chevron path="M6 3 L11 8 L6 13" />
        </button>
      </div>

      <div className="moon-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day, i) => <b key={i}>{day}</b>)}
      </div>

      <div className="moon-days">
        {Array.from({ length: offset }, (_, i) => <span key={`gap-${i}`} />)}

        {moons.map(moon => {
          const isTonight = moon.index === tonightNight
          const name = `${format({ weekday: 'long', month: 'long', day: 'numeric' }).format(nights[moon.index].noon)}, ${Math.round(moon.lit * 100)}% lit${isTonight ? ', tonight' : ''}`

          return (
            <button
              key={moon.index}
              type="button"
              className={isTonight ? 'tonight' : undefined}
              aria-label={name}
              aria-current={moon.index === selectedNight ? 'true' : undefined}
              onClick={() => onPick(moon.index)}
            >
              {moon.day}
              <PhaseMoon angle={moon.angle} size={24} south={south} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MoonCalendar
