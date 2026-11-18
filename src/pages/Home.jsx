import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePlace } from '../place/usePlace.js'
import { useForecast } from '../sky/useForecast.js'
import { useNight } from '../sky/useNight.js'
import { PRESETS, skyLook } from '../sky/skyLook.js'
import { daytimeLine, skyNow } from '../sky/skyNow.js'
import { skyWord } from '../sky/weather.js'
import SkyScene from '../components/sky/SkyScene.jsx'
import PressButton from '../components/ui/PressButton.jsx'
import TonightCard from '../components/home/TonightCard.jsx'
import ComingUpCard from '../components/home/ComingUpCard.jsx'
import Doors from '../components/home/Doors.jsx'
import './Home.css'



// SKY INPUTS

function skyInputs(place, now, raw, preset) {
  if (import.meta.env.DEV && PRESETS[preset]) return PRESETS[preset]

  return { ...skyNow(place, now, raw), isHome: true }
}



// HOME

function Home() {
  const { place } = usePlace()
  const [now] = useState(() => new Date())
  const [params] = useSearchParams()
  const forecast = useForecast(place)
  const sky = useNight(place, 0, forecast.raw, now)
  const look = skyLook(skyInputs(place, now, forecast.raw, params.get('sky')))
  const tonightWord = sky.clouds ? skyWord(sky.clouds) : null

  return (
    <main className="home">



      {/* SKY */}

      <SkyScene look={look} size="tall">
        <div className="hero">
          <h1>Meet tonight's sky</h1>
          <p>See what’s up there tonight, right where you’re standing. Just look up!</p>
          {look.phase === 'day' && sky.night.sunset && (
            <p className="daytime">{daytimeLine(sky.night.sunset, tonightWord, place.timeZone)}</p>
          )}
          <PressButton to="/tonight">See tonight's sky</PressButton>
        </div>
      </SkyScene>



      {/* BELOW */}

      <div className="home-below">
        <div className="home-cards">
          <TonightCard sky={sky} place={place} status={forecast.status} />
          <ComingUpCard now={now} timeZone={place.timeZone} />
        </div>

        <Doors />
      </div>
    </main>
  )
}

export default Home
