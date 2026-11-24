import { useSettings } from '../settings/useSettings.js'
import './RedLightSwitch.css'



// TINY SKY

const STARS = [
  { left: '16%', top: '30%' },
  { left: '30%', top: '66%' },
  { left: '64%', top: '34%' },
  { left: '80%', top: '68%' },
]



// RED LIGHT SWITCH

function RedLightSwitch() {
  const { light, setLight } = useSettings()
  const on = light === 'red'

  return (
    <button type="button" role="switch" aria-checked={on} className="red-switch" onClick={() => setLight(on ? 'normal' : 'red')}>
      <span>Red light</span>

      <span className="red-switch-sky" aria-hidden="true">
        <span key={light}>
          {STARS.map(star => <i key={star.left} style={star} />)}
        </span>

        <b />
      </span>
    </button>
  )
}

export default RedLightSwitch
