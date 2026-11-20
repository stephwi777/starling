import { Fragment, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'
import { nightStart } from '../../sky/night.js'
import { panelNights } from '../../sky/panelNights.js'
import { darkSpan } from '../../sky/darkness.js'
import { STEP_COUNT, atWords, darkVerdict, hoursWords, moonTimes, skyPath, trulyDark } from '../../sky/darkPanel.js'
import { clock } from '../../sky/words.js'
import Popover from '../panel/Popover.jsx'
import NightStrip from '../panel/NightStrip.jsx'
import DarkChart from './DarkChart.jsx'
import './DarknessPanel.css'



// TIMES

const STEP = 10 * 60 * 1000

function time(date, timeZone) {
  return date ? clock(date, timeZone) : '—'
}

function span(from, to, timeZone) {
  return from && to ? `${clock(from, timeZone)}–${clock(to, timeZone)}` : '—'
}

function Value({ value, note }) {
  const shown = value === '—'
    ? <><span aria-hidden="true">—</span><span className="visually-hidden">None</span></>
    : value

  return <><dd>{shown}</dd>{note && <dd><small>{note}</small></dd>}</>
}



// CHART RANGE

function rangeOf(paths) {
  const all = paths.flatMap(path => path.sun)

  return { top: Math.max(...all) + 5, bottom: Math.min(...all) - 5 }
}



// DARKNESS PANEL

function DarknessPanel() {
  const { place, now, links, panelClose } = useOutletContext()
  const tz = place.timeZone
  const tonightNoon = nightStart(place, now).getTime()
  const { nights, tonight } = useMemo(() => panelNights(place, new Date(tonightNoon)), [place, tonightNoon])
  const paths = useMemo(() => nights.map(night => skyPath(night.observer, night.noon)), [nights])
  const range = useMemo(() => rangeOf(paths), [paths])

  const placeKey = `${place.latitude},${place.longitude}`
  const nowIndex = Math.max(0, Math.min(STEP_COUNT - 1, Math.round((now - tonightNoon) / STEP)))
  const [choice, setChoice] = useState({ place: placeKey, night: tonight, index: nowIndex })

  if (choice.place !== placeKey) setChoice({ place: placeKey, night: tonight, index: nowIndex })

  const night = nights[choice.night]
  const path = paths[choice.night]
  const windows = useMemo(() => trulyDark(night), [night])
  const verdict = darkVerdict(night, windows, tz)
  const dark = darkSpan(night)
  const lit = Math.round(night.moonLit * 100)
  const at = atWords(path.times[choice.index], path.sun[choice.index], path.moon[choice.index], tz)
  const trulyTotal = windows.reduce((sum, { from, to }) => sum + (to - from), 0)

  const clamp = (value, last) => Math.max(0, Math.min(last, value))
  const pickNight = target => setChoice(current => ({ ...current, night: clamp(target, nights.length - 1) }))
  const stepNight = direction => setChoice(current => ({ ...current, night: clamp(current.night + direction, nights.length - 1) }))
  const choose = index => setChoice(current => ({ ...current, index }))
  const step = direction => setChoice(current => ({ ...current, index: clamp(current.index + direction, STEP_COUNT - 1) }))

  return (
    <Popover title="Darkness" titleId="darkness-title" link={links.darkness} panelClose={panelClose}>
      {/* NIGHTS */}

      <NightStrip nights={nights} tonight={tonight} chosen={choice.night} timeZone={tz} onPick={pickNight} />



      {/* VERDICT */}

      <div className="dark-verdict">
        <p>{verdict.value}</p>
        <p>{verdict.line}</p>
      </div>



      {/* CHART */}

      <DarkChart
        path={path}
        range={range}
        lit={lit}
        chosen={choice.index}
        valueText={at}
        timeZone={tz}
        onChoose={choose}
        onStep={step}
        onNight={stepNight}
      />

      <p className="dark-at">
        {at.split(' · ').map((part, i) => <Fragment key={part}>{i > 0 && '\u00a0· '}<span>{part}</span></Fragment>)}
      </p>



      {/* ROWS */}

      <dl className="popover-rows">
        <div><dt>Sunset</dt><Value value={time(night.sunset, tz)} /></div>
        <div><dt>Evening twilight</dt><Value value={span(night.sunset, night.astroDusk, tz)} note={`Civil ${time(night.civilDusk, tz)} · Nautical ${time(night.nauticalDusk, tz)}`} /></div>
        <div><dt>Fully dark</dt><Value value={dark ? span(dark.from, dark.to, tz) : 'None'} note={dark && hoursWords(dark.to - dark.from)} /></div>
        <div><dt>Moon</dt><Value value={`${lit}% lit`} note={moonTimes(place, night.noon, tz)} /></div>
        <div><dt>Truly dark</dt><Value value={windows.length ? windows.map(({ from, to }) => span(from, to, tz)).join(', ') : 'None'} note={windows.length ? `${hoursWords(trulyTotal)}, no Sun or Moon` : dark && 'the Moon is up'} /></div>
        <div><dt>Morning twilight</dt><Value value={span(night.astroDawn, night.sunrise, tz)} note={`Nautical ${time(night.nauticalDawn, tz)} · Civil ${time(night.civilDawn, tz)}`} /></div>
        <div><dt>Sunrise</dt><Value value={time(night.sunrise, tz)} /></div>
      </dl>



      {/* NOTE */}

      <div className="popover-note">
        <p><strong>Why does the Moon matter?</strong></p>
        <p>Moonlight brightens the whole sky, just like twilight. Near full Moon only bright stars and planets stand out; the faint Milky Way and galaxies need the Moon down.</p>
      </div>
    </Popover>
  )
}

export default DarknessPanel
