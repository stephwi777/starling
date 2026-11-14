import { clock, hourLabel } from '../../sky/words.js'
import './TimeRibbon.css'



// SKY COLORS

function skyColor(alt) {
  if (alt > 0) return 'var(--sky-day)'
  if (alt > -6) return 'var(--sky-civil)'
  if (alt > -12) return 'var(--sky-nautical)'
  if (alt > -18) return 'var(--sky-astro)'
  return 'var(--sky-night)'
}

function skyWord(alt) {
  if (alt > 0) return 'the Sun is up'
  if (alt > -6) return 'twilight, still bright'
  if (alt > -12) return 'getting dark'
  if (alt > -18) return 'almost fully dark'
  return 'fully dark'
}

function runs(track) {
  const found = []
  let from = null

  track.forEach((point, i) => {
    if (point.alt > 0 && from === null) from = i
    if ((point.alt <= 0 || i === track.length - 1) && from !== null) {
      found.push([from, i])
      from = null
    }
  })

  return found
}



// TIME RIBBON

function TimeRibbon({ sky, at, timeZone, onTime }) {
  const { night, moon, clouds, best } = sky
  const last = night.times.length - 1
  const percent = i => `${(i / last) * 100}%`
  const stops = night.sun.map((alt, i) => `${skyColor(alt)} ${percent(i)}`).join(', ')
  const hours = Array.from({ length: night.hours + 1 }, (_, h) => new Date(night.start.getTime() + h * 3600000))
  const time = night.times[at]

  return (
    <section className="time box" aria-labelledby="time-title">
      <div className="time-head">
        <h2 id="time-title">Sky at</h2>
        <output htmlFor="time-input">{clock(time, timeZone)}</output>
        <div className="step">
          <button type="button" aria-label="One hour earlier" onClick={() => onTime(at - 6)}>−1h</button>
          {sky.nowIndex !== null && <button type="button" onClick={() => onTime(sky.nowIndex)}>Now</button>}
          {best && <button type="button" onClick={() => onTime(best.from)}>Best</button>}
          <button type="button" aria-label="One hour later" onClick={() => onTime(at + 6)}>+1h</button>
        </div>
      </div>

      <div className="ribbon">
        <div className="sky-band" style={{ background: `linear-gradient(90deg, ${stops})` }} aria-hidden="true">
          {clouds && (
            <div className="clouds">
              {clouds.map((cover, i) => <span key={i} style={{ '--cover': cover ?? 0 }}></span>)}
            </div>
          )}

          {runs(moon.track).map(([from, to]) => (
            <span key={from} className="moon-up" style={{ left: percent(from), width: `${((to - from) / last) * 100}%` }}></span>
          ))}

          {best && <span className="best" style={{ left: percent(best.from), width: `${((best.to - best.from) / last) * 100}%` }}></span>}
        </div>

        <input
          id="time-input"
          type="range"
          min="0"
          max={last}
          value={at}
          aria-label="Time of night"
          aria-valuetext={`${clock(time, timeZone)}, ${skyWord(night.sun[at])}`}
          onChange={event => onTime(Number(event.target.value))}
        />
      </div>

      <div className="hours" aria-hidden="true">
        {hours.map((hour, h) => (
          <span key={h} style={{ left: `${(h / night.hours) * 100}%` }}>{hourLabel(hour, timeZone)}</span>
        ))}
      </div>

      <p className="key" aria-hidden="true">
        <span><i className="key-sky"></i>Sky going dark</span>
        <span><i className="key-moon"></i>Moon up</span>
        <span><i className="key-clouds"></i>Clouds</span>
        <span><i className="key-best"></i>Best window</span>
      </p>
    </section>
  )
}

export default TimeRibbon
