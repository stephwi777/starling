import { Link } from 'react-router'
import { comingUp } from '../../sky/comingUp.js'
import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { CalendarIcon, FullMoonIcon, HalfMoonIcon, MeteorIcon, NewMoonIcon } from '../ui/icons.jsx'



// ICONS

const ICONS = {
  'shower': MeteorIcon,
  'full-moon': FullMoonIcon,
  'new-moon': NewMoonIcon,
  'first-quarter': HalfMoonIcon,
  'last-quarter': HalfMoonIcon,
}



// COMING UP CARD

function ComingUpCard({ now, timeZone }) {
  const events = comingUp(now)
  const day = new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric' })

  return (
    <Card labelledBy="home-coming">
      <div className="card-head">
        <IconWell><CalendarIcon /></IconWell>
        <h2 id="home-coming">Coming up</h2>
        <Link className="card-link" to="/calendar">Calendar</Link>
      </div>

      {events.length === 0 ? (
        <p className="card-note">Nothing big in the next month. Clear skies are still worth a look!</p>
      ) : (
        <ul className="events">
          {events.map(event => {
            const Icon = ICONS[event.kind]

            return (
              <li key={`${event.kind}${event.date.toISOString()}`}>
                <IconWell><Icon /></IconWell>
                <span className="row-text">
                  <strong>{event.name}</strong>
                  <small>{event.note}</small>
                </span>
                <time dateTime={event.date.toISOString()}>{day.format(event.date)}</time>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default ComingUpCard
