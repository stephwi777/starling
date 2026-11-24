import { useCallback, useRef, useState } from 'react'
import { isFavorite } from '../../sky/calendar/favorites.js'
import Chevron from '../ui/Chevron.jsx'
import EventIcon from './EventIcon.jsx'
import MonthPicker from './MonthPicker.jsx'
import useExit from '../ui/useExit.js'



// SETTINGS

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const LABELS = 2
const SWIPE = 50



// HELPERS

const pad = number => String(number).padStart(2, '0')

function longDay(year, month, day) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(Date.UTC(year, month - 1, day))
}



// DAY

function Day({ year, month, day, events, favorites, today, selected, narrow, south, active, onActive, onDay, onPick }) {
  const key = `${year}-${pad(month)}-${pad(day)}`
  const loved = event => isFavorite(event, favorites)
  const count = events.filter(loved).length
  const label = `${longDay(year, month, day)}${events.length ? `, ${events.length} ${events.length === 1 ? 'event' : 'events'}` : ''}${count ? `, ${count} ${count === 1 ? 'favorite' : 'favorites'}` : ''}`
  const classes = ['day', key === today && 'today', key < today && 'past', narrow && key === selected && 'selected'].filter(Boolean).join(' ')

  if (narrow) {
    return (
      <li className={classes} data-day={day}>
        <button
          type="button"
          className="day-button"
          data-key={key}
          tabIndex={key === active ? 0 : -1}
          aria-label={label}
          aria-pressed={key === selected}
          onFocus={() => onActive(key)}
          onClick={() => onDay(key)}
        >
          <span className="day-number">{day}</span>
          <span className="day-bars" aria-hidden="true">
            {events.slice(0, LABELS).map(event => <i key={event.id} data-group={event.group} className={[!event.here && 'away', loved(event) && 'fav'].filter(Boolean).join(' ') || undefined}><span>{event.tiny}</span></i>)}
            {events.length > LABELS && <b className="day-more">+{events.length - LABELS}</b>}
          </span>
        </button>
      </li>
    )
  }

  return (
    <li className={classes} data-day={day}>
      <span className="day-number" aria-hidden="true">{day}</span>
      <span className="visually-hidden">{label}</span>

      {events.map(event => (
        <button
          key={event.id}
          type="button"
          className={['chip', !event.here && 'away', loved(event) && 'fav'].filter(Boolean).join(' ')}
          data-group={event.group}
          data-event={event.id}
          data-key={event.id}
          tabIndex={event.id === active ? 0 : -1}
          aria-haspopup="dialog"
          onFocus={() => onActive(event.id)}
          onClick={click => onPick(event, click.currentTarget)}
        >
          {loved(event) && <span className="visually-hidden">Favorite, </span>}
          <EventIcon icon={event.icon} south={south} />
          <span>{event.short}</span>
        </button>
      ))}
    </li>
  )
}



// MONTH GRID

function MonthGrid({ year, month, events, favorites = [], today, selected, narrow, south, tools, slide, onMonth, onToday, onDay, onPick, onJump }) {
  const touch = useRef(null)
  const titleButton = useRef(null)
  const [picking, setPicking] = useState(false)
  const pickerShown = useExit(picking)
  const closePicker = useCallback(() => setPicking(false), [])
  const [focused, setFocused] = useState(null)

  const title = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(Date.UTC(year, month - 1, 15))
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const days = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]

  while (days.length % 7) days.push(null)

  const on = day => events.filter(event => event.day === `${year}-${pad(month)}-${pad(day)}`)
  const keys = narrow ? days.filter(Boolean).map(day => `${year}-${pad(month)}-${pad(day)}`) : events.map(event => event.id)
  const upcoming = narrow ? selected : events.find(event => event.day >= today)?.id
  const active = keys.includes(focused) ? focused : keys.includes(upcoming) ? upcoming : keys[0]

  function keyDown(event) {
    const items = [...event.currentTarget.querySelectorAll('[data-key]')]
    const index = items.indexOf(document.activeElement)
    const dayOf = item => Number(item.closest('li').dataset.day)

    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      onMonth(event.key === 'PageUp' ? -1 : 1)
      return
    }

    if (index === -1) return

    const toward = direction => {
      const want = dayOf(items[index]) + 7 * direction
      const ahead = items.filter(item => (direction > 0 ? dayOf(item) >= want : dayOf(item) <= want))

      return ahead.sort((a, b) => Math.abs(dayOf(a) - want) - Math.abs(dayOf(b) - want))[0]
    }

    const target = {
      ArrowRight: items[index + 1],
      ArrowLeft: items[index - 1],
      ArrowDown: toward(1),
      ArrowUp: toward(-1),
      Home: items[0],
      End: items.at(-1),
    }[event.key]

    if (!target) return

    event.preventDefault()
    setFocused(target.dataset.key)
    target.focus()

    if (narrow) onDay(target.dataset.key)
  }

  function touchStart(event) {
    const point = event.touches[0]

    touch.current = { x: point.clientX, y: point.clientY }
  }

  function touchEnd(event) {
    if (!touch.current) return

    const point = event.changedTouches[0]
    const across = point.clientX - touch.current.x
    const down = point.clientY - touch.current.y

    touch.current = null

    if (Math.abs(across) > SWIPE && Math.abs(across) > Math.abs(down) * 1.5) onMonth(across < 0 ? 1 : -1)
  }

  return (
    <section className="month" aria-labelledby="month-title">
      <div className="month-head">
        <h2 id="month-title" aria-live="polite">
          {onJump ? (
            <button ref={titleButton} type="button" className="month-title-button" aria-haspopup="dialog" aria-expanded={picking} onClick={() => setPicking(now => !now)}>
              {title}
              <Chevron />
            </button>
          ) : title}
        </h2>

        {pickerShown.shown && (
          <MonthPicker
            leaving={pickerShown.leaving}
            year={year}
            month={month}
            current={{ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }}
            anchor={titleButton}
            onClose={closePicker}
            onPick={(pickedYear, pickedMonth) => {
              setPicking(false)
              onJump(pickedYear, pickedMonth)
              titleButton.current.focus()
            }}
          />
        )}

        {tools}

        <div className="month-nav">
          <button type="button" className="month-today soft-button" onClick={onToday}>Today</button>
          <button type="button" className="soft-button" aria-label="Previous month" onClick={() => onMonth(-1)}><Chevron left /></button>
          <button type="button" className="soft-button" aria-label="Next month" onClick={() => onMonth(1)}><Chevron /></button>
        </div>
      </div>

      <div className="month-weekdays" aria-hidden="true">
        {WEEKDAYS.map(name => <span key={name}>{narrow ? name[0] : name}</span>)}
      </div>

      <ol
        key={`${year}-${month}`}
        className={`month-days${slide ? ` slide-${slide}` : ''}`}
        aria-label={`${title}. Use the arrow keys to move between ${narrow ? 'days' : 'events'}.`}
        onTouchStart={touchStart}
        onTouchEnd={touchEnd}
        onKeyDown={keyDown}
      >
        {days.map((day, i) => (day === null
          ? <li key={`blank-${i}`} className="blank" aria-hidden="true" />
          : <Day key={day} year={year} month={month} day={day} events={on(day)} favorites={favorites} today={today} selected={selected} narrow={narrow} south={south} active={active} onActive={setFocused} onDay={onDay} onPick={onPick} />
        ))}
      </ol>
    </section>
  )
}

export default MonthGrid
