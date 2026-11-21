import { useMemo } from 'react'
import { Link } from 'react-router'
import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { sevenNights } from '../../sky/nights.js'
import { NightsIcon, PhaseMoon, RainIcon, SnowIcon } from '../ui/icons.jsx'



// NOTES

const NOTES = {
  loading: 'Checking the cloud forecast…',
  failed: 'The forecast isn’t available, so the bars show dark hours only.',
}



// BLOCKS

function Blocks({ night }) {
  if (night.label) {
    const Wet = night.fall === 'snow' ? SnowIcon : RainIcon

    return <span className="night-none">{night.fall && <Wet />}{night.label}</span>
  }

  return (
    <span className="night-blocks" style={{ '--count': night.blocks.length }} aria-hidden="true">
      {night.blocks.map((block, i) => <i key={i} className={block} />)}
    </span>
  )
}



// NIGHTS CARD

function NightsCard({ place, forecast, now }) {
  const { nights, marks } = useMemo(() => sevenNights(place, forecast.raw, now), [place, forecast.raw, now])
  const note = forecast.raw ? null : NOTES[forecast.status]
  const keyed = nights.some(night => night.kind === 'clear')

  return (
    <Card labelledBy="nights-title">
      <div className="card-head">
        <IconWell><NightsIcon /></IconWell>
        <h2 id="nights-title">Next 7 nights</h2>
        <Link className="card-link" to="/calendar">Calendar</Link>
      </div>

      <div className="nights-body">
        <div className="nights-scale" aria-hidden="true">
          <div>{marks.map(mark => <span key={mark.label} style={{ left: `${mark.at * 100}%` }}>{mark.label}</span>)}</div>
        </div>

        <ul className="nights">
          {nights.map(night => (
            <li key={night.key}>
              <span className="night-day">
                <strong>{night.day}</strong>
                {night.best && <span className="night-best">Best night</span>}
              </span>

              <span className="night-moon">
                <PhaseMoon angle={night.moonAngle} size={24} south={place.latitude < 0} />
                <span className="visually-hidden">Moon </span>
                {Math.round(night.moonLit * 100)}%
                <span className="visually-hidden"> lit.</span>
              </span>

              <Blocks night={night} />

              {!night.label && <span className="visually-hidden">{night.words}. {night.dark}</span>}
            </li>
          ))}
        </ul>

        {keyed && (
          <div className="nights-key" aria-hidden="true">
            <span><i className="dark" />Clear & truly dark</span>
            <span><i className="moonlit" />Clear, Moon up</span>
            <span><i className="cloudy" />Cloudy</span>
            <span><i className="twilight" />Twilight</span>
          </div>
        )}
      </div>

      {note && <p className="card-note">{note}</p>}
    </Card>
  )
}

export default NightsCard
