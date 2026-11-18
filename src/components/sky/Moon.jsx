import { MoonShape } from '../tonight/Icons.jsx'



// MOON

function Moon({ angle, halo, pale, className }) {
  return (
    <svg className={className} viewBox="-60 -60 120 120" aria-hidden="true">
      {halo && (
        <>
          <circle r="150" fill="var(--moon)" opacity="0.06" />
          <circle r="92" fill="var(--moon)" opacity="0.1" />
        </>
      )}
      <g opacity={pale ? 0.65 : 1}>
        <MoonShape angle={angle} r={56} />
      </g>
    </svg>
  )
}

export default Moon
