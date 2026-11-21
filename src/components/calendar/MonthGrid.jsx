import EventIcon from './EventIcon.jsx'



// SETTINGS

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']



// HELPERS

const pad = number => String(number).padStart(2, '0')

function longDay(year, month, day) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(Date.UTC(year, month - 1, day))
}

function Chevron({ path }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}



// DAY

function Day({ year, month, day, events, today, selected, narrow, south, onDay, onPick }) {
  const key = `${year}-${pad(month)}-${pad(day)}`
  const label = `${longDay(year, month, day)}${events.length ? `, ${events.length} ${events.length === 1 ? 'event' : 'events'}` : ''}`
  const classes = ['day', key === today && 'today', narrow && key === selected && 'selected'].filter(Boolean).join(' ')

  if (narrow) {
    return (
      <li className={classes}>
        <button type="button" className="day-button" aria-label={label} aria-pressed={key === selected} onClick={() => onDay(key)}>
          <span className="day-number">{day}</span>
          <span className="day-bars" aria-hidden="true">
            {events.map(event => <i key={event.id} data-group={event.group} className={event.here ? undefined : 'away'} />)}
          </span>
        </button>
      </li>
    )
  }

  return (
    <li className={classes}>
      <span className="day-number" aria-hidden="true">{day}</span>
      <span className="visually-hidden">{label}</span>

      {events.map(event => (
        <button
          key={event.id}
          type="button"
          className={`chip${event.here ? '' : ' away'}`}
          data-group={event.group}
          aria-haspopup="dialog"
          onClick={click => onPick(event, click.currentTarget)}
        >
          <EventIcon icon={event.icon} south={south} />
          <span>{event.short}</span>
        </button>
      ))}
    </li>
  )
}



// MONTH GRID

function MonthGrid({ year, month, events, today, selected, narrow, south, onMonth, onToday, onDay, onPick }) {
  const title = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(Date.UTC(year, month - 1, 15))
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const days = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]

  while (days.length % 7) days.push(null)

  const on = day => events.filter(event => event.day === `${year}-${pad(month)}-${pad(day)}`)

  return (
    <section className="month" aria-labelledby="month-title">
      <div className="month-head">
        <h2 id="month-title" aria-live="polite">{title}</h2>

        <div className="month-nav">
          <button type="button" className="month-today" onClick={onToday}>Today</button>
          <button type="button" aria-label="Previous month" onClick={() => onMonth(-1)}><Chevron path="M10 3 L5 8 L10 13" /></button>
          <button type="button" aria-label="Next month" onClick={() => onMonth(1)}><Chevron path="M6 3 L11 8 L6 13" /></button>
        </div>
      </div>

      <div className="month-weekdays" aria-hidden="true">
        {WEEKDAYS.map(name => <span key={name}>{narrow ? name[0] : name}</span>)}
      </div>

      <ol className="month-days">
        {days.map((day, i) => (day === null
          ? <li key={`blank-${i}`} className="blank" aria-hidden="true" />
          : <Day key={day} year={year} month={month} day={day} events={on(day)} today={today} selected={selected} narrow={narrow} south={south} onDay={onDay} onPick={onPick} />
        ))}
      </ol>
    </section>
  )
}

export default MonthGrid
