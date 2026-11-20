import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'
import { nightStart } from '../../sky/night.js'
import { cloudHours, cloudSummary, dewWords, hazeWords, transparencyWords } from '../../sky/cloudPanel.js'
import { panelNights, sameHour, startHour } from '../../sky/panelNights.js'
import { useAir } from '../../sky/useAir.js'
import { clock } from '../../sky/words.js'
import Popover from '../panel/Popover.jsx'
import NightStrip from '../panel/NightStrip.jsx'
import CloudChart from './CloudChart.jsx'
import './CloudsPanel.css'



// VALUES

function Value({ value, note }) {
  const shown = value === '—'
    ? <><span aria-hidden="true">—</span><span className="visually-hidden">Unknown</span></>
    : value

  return <><dd>{shown}</dd>{note && <dd><small>{note}</small></dd>}</>
}

function percent(value) {
  return value === null ? '—' : `${value}%`
}



// WORDS

const MIDNIGHT = 12 * 60 * 60 * 1000

function missing(status) {
  return status === 'loading'
    ? { kind: 'Loading', line: 'Getting the cloud forecast.' }
    : { kind: 'No forecast', line: 'It isn’t available for this night.' }
}



// CLOUDS PANEL

function CloudsPanel() {
  const { place, now, forecast, links, panelClose } = useOutletContext()
  const air = useAir(place)
  const tonightNoon = nightStart(place, now).getTime()
  const { nights, tonight } = useMemo(() => panelNights(place, new Date(tonightNoon)), [place, tonightNoon])

  const placeKey = `${place.latitude},${place.longitude}`
  const [choice, setChoice] = useState({ place: placeKey, night: tonight, offset: null })

  if (choice.place !== placeKey) setChoice({ place: placeKey, night: tonight, offset: null })

  const night = nights[choice.night]
  const hours = useMemo(() => cloudHours(night, forecast.raw, air.raw), [night, forecast.raw, air.raw])
  const indexFor = offset => (offset === null ? startHour(hours, now) : sameHour(offset, night, hours))
  const index = indexFor(choice.offset)
  const hour = hours[index]
  const offsetOf = i => (hours[i] ? hours[i].time - night.noon : MIDNIGHT)

  const pickNight = target => setChoice(current => ({
    ...current,
    night: Math.max(0, Math.min(nights.length - 1, target)),
    offset: current.offset ?? offsetOf(index),
  }))

  const stepNight = direction => setChoice(current => ({
    ...current,
    night: Math.max(0, Math.min(nights.length - 1, current.night + direction)),
    offset: current.offset ?? offsetOf(index),
  }))

  const choose = i => setChoice(current => ({ ...current, offset: offsetOf(i) }))

  const step = direction => setChoice(current => {
    const target = Math.max(0, Math.min(hours.length - 1, indexFor(current.offset) + direction))

    return { ...current, offset: offsetOf(target) }
  })

  const summary = hour ? cloudSummary(hour) ?? missing(forecast.status) : { kind: 'No night', line: 'The Sun doesn’t set this night.' }
  const unit = forecast.raw?.hourly_units?.temperature_2m ?? '°C'
  const layers = hour && hour.low !== null ? [`Low ${hour.low}%`, `Mid ${hour.mid}%`, `High ${hour.high}%`].join(' · ') : null
  const sky = hour && transparencyWords(hour)
  const dew = hour && dewWords(hour, unit)

  return (
    <Popover title="Clouds" titleId="clouds-title" link={links.clouds} panelClose={panelClose}>
      {/* NIGHTS */}

      <NightStrip nights={nights} tonight={tonight} chosen={choice.night} timeZone={place.timeZone} onPick={pickNight} />



      {/* CHART */}

      {hour && (
        <CloudChart
          hours={hours}
          chosen={index}
          valueText={`${clock(hour.time, place.timeZone)}, ${summary.kind}, ${percent(hour.cover)} cloud cover`}
          timeZone={place.timeZone}
          onChoose={choose}
          onStep={step}
          onNight={stepNight}
        />
      )}



      {/* VERDICT */}

      <div className="popover-verdict">
        <p>{summary.kind}</p>
        {hour && <p>at {clock(hour.time, place.timeZone)}</p>}
        <p>{summary.line}</p>
      </div>



      {/* ROWS */}

      {hour && (
        <dl className="popover-rows">
          <div><dt>Cloud cover</dt><Value value={percent(hour.cover)} note={layers} /></div>
          <div><dt>Transparency</dt><Value value={sky.value} note={sky.note} /></div>
          <div><dt>Dew risk</dt><Value value={dew.value} note={dew.note} /></div>
          <div><dt>Haze & smoke</dt><Value value={hazeWords(hour.aod, air.status)} /></div>
          <div><dt>Chance of rain</dt><Value value={percent(hour.rain)} /></div>
        </dl>
      )}



      {/* NOTE */}

      <div className="popover-note">
        <p><strong>What’s transparency?</strong></p>
        <p>How clear and dark the air itself is. Haze, smoke and damp air scatter light, washing out faint things like galaxies and the Milky Way, even with no clouds.</p>
      </div>
    </Popover>
  )
}

export default CloudsPanel
