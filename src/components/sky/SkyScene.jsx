import Stars from '../Stars.jsx'
import Moon from './Moon.jsx'
import Clouds from './Clouds.jsx'
import Ground from './Ground.jsx'
import './SkyScene.css'



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



// SKY SCENE

function SkyScene({ look, size, children }) {
  const day = look.phase === 'day'

  return (
    <section
      className={`sky-scene ${size} ${look.phase}`}
      style={{ '--sky-top': look.colors.top, '--sky-middle': look.colors.middle, '--sky-low': look.colors.low }}
    >
      <Stars amount={look.stars} />
      {look.sun && <Sun />}
      {look.moon && <Moon className={day ? 'moon pale' : 'moon'} angle={look.moon.angle} halo={look.moon.halo && !day} pale={day} />}
      <Clouds level={look.clouds} day={day} />
      <div className="sky-content">{children}</div>
      <Ground size={size} snow={look.snow} />
    </section>
  )
}

export default SkyScene
