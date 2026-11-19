import { usePlace } from '../place/usePlace.js'
import { useNight } from '../sky/useNight.js'
import { useNow } from '../sky/useNow.js'
import useStickyHeads from '../hooks/useStickyHeads.js'
import { nightLook, phaseAngle } from '../sky/skyLook.js'
import SkyScene from '../components/sky/SkyScene.jsx'
import HoursCard from '../components/tonight/HoursCard.jsx'
import TonightTiles from '../components/tonight/TonightTiles.jsx'
import NightsCard from '../components/tonight/NightsCard.jsx'
import UpTonightCard from '../components/tonight/UpTonightCard.jsx'
import './Tonight.css'



// SKY

const LOOK = nightLook({ moonAngle: phaseAngle(0.53), moonLit: 0.53 })



// TONIGHT

function Tonight() {
  const { place } = usePlace()
  const now = useNow()
  const sky = useNight(place, 0, null, now)
  const below = useStickyHeads()

  return (
    <main className="tonight">
      <title>Tonight | Starling</title>



      {/* SKY */}

      <SkyScene look={LOOK} size="band">
        <div className="band-text">
          <h1>Tonight, Tuesday, November 17 · Kansas City</h1>
          <p className="verdict">Clear and dark from 6:36pm to 1am. Saturn is the brightest planet up.</p>
        </div>
      </SkyScene>



      {/* BELOW */}

      <div className="tonight-below" ref={below}>
        <HoursCard />
        <TonightTiles sky={sky} place={place} />

        <div className="tonight-cards">
          <NightsCard />
          <UpTonightCard />
        </div>

        <div className="veil" aria-hidden="true" />
      </div>
    </main>
  )
}

export default Tonight
