import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'
import { nightStart } from '../../sky/night.js'
import { wholeHours } from '../../sky/hours.js'
import { nightWeather } from '../../sky/weather.js'
import { panelNights, sameHour, startHour } from '../../sky/panelNights.js'
import { SEEING, hourScore, seeingRows } from '../../sky/seeing.js'
import { clock } from '../../sky/words.js'
import Popover from '../panel/Popover.jsx'
import NightStrip from '../panel/NightStrip.jsx'
import SeeingChart from './SeeingChart.jsx'



// VALUES

function Value({ value, note }) {
  const shown = value === '—'
    ? <><span aria-hidden="true">—</span><span className="visually-hidden">Unknown</span></>
    : value

  return <dd>{shown}{note && <small>{note}</small>}</dd>
}



// HOURS

const MIDNIGHT = 12 * 60 * 60 * 1000

function seeingHours(night, raw) {
  const air = raw ? nightWeather(raw, night)?.air ?? null : null

  return wholeHours(night).map(({ hour, time, dark }) => ({ time, dark, air: air?.[hour] ?? null }))
}

function missing(status) {
  return status === 'loading'
    ? { value: 'Loading', line: 'Getting the seeing forecast.' }
    : { value: 'No forecast', line: 'It isn’t available for this hour.' }
}



// SEEING PANEL

function SeeingPanel() {
  const { place, now, forecast, links, panelClose } = useOutletContext()
  const tz = place.timeZone
  const tonightNoon = nightStart(place, now).getTime()
  const { nights, tonight } = useMemo(() => panelNights(place, new Date(tonightNoon)), [place, tonightNoon])

  const placeKey = `${place.latitude},${place.longitude}`
  const [choice, setChoice] = useState({ place: placeKey, night: tonight, offset: null })

  if (choice.place !== placeKey) setChoice({ place: placeKey, night: tonight, offset: null })

  const night = nights[choice.night]
  const hours = useMemo(() => seeingHours(night, forecast.raw), [night, forecast.raw])
  const indexFor = offset => (offset === null ? startHour(hours, now) : sameHour(offset, night, hours))
  const index = indexFor(choice.offset)
  const hour = hours[index]
  const offsetOf = i => (hours[i] ? hours[i].time - night.noon : MIDNIGHT)
  const clamp = (value, last) => Math.max(0, Math.min(last, value))

  const pickNight = target => setChoice(current => ({ ...current, night: clamp(target, nights.length - 1), offset: current.offset ?? offsetOf(index) }))
  const stepNight = direction => setChoice(current => ({ ...current, night: clamp(current.night + direction, nights.length - 1), offset: current.offset ?? offsetOf(index) }))
  const choose = i => setChoice(current => ({ ...current, offset: offsetOf(i) }))
  const step = direction => setChoice(current => ({ ...current, offset: offsetOf(clamp(indexFor(current.offset) + direction, hours.length - 1)) }))

  const level = hour?.air ? SEEING[hourScore(hour.air)] : null
  const verdict = hour ? level ?? missing(forecast.status) : { value: 'No night', line: 'The Sun doesn’t set this night.' }
  const rows = hour?.air ? seeingRows(hour.air, place.country) : null

  return (
    <Popover title="Seeing" titleId="seeing-title" link={links.seeing} panelClose={panelClose}>
      {/* NIGHTS */}

      <NightStrip nights={nights} tonight={tonight} chosen={choice.night} timeZone={tz} onPick={pickNight} />



      {/* CHART */}

      {hour && (
        <SeeingChart
          hours={hours}
          chosen={index}
          valueText={`${clock(hour.time, tz)}, ${verdict.value}`}
          timeZone={tz}
          onChoose={choose}
          onStep={step}
          onNight={stepNight}
        />
      )}



      {/* VERDICT */}

      <div className="popover-verdict">
        <p>{verdict.value}</p>
        {hour && <p>at {clock(hour.time, tz)}</p>}
        <p>{verdict.line}</p>
      </div>



      {/* ROWS */}

      {rows && (
        <dl className="popover-rows">
          <div><dt>High winds</dt><Value {...rows.jet} /></div>
          <div><dt>Air layers</dt><Value {...rows.layers} /></div>
          <div><dt>Ground wind</dt><Value {...rows.ground} /></div>
          <div><dt>Best for</dt><Value value={level.best} /></div>
        </dl>
      )}



      {/* NOTE */}

      <div className="popover-note">
        <p><strong>What is seeing?</strong></p>
        <p>How steady the air is. Shaky air makes stars twinkle and blurs planets in a telescope. It barely matters for stargazing with just your eyes.</p>
      </div>
    </Popover>
  )
}

export default SeeingPanel
