import { usePlace } from '../place/usePlace.js'
import { useForecast } from '../sky/useForecast.js'
import { useNight } from '../sky/useNight.js'
import { useNow } from '../sky/useNow.js'
import useStickyHeads from '../hooks/useStickyHeads.js'
import { nightLook } from '../sky/skyLook.js'
import { dayName } from '../sky/words.js'
import SkyScene from '../components/sky/SkyScene.jsx'
import HoursCard from '../components/tonight/HoursCard.jsx'
import TonightTiles from '../components/tonight/TonightTiles.jsx'
import NightsCard from '../components/tonight/NightsCard.jsx'
import UpTonightCard from '../components/tonight/UpTonightCard.jsx'
import './Tonight.css'



// TIMING

const HOUR = 60 * 60 * 1000



// TONIGHT

function Tonight() {
  const { place, isSample } = usePlace()
  const now = useNow()
  const forecast = useForecast(place, Math.floor(now.getTime() / HOUR))
  const sky = useNight(place, 0, forecast.raw, now)
  const below = useStickyHeads()
  const look = nightLook({ moonAngle: sky.night.moonAngle, moonLit: sky.night.moonLit, south: place.latitude < 0 })

  return (
    <main className="tonight">
      <title>Tonight | Starling</title>



      {/* SKY */}

      <SkyScene look={look} size="band">
        <div className="band-text">
          <h1>
            <span className="visually-hidden">Tonight in </span>
            <span className="band-title">{place.name}</span>
            <span>{dayName(sky.night.noon, place.timeZone)}{isSample && ' · sample location'}</span>
          </h1>
          <p className="band-line" aria-live="polite">{sky.summary}</p>
        </div>
      </SkyScene>



      {/* BELOW */}

      <div className="tonight-below" ref={below}>
        <HoursCard sky={sky} status={forecast.status} timeZone={place.timeZone} />
        <TonightTiles sky={sky} place={place} status={forecast.status} />

        <div className="tonight-cards">
          <NightsCard place={place} forecast={forecast} now={now} />
          <UpTonightCard sky={sky} place={place} />
        </div>

        <div className="veil" aria-hidden="true" />
      </div>
    </main>
  )
}

export default Tonight
