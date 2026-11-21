import { useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import { nightStart } from '../../sky/night.js'
import { distanceWords, fullMoonWords, moonAt, nightName, phaseName, riseAndSet } from '../../sky/moonFacts.js'
import { chosenIndex, nearestNotch, notchesFor, rulerNights, sameTimeIndex, tonightIndex } from '../../sky/moonNights.js'
import { clock } from '../../sky/words.js'
import { PhaseMoon } from '../ui/icons.jsx'
import MoonRuler from './MoonRuler.jsx'
import useNotchWheel from './useNotchWheel.js'
import MoonCalendar from './MoonCalendar.jsx'
import Popover from '../panel/Popover.jsx'
import './MoonPanel.css'



// ARROWS

const BACK = 'M20 15 H10 M14.5 10.5 L10 15 L14.5 19.5'
const AHEAD = 'M10 15 H20 M15.5 10.5 L20 15 L15.5 19.5'

function HomeArrow({ path, shown, onClick }) {
  return (
    <button type="button" className={`moon-home${shown ? '' : ' away'}`} aria-label="Back to tonight" tabIndex={shown ? 0 : -1} onClick={onClick}>
      <svg viewBox="0 0 30 30" width="30" height="30" aria-hidden="true">
        <circle cx="15" cy="15" r="13" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}



// TIMES

function TimeOrNone({ date, timeZone }) {
  if (date) return clock(date, timeZone)

  return <><span aria-hidden="true">—</span><span className="visually-hidden">None</span></>
}



// MOON PANEL

function MoonPanel() {
  const { place, now, links, registerClose } = useOutletContext()
  const art = useRef(null)
  const ruler = useRef(null)
  const tonightNoon = nightStart(place, now).getTime()

  const sky = useMemo(() => {
    const nights = rulerNights(place, new Date(tonightNoon))
    const tonight = tonightIndex(nights, place, new Date(tonightNoon))
    const notches = notchesFor(nights, place.timeZone)

    return { nights, tonight, notches, home: nearestNotch(notches, nights[tonight].midnight) }
  }, [place, tonightNoon])

  const placeKey = `${place.latitude},${place.longitude}`
  const [move, setMove] = useState({ time: null, glide: false, place: placeKey })

  if (move.place !== placeKey) setMove({ time: null, glide: false, place: placeKey })

  const index = chosenIndex(sky.notches, sky.home, move.time)
  const notch = sky.notches[index]
  const night = sky.nights[notch.night]
  const moon = moonAt(notch.time)
  const lit = Math.round(moon.lit * 100)
  const phase = phaseName(moon.angle)
  const title = nightName(night.noon, place.timeZone)
  const times = useMemo(() => riseAndSet(place, night.noon), [place, night])
  const full = useMemo(() => fullMoonWords(night.noon, place.timeZone), [night, place.timeZone])
  const monthKey = night.year * 12 + night.month
  const [browse, setBrowse] = useState({ key: monthKey, year: night.year, month: night.month })

  if (browse.key !== monthKey) setBrowse({ key: monthKey, year: night.year, month: night.month })

  function turnMonth(direction) {
    setBrowse(current => {
      const date = new Date(Date.UTC(current.year, current.month - 1 + direction, 1))

      return { ...current, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
    })
  }

  const moveTo = (choose, glide) => setMove(current => {
    const target = choose(chosenIndex(sky.notches, sky.home, current.time))

    return { ...current, time: sky.notches[target].time, glide }
  })

  const step = direction => moveTo(from => Math.max(0, Math.min(sky.notches.length - 1, from + direction)), true)

  const stepNight = direction => moveTo(from => {
    const target = Math.max(0, Math.min(sky.nights.length - 1, sky.notches[from].night + direction))

    return sameTimeIndex(sky.notches, sky.nights, from, target)
  }, true)

  useNotchWheel(art, step)

  const home = () => setMove(current => ({ ...current, time: null, glide: false }))

  function homeFromArrow() {
    home()
    ruler.current.focus()
  }

  return (
    <Popover title="Moon" titleId="moon-title" link={links.moon} registerClose={registerClose}>
      {/* MOON */}

      <div className="moon-art">
        <span ref={art}><PhaseMoon angle={moon.angle} size={150} south={place.latitude < 0} /></span>
      </div>

      <div className="moon-title">
        <HomeArrow path={BACK} shown={index > sky.home} onClick={homeFromArrow} />
        <div>
          <p className="moon-phase">{phase}</p>
          <p className={`moon-night${notch.night === sky.tonight ? ' tonight' : ''}`}>{title.replace(/ (\d+)$/, '\u00a0$1')} at{'\u00a0'}{clock(notch.time, place.timeZone)}</p>
        </div>
        <HomeArrow path={AHEAD} shown={index < sky.home} onClick={homeFromArrow} />
      </div>



      {/* RULER */}

      <MoonRuler
        ref={ruler}
        notches={sky.notches}
        nights={sky.nights}
        tonightNight={sky.tonight}
        index={index}
        glide={move.glide}
        timeZone={place.timeZone}
        valueText={`${title}, ${clock(notch.time, place.timeZone)}, ${phase}, ${lit}% lit${notch.night === sky.tonight ? ', tonight' : ''}`}
        onMove={(target, glide) => moveTo(() => target, glide)}
        onStep={step}
        onNight={stepNight}
        onHome={home}
      />



      {/* ROWS */}

      <dl className="moon-rows">
        <div><dt>Lit</dt><dd>{lit}%</dd></div>
        <div><dt>Moonrise</dt><dd><TimeOrNone date={times.rise} timeZone={place.timeZone} /></dd></div>
        <div><dt>Moonset</dt><dd><TimeOrNone date={times.set} timeZone={place.timeZone} /></dd></div>
        <div><dt>Next full Moon</dt><dd>{full}</dd></div>
        <div><dt>Distance</dt><dd>{distanceWords(moon.km, place.country)}</dd></div>
      </dl>



      {/* CALENDAR */}

      <MoonCalendar
        nights={sky.nights}
        year={browse.year}
        month={browse.month}
        first={sky.nights[0]}
        last={sky.nights.at(-1)}
        selectedNight={notch.night}
        tonightNight={sky.tonight}
        south={place.latitude < 0}
        timeZone={place.timeZone}
        onMonth={turnMonth}
        onPick={pick => moveTo(from => sameTimeIndex(sky.notches, sky.nights, from, pick), false)}
      />



      {/* NOTE */}

      <div className="moon-note">
        <p><strong>Why does the Moon change shape?</strong></p>
        <p>The Sun always lights half of the Moon. As it circles Earth, we see more or less of that lit half.</p>
      </div>
    </Popover>
  )
}

export default MoonPanel
