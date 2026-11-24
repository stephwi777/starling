import { useEffect, useState } from 'react'
import Stars from '../Stars.jsx'
import Moon from './Moon.jsx'
import Clouds from './Clouds.jsx'
import Falling from './Falling.jsx'
import Ground from './Ground.jsx'
import { lookKey } from '../../sky/skyLook.js'
import './SkyScene.css'



// TIMING

const FADE = 2000



// SUN

function Sun() {
  return (
    <svg className="sun" viewBox="-60 -60 120 120" aria-hidden="true">
      <circle r="110" fill="var(--beak)" opacity="0.08" />
      <circle r="80" fill="var(--beak)" opacity="0.12" />
      <circle r="44" fill="var(--beak)" />
    </svg>
  )
}



// SKY LAYER

function colorsOf(look) {
  return { '--sky-top': look.colors.top, '--sky-middle': look.colors.middle, '--sky-low': look.colors.low }
}

function SkyLayer({ look, decor, leaving }) {
  const day = look.phase === 'day'

  return (
    <div className={leaving ? `sky-layer ${look.phase} leaving` : `sky-layer ${look.phase}`} style={colorsOf(look)}>
      <Stars amount={look.stars} />
      {decor}
      {look.sun && <Sun />}
      {look.moon && <Moon className={day ? 'moon pale' : 'moon'} angle={look.moon.angle} south={look.moon.south} halo={look.moon.halo && !day} pale={day} />}
      <Clouds level={look.clouds} />
      {look.fall && <Falling kind={look.fall} />}
    </div>
  )
}



// FADE

function calm() {
  return document.documentElement.classList.contains('still') || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useLookFade(look) {
  const key = lookKey(look)
  const [shown, setShown] = useState({ key, look })
  const [leaving, setLeaving] = useState(null)

  if (shown.key !== key) {
    setLeaving(calm() ? null : shown)
    setShown({ key, look })
  }

  useEffect(() => {
    if (!leaving) return

    const timer = setTimeout(() => setLeaving(null), FADE)

    return () => clearTimeout(timer)
  }, [leaving])

  return leaving
}



// SKY SCENE

function SkyScene({ look, size, decor, children }) {
  const leaving = useLookFade(look)

  return (
    <section className={`sky-scene ${size} ${look.phase}`} style={colorsOf(look)}>
      <SkyLayer look={look} decor={decor} />
      {leaving && <SkyLayer key={leaving.key} look={leaving.look} leaving />}
      <div className="sky-content">{children}</div>
      <Ground size={size} snow={look.snow} />
    </section>
  )
}

export default SkyScene
