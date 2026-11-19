import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { phaseAngle } from '../../sky/skyLook.js'
import { NightsIcon, PhaseMoon } from '../ui/icons.jsx'



// NIGHTS

const NIGHTS = [
  { day: 'Tonight', lit: 0.53, from: 0.11, to: 0.57, words: '6:36pm–1am' },
  { day: 'Wed', lit: 0.63, from: 0.11, to: 0.86, words: '6:36pm–5am' },
  { day: 'Thu', lit: 0.72, from: 0.42, to: 0.86, words: '10pm–5am' },
  { day: 'Fri', lit: 0.81, from: null, to: null, words: 'Cloudy all night' },
  { day: 'Sat', lit: 0.89, from: 0.64, to: 0.86, words: '2am–5am' },
  { day: 'Sun', lit: 0.95, from: 0.11, to: 0.86, words: '6:37pm–5am' },
  { day: 'Mon', lit: 0.99, from: 0.11, to: 0.86, words: '6:37pm–5am' },
]



// NIGHTS CARD

function NightsCard() {
  return (
    <Card labelledBy="nights-title">
      <div className="card-head">
        <IconWell><NightsIcon /></IconWell>
        <h2 id="nights-title">Next 7 nights</h2>
      </div>

      <ul className="nights">
        {NIGHTS.map(night => (
          <li key={night.day}>
            <strong>{night.day}</strong>
            <PhaseMoon angle={phaseAngle(night.lit)} size={24} />
            {night.from === null ? (
              <span className="night-none">No clear hours</span>
            ) : (
              <span className="night-track" aria-hidden="true">
                <i
                  className={night.to - night.from < 0.3 ? 'short' : undefined}
                  style={{ left: `${night.from * 100}%`, width: `${(night.to - night.from) * 100}%` }}
                />
              </span>
            )}
            <span className="night-span">{night.words}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default NightsCard
