import { useState } from 'react'
import { usePlace } from '../place/usePlace.js'
import { useForecast } from '../sky/useForecast.js'
import { useNight } from '../sky/useNight.js'
import { nightLook } from '../sky/skyLook.js'
import SkyScene from '../components/sky/SkyScene.jsx'
import Meteors from '../components/Meteors.jsx'
import PressButton from '../components/ui/PressButton.jsx'
import TonightCard from '../components/home/TonightCard.jsx'
import ComingUpCard from '../components/home/ComingUpCard.jsx'
import Doors from '../components/home/Doors.jsx'
import './Home.css'



// HOME

function Home() {
  const { place } = usePlace()
  const [now] = useState(() => new Date())
  const forecast = useForecast(place)
  const sky = useNight(place, 0, forecast.raw, now)
  const look = nightLook({ moonAngle: sky.night.moonAngle, moonLit: sky.night.moonLit })

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
          <TonightCard sky={sky} place={place} status={forecast.status} />
          <ComingUpCard now={now} timeZone={place.timeZone} />
        </div>

        <Doors now={now} place={place} />
      </div>
    </main>
  )
}

export default Home
