import { Link } from 'react-router'
import { clock } from '../../sky/words.js'
import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { MoonIcon } from '../ui/icons.jsx'



// TONIGHT CARD

function TonightCard({ sky, place, status }) {
  const { night, weather } = sky
  const outside = weather?.temp ?? (status === 'loading' ? 'Loading…' : '—')

  return (
    <Card labelledBy="home-tonight" className="tonight-card">
      <div className="card-head">
        <IconWell><MoonIcon /></IconWell>
        <h2 id="home-tonight">Tonight in {place.name}</h2>
        <Link className="card-link" to="/tonight">Tonight</Link>
      </div>

      <p className="card-verdict">{sky.summary}</p>
      {status === 'failed' && <p className="card-note">The forecast is unavailable right now, so clouds aren't included.</p>}

      <dl className="facts">
        <div><dt>Moon</dt><dd>{Math.round(night.moonLit * 100)}% lit</dd></div>
        <div><dt>Fully dark</dt><dd>{night.astroDusk ? clock(night.astroDusk, place.timeZone) : 'Not tonight'}</dd></div>
        <div><dt>Outside</dt><dd>{outside}</dd></div>
      </dl>
    </Card>
  )
}

export default TonightCard
