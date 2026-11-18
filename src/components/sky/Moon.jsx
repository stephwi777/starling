import { useId } from 'react'
import { MoonShape } from '../tonight/Icons.jsx'



// MOON

function Moon({ angle, halo, pale, className }) {
  const glow = useId()

  return (
    <svg className={className} viewBox="-60 -60 120 120" aria-hidden="true">
      {halo && (
        <>
          <defs>
            <radialGradient id={glow}>
              <stop offset="40%" stopColor="var(--moon)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--moon)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="110" fill={`url(#${glow})`} />
        </>
      )}
      <g opacity={pale ? 0.65 : 1}>
        <MoonShape angle={angle} r={56} />
      </g>
    </svg>
  )
}

export default Moon
