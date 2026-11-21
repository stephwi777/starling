import { usePlace } from '../place/usePlace.js'
import { useForecast } from '../sky/useForecast.js'
import { useSummary } from '../sky/useSummary.js'
import { useNow } from '../sky/useNow.js'
import { nightLook } from '../sky/skyLook.js'
import SkyScene from '../components/sky/SkyScene.jsx'
import Meteors from '../components/Meteors.jsx'
import PressButton from '../components/ui/PressButton.jsx'
import TonightCard from '../components/home/TonightCard.jsx'
import ComingUpCard from '../components/home/ComingUpCard.jsx'
import Doors from '../components/home/Doors.jsx'
import './Home.css'



// TIMING

const HOUR = 60 * 60 * 1000



// HOME

function Home() {
  const { place, isSample } = usePlace()
  const now = useNow()
  const forecast = useForecast(place, Math.floor(now.getTime() / HOUR))
  const sky = useSummary(place, forecast.raw, now)
  const look = nightLook({ moonAngle: sky.night.moonAngle, moonLit: sky.night.moonLit, south: place.latitude < 0 })

  return (
    <main className="home">



      {/* SKY */}

      <SkyScene look={look} size="tall" decor={<Meteors />}>
        <div className="hero">
          <h1>Meet tonight's sky</h1>
          <p>See what’s up there tonight, right where you’re standing. Just look up!</p>
          <PressButton to="/tonight">See tonight's sky</PressButton>
        </div>
      </SkyScene>



      {/* BELOW */}

      <div className="home-below">
        <div className="home-cards">
          <TonightCard sky={sky} place={place} isSample={isSample} status={forecast.status} />
          <ComingUpCard place={place} now={now} />
        </div>

        <Doors now={now} place={place} />
      </div>
    </main>
  )
}

export default Home
