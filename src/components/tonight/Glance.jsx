import { clock } from '../../sky/words.js'
import { MoonIcon } from './Icons.jsx'
import './Glance.css'



// WORDS

const SCALE = ['', 'Bad', 'Poor', 'Average', 'Good', 'Excellent']

function moonLine(sky, timeZone) {
  const { moon, night } = sky

  if (moon.set !== null) return `Sets ${clock(night.times[moon.set], timeZone)}`
  if (moon.rise !== null) return `Rises ${clock(night.times[moon.rise], timeZone)}`

  return moon.track[0].alt > 0 ? 'Up all night' : 'Down all night'
}

function cloudLine(sky, status, timeZone) {
  if (status === 'loading') return { main: 'Loading…', note: 'Checking the forecast' }
  if (!sky.clouds) return { main: 'Unavailable', note: 'Check the sky yourself' }

  const cloudy = sky.clouds.findIndex(value => value >= 40)
  const start = sky.night.start.getTime()

  if (cloudy === -1) return { main: 'Clear all night', note: `Peak ${Math.max(...sky.clouds)}%` }
  if (cloudy === 0) return { main: 'Cloudy at dusk', note: `Peak ${Math.max(...sky.clouds)}%` }

  return { main: `Clear until ${clock(new Date(start + cloudy * 3600000), timeZone)}`, note: `Peak ${Math.max(...sky.clouds)}%` }
}



// GLANCE

function Glance({ sky, status, timeZone }) {
  const { night, weather } = sky
  const clouds = cloudLine(sky, status, timeZone)

  return (
    <section className="glance box" aria-label="Tonight at a glance">
      <div>
        <h2><MoonIcon angle={night.moonAngle} />Moon</h2>
        <strong>{Math.round(night.moonLit * 100)}% lit</strong>
        <p>{moonLine(sky, timeZone)}</p>
      </div>

      <div>
        <h2>Fully dark</h2>
        <strong>{night.astroDusk ? clock(night.astroDusk, timeZone) : 'Not tonight'}</strong>
        <p>{night.astroDawn && night.astroDusk ? `until ${clock(night.astroDawn, timeZone)}` : 'Twilight all night'}</p>
      </div>

      <div>
        <h2>Clouds</h2>
        <strong>{clouds.main}</strong>
        <p>{clouds.note}</p>
      </div>

      <div>
        <h2>Seeing</h2>
        <strong>{weather ? SCALE[weather.seeing] : '—'}</strong>
        <p>
          <span className="hob">How steady the stars are</span>
          <span className="adv">{weather ? `${weather.seeing} of 5, estimate` : 'No forecast'}</span>
        </p>
      </div>

      <div>
        <h2>Transparency</h2>
        <strong>{weather ? SCALE[weather.transparency] : '—'}</strong>
        <p>
          <span className="hob">How clear the air is</span>
          <span className="adv">{weather ? `${weather.transparency} of 5, estimate` : 'No forecast'}</span>
        </p>
      </div>

      <div>
        <h2>Outside</h2>
        <strong>{weather ? weather.temp : '—'}</strong>
        <p>{weather ? weather.wind : 'No forecast'}</p>
      </div>
    </section>
  )
}

export default Glance
