import { Link } from 'react-router'
import { clock } from '../../sky/words.js'
import { sortEasiest } from '../../sky/listing.js'
import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { DarkSkyIcon, MoonIcon, ThermometerIcon } from '../ui/icons.jsx'
import { MoonIcon as PhaseIcon, ObjectIcon } from '../tonight/Icons.jsx'



// SIGHTS

function easiestSights(sky) {
  return [sky.planets, sky.shapes, sky.deep]
    .map(group => sortEasiest(group.filter(object => object.visible && object.gear === 1))[0])
    .filter(Boolean)
}



// TONIGHT CARD

function TonightCard({ sky, place, status }) {
  const { night, weather } = sky
  const outside = weather?.temp ?? (status === 'loading' ? 'Loading…' : '—')
  const sights = easiestSights(sky)

  return (
    <Card labelledBy="home-tonight" className="tonight-card">
      <div className="card-head">
        <IconWell><MoonIcon /></IconWell>
        <h2 id="home-tonight">Tonight in {place.name}</h2>
        <Link className="card-link" to="/tonight">Tonight</Link>
      </div>

      <p className="card-verdict">{sky.summary}</p>
      {status === 'failed' && <p className="card-note">The forecast is unavailable right now, so clouds aren't included.</p>}

      {sights.length > 0 && (
        <div className="sights">
          <h3>Look for</h3>
          <ul>
            {sights.map(object => (
              <li key={object.name}>
                <ObjectIcon object={object} moonAngle={night.moonAngle} />
                {object.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="facts">
        <div>
          <dt><PhaseIcon angle={night.moonAngle} />Moon</dt>
          <dd>{Math.round(night.moonLit * 100)}% lit</dd>
        </div>
        <div>
          <dt><DarkSkyIcon />Fully dark</dt>
          <dd>{night.astroDusk ? clock(night.astroDusk, place.timeZone) : 'Not tonight'}</dd>
        </div>
        <div>
          <dt><ThermometerIcon />Outside</dt>
          <dd>{outside}</dd>
        </div>
      </dl>
    </Card>
  )
}

export default TonightCard
