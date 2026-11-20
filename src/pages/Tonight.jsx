import { useRef } from 'react'
import { Outlet, useMatch } from 'react-router'
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



// PANELS

const TITLES = { moon: 'Moon', clouds: 'Clouds', darkness: 'Darkness', seeing: 'Seeing', up: 'Up tonight' }



// TONIGHT

function Tonight() {
  const { place, isSample } = usePlace()
  const now = useNow()
  const forecast = useForecast(place, Math.floor(now.getTime() / HOUR))
  const sky = useNight(place, 0, forecast.raw, now)
  const below = useStickyHeads()
  const moonLink = useRef(null)
  const cloudsLink = useRef(null)
  const darknessLink = useRef(null)
  const seeingLink = useRef(null)
  const upLink = useRef(null)
  const panelClose = useRef(null)
  const panel = useMatch('/tonight/:panel')?.params.panel
  const links = { moon: moonLink, clouds: cloudsLink, darkness: darknessLink, seeing: seeingLink, up: upLink }
  const look = nightLook({ moonAngle: sky.night.moonAngle, moonLit: sky.night.moonLit, south: place.latitude < 0 })

  return (
    <main className="tonight">
      <title>{`${TITLES[panel] ?? 'Tonight'} | Starling`}</title>



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
        <HoursCard sky={sky} status={forecast.status} timeZone={place.timeZone} now={now} />
        <TonightTiles sky={sky} place={place} now={now} status={forecast.status} links={links} panelClose={panelClose} />

        <div className="tonight-cards">
          <NightsCard place={place} forecast={forecast} now={now} />
          <UpTonightCard sky={sky} place={place} link={links.up} panelClose={panelClose} />
        </div>

        <div className="veil" aria-hidden="true" />
      </div>



      {/* PANELS */}

      <Outlet context={{ place, now, sky, forecast, links, panelClose }} />
    </main>
  )
}

export default Tonight
