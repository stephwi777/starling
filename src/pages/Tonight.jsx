import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePlace } from '../place/usePlace.js'
import { longName } from '../place/placeNames.js'
import { useSettings } from '../settings/useSettings.js'
import { upcomingNights } from '../sky/night.js'
import { useNight } from '../sky/useNight.js'
import OptionSwitch from '../components/tonight/OptionSwitch.jsx'
import NightPicker from '../components/tonight/NightPicker.jsx'
import Glance from '../components/tonight/Glance.jsx'
import TimeRibbon from '../components/tonight/TimeRibbon.jsx'
import SkyDome from '../components/tonight/SkyDome.jsx'
import PickedObject from '../components/tonight/PickedObject.jsx'
import ObjectList from '../components/tonight/ObjectList.jsx'
import './Tonight.css'



// OPTIONS

const MODES = [
  { value: 'hobbyist', label: 'Hobbyist' },
  { value: 'advanced', label: 'Advanced' },
]

const LIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'red', label: 'Red light' },
]



// HELPERS

function startTime(sky) {
  if (sky.nowIndex !== null) return sky.nowIndex
  if (sky.best) return sky.best.from

  return Math.round(sky.night.times.length / 3)
}

function heading(night, nights, timeZone) {
  const date = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', month: 'long', day: 'numeric' }).format(nights[night].noon)

  return night === 0 ? `Tonight, ${date}` : date
}



// TONIGHT

function Tonight() {
  const { place, isSample, openPicker } = usePlace()
  const { mode, light, gear, setMode, setLight, setGear } = useSettings()
  const [now] = useState(() => new Date())
  const [params, setParams] = useSearchParams()
  const nights = useMemo(() => upcomingNights(place, now, 7), [place, now])
  const found = nights.findIndex(night => night.date === params.get('night'))
  const index = found === -1 ? 0 : found
  const sky = useNight(place, index, null, now)
  const timeZone = place.timeZone
  const key = `${index} ${place.latitude} ${place.longitude}`
  const [time, setTime] = useState({ key, at: null })
  const at = time.key === key && time.at !== null ? time.at : startTime(sky)
  const [picked, setPicked] = useState('Saturn')
  const everything = [sky.moon, ...sky.planets, ...sky.stars, ...sky.shapes, ...sky.deep, ...sky.showers]
  const chosen = everything.find(object => object.name === picked)

  const moveTo = next => setTime({ key, at: Math.max(0, Math.min(sky.night.times.length - 1, next)) })

  const pickNight = night => setParams(night.index === 0 ? {} : { night: night.date })

  return (
    <main className="tonight" data-mode={mode}>
      <title>Tonight | Starling</title>



      {/* INTRO */}

      <section className="intro">
        <div>
          <h1>
            {heading(index, nights, timeZone)} ·{' '}
            {isSample ? (
              <>
                {longName(place)}, the sample sky.{' '}
                <button type="button" className="text-button" onClick={openPicker}>Set your location</button>
              </>
            ) : longName(place)}
          </h1>
          <p className="verdict" aria-live="polite">{sky.verdict}</p>
        </div>

        <div className="settings">
          <OptionSwitch label="Detail" options={MODES} value={mode} onChange={setMode} />
          <OptionSwitch label="Screen" options={LIGHTS} value={light} onChange={setLight} />
        </div>
      </section>



      {/* NIGHTS */}

      <NightPicker nights={nights} index={index} words={{}} timeZone={timeZone} onPick={pickNight} />



      {/* GLANCE */}

      <Glance sky={sky} status="failed" timeZone={timeZone} />



      {/* TIME */}

      <TimeRibbon sky={sky} at={at} timeZone={timeZone} onTime={moveTo} />



      {/* WORK AREA */}

      <div className="work">
        <section className="sky-view box" aria-labelledby="dome-title">
          <h2 id="dome-title">Looking up</h2>
          <SkyDome sky={sky} at={at} gear={gear} picked={picked} timeZone={timeZone} />
          <div className="picked" aria-live="polite">
            <PickedObject object={chosen} sky={sky} at={at} timeZone={timeZone} />
          </div>
          <p className="tip">Hold this above your head with N toward north. East and west swap, just like the real sky.</p>
        </section>

        <ObjectList sky={sky} at={at} gear={gear} setGear={setGear} picked={picked} onPick={setPicked} timeZone={timeZone} />
      </div>
    </main>
  )
}

export default Tonight
