import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { upcoming } from '../../sky/calendar/monthEvents.js'
import { loadCalendar } from '../../sky/calendar/calendarStorage.js'
import { loadFavorites } from '../../sky/calendar/favoriteStorage.js'
import { isFavorite } from '../../sky/calendar/favorites.js'
import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { CalendarIcon } from '../ui/icons.jsx'
import EventIcon from '../calendar/EventIcon.jsx'
import Tags from '../calendar/Tags.jsx'
import useComets from '../../sky/calendar/useComets.js'



// HELPERS

function shortDay(key) {
  const [year, month, day] = key.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(Date.UTC(year, month - 1, day))
}

function firstSentence(text) {
  return text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text
}



// COMING UP CARD

function ComingUpCard({ place, now }) {
  const [events, setEvents] = useState(null)
  const [favorites] = useState(() => loadFavorites())
  const day = now.toDateString()
  const { version } = useComets()

  useEffect(() => {
    const timer = setTimeout(() => setEvents(upcoming(place, new Date(), { kinds: loadCalendar().kinds, favorites })), 0)

    return () => clearTimeout(timer)
  }, [place, day, version, favorites])

  return (
    <Card labelledBy="home-coming">
      <div className="card-head">
        <IconWell><CalendarIcon /></IconWell>
        <h2 id="home-coming">Coming up</h2>
        <Link className="card-link" to="/calendar">Calendar</Link>
      </div>

      {events === null && <p className="card-note">Checking the sky calendar…</p>}

      {events?.length === 0 && <p className="card-note">Nothing big in the next month. Clear skies are still worth a look!</p>}

      {events?.length > 0 && (
        <ul className="coming-list">
          {events.map(event => (
            <li key={event.id}>
              <Link className={isFavorite(event, favorites) ? 'coming-row fav' : 'coming-row'} to={`/calendar?month=${event.day.slice(0, 7)}&event=${encodeURIComponent(event.id)}`}>
                <IconWell><EventIcon icon={event.icon} south={place.latitude < 0} /></IconWell>
                <span className="row-text">
                  <strong>{isFavorite(event, favorites) && <span className="visually-hidden">Favorite, </span>}{event.name} <Tags tags={event.tags} /></strong>
                  <small>{firstSentence(event.note)}</small>
                </span>
                <time dateTime={event.day}>{shortDay(event.day)}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ComingUpCard
