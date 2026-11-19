import { useMemo } from 'react'
import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { sevenNights } from '../../sky/nights.js'
import { NightsIcon, PhaseMoon } from '../ui/icons.jsx'



// NOTES

const NOTES = {
  loading: 'Checking the cloud forecast…',
  failed: 'The forecast isn’t available, so the bars show dark hours only.',
}



// NIGHTS CARD

function NightsCard({ place, forecast, now }) {
  const nights = useMemo(() => sevenNights(place, forecast.raw, now), [place, forecast.raw, now])
  const note = forecast.raw ? null : NOTES[forecast.status]

  return (
    <Card labelledBy="nights-title">
      <div className="card-head">
        <IconWell><NightsIcon /></IconWell>
        <h2 id="nights-title">Next 7 nights</h2>
      </div>

      <ul className="nights">
        {nights.map(night => (
          <li key={night.key}>
            <strong>{night.day}</strong>
            <PhaseMoon angle={night.moonAngle} size={24} south={place.latitude < 0} />
            <span className="visually-hidden">Moon {Math.round(night.moonLit * 100)}% lit.</span>
            {night.label ? (
              <span className="night-none">{night.label}</span>
            ) : (
              <span className="night-track" aria-hidden="true">
                <i className={night.kind} style={{ left: `${night.left * 100}%`, width: `${night.width * 100}%` }} />
              </span>
            )}
            <span className="night-span">{night.words}</span>
          </li>
        ))}
      </ul>

      {note && <p className="card-note">{note}</p>}
    </Card>
  )
}

export default NightsCard
