import { clock } from '../../sky/words.js'



// SUN TIMES

function SunTimes({ night, timeZone }) {
  const items = [
    ['Sunset', night.sunset],
    ['Civil dusk', night.civilDusk],
    ['Nautical dusk', night.nauticalDusk],
    ['Fully dark', night.astroDusk],
    ['Dark ends', night.astroDawn],
    ['Nautical dawn', night.nauticalDawn],
    ['Civil dawn', night.civilDawn],
    ['Sunrise', night.sunrise],
  ]
  const hours = night.astroDusk && night.astroDawn ? Math.round((night.astroDawn - night.astroDusk) / 360000) / 10 : 0

  return (
    <section className="category" aria-labelledby="sun-title">
      <header>
        <h2 id="sun-title">Sun and twilight</h2>
        <p>{hours ? `Fully dark for ${hours} hours` : 'It doesn’t get fully dark tonight'}</p>
      </header>

      <dl className="sun-times">
        {items.map(([label, date]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{date ? clock(date, timeZone) : 'Not tonight'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default SunTimes
