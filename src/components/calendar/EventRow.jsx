import IconWell from '../ui/IconWell.jsx'
import EventIcon from './EventIcon.jsx'
import Tags from './Tags.jsx'



// EVENT ROW

function EventRow({ event, south, dated, favorite, onPick }) {
  const [year, month, day] = event.day.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(date)

  return (
    <button type="button" className={['event-row', !event.here && 'away', favorite && 'fav'].filter(Boolean).join(' ')} data-group={event.group} data-event={event.id} aria-haspopup="dialog" onClick={click => onPick(event, click.currentTarget)}>
      {dated && <span className="event-row-date" aria-hidden="true"><small>{weekday}</small><b>{day}</b></span>}
      <IconWell><EventIcon icon={event.icon} south={south} /></IconWell>
      <span className="row-text">
        <strong>{favorite && <span className="visually-hidden">Favorite, </span>}{event.name} <Tags tags={event.tags} /></strong>
        <small>
          {dated && <span className="visually-hidden">{weekday} {day}, </span>}
          {[event.time, !event.here && 'Not visible from here'].filter(Boolean).join(' · ')}
        </small>
      </span>
    </button>
  )
}

export default EventRow
