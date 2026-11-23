import { useSettings } from '../settings/useSettings.js'
import './RedLightSwitch.css'



// TINY SKY

const STARS = [
  { left: '22%', top: '30%' },
  { left: '40%', top: '64%' },
  { left: '60%', top: '26%' },
  { left: '76%', top: '60%' },
]



// RED LIGHT SWITCH

function RedLightSwitch() {
  const { light, setLight } = useSettings()
  const on = light === 'red'

  return (
    <button type="button" role="switch" aria-checked={on} className="red-switch" onClick={() => setLight(on ? 'normal' : 'red')}>
      <span>Red light</span>

      <span className="red-switch-track" aria-hidden="true">
        <span key={light}>
          {STARS.map(star => <i key={star.left} style={star} />)}
        </span>

        <svg className="red-switch-moon" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="14" />
          <circle cx="9.5" cy="10" r="3" />
          <circle cx="17.5" cy="17.5" r="4" />
          <circle cx="18" cy="7.5" r="1.6" />
        </svg>
      </span>
    </button>
  )
}

export default RedLightSwitch
