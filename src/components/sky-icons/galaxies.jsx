import { Clipped, Dot, seeded } from './parts.jsx'



// ARMS

function arm(rotation) {
  const points = []

  for (let t = 0; t <= 1.1 * Math.PI * 2; t += 0.25) {
    const r = 1.6 * Math.exp(0.21 * t)

    if (r > 10.5) break

    points.push(`${(r * Math.cos(t + rotation)).toFixed(2)} ${(r * Math.sin(t + rotation)).toFixed(2)}`)
  }

  return `M${points.join(' L')}`
}

const SPIRAL_ARMS = [arm(0), arm(Math.PI)]



// SHAPES

const LENS = 'M-12 0 Q0 -4.4 12 0 Q0 4.4 -12 0 Z'

function EdgeOn() {
  return (
    <g transform="rotate(-24)">
      <path d={LENS} fill="var(--snow)" opacity="0.5" />
      <Clipped shape={<path d={LENS} />}>
        <ellipse rx="4.2" ry="2.4" fill="var(--frost)" />
        <path d="M-13 0.25 Q0 1.5 13 0.25" stroke="var(--raised)" strokeWidth="1.15" fill="none" />
      </Clipped>
    </g>
  )
}

function Elliptical({ ratio }) {
  const squash = ratio ? Math.max(0.55, Math.min(1, ratio / 0.71)) : 1

  return (
    <g transform={`rotate(-20) scale(1 ${squash.toFixed(2)})`}>
      <ellipse rx="10.5" ry="7.5" fill="var(--snow)" opacity="0.22" />
      <ellipse rx="7.5" ry="5.3" fill="var(--snow)" opacity="0.38" />
      <ellipse rx="4.4" ry="3.1" fill="var(--frost)" opacity="0.75" />
      <ellipse rx="2" ry="1.5" fill="var(--frost)" />
    </g>
  )
}

function Lenticular() {
  return (
    <g transform="rotate(-22)">
      <ellipse rx="11.5" ry="3.6" fill="var(--snow)" opacity="0.3" />
      <ellipse rx="7" ry="2.6" fill="var(--snow)" opacity="0.55" />
      <ellipse rx="3.2" ry="2" fill="var(--frost)" />
    </g>
  )
}

function Irregular({ id }) {
  const rand = seeded(id)
  const clumps = Array.from({ length: 6 }, () => [(rand() - 0.5) * 12, (rand() - 0.5) * 9, 2.6 + rand() * 3])
  const knots = Array.from({ length: 4 }, () => [(rand() - 0.5) * 11, (rand() - 0.5) * 8, 0.9 + rand() * 0.8])

  return (
    <>
      {clumps.map(([x, y, r], i) => <Dot key={`c${i}`} x={x} y={y} r={r} fill="var(--snow)" opacity={0.32} />)}
      {knots.map(([x, y, r], i) => <Dot key={`k${i}`} x={x} y={y} r={r} fill="var(--star-blue)" />)}
    </>
  )
}

function Spiral({ barred, ratio }) {
  const tilt = ratio ? Math.max(0.34, Math.min(1, ratio)) : 0.62

  return (
    <g transform={`rotate(-28) scale(1 ${tilt.toFixed(2)})`}>
      <Dot r={10.5} fill="var(--snow)" opacity={0.14} />
      {barred ? (
        <>
          <path d="M-4.6 0 L4.6 0" stroke="var(--frost)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M4.6 0 Q8.5 0 8.6 4.4 Q8.4 8.6 3 9.2" stroke="var(--snow)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M-4.6 0 Q-8.5 0 -8.6 -4.4 Q-8.4 -8.6 -3 -9.2" stroke="var(--snow)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
        </>
      ) : (
        SPIRAL_ARMS.map(d => <path key={d} d={d} stroke="var(--snow)" strokeWidth="2.1" fill="none" strokeLinecap="round" opacity="0.85" />)
      )}
      <Dot r={2.8} fill="var(--frost)" />
    </g>
  )
}



// GALAXY ICON

export function GalaxyIcon({ object }) {
  const ratio = object.size ? object.size[1] / object.size[0] : null
  const flat = ratio !== null && ratio < 0.3 && object.type !== 'elliptical' && object.type !== 'irregular'

  if (flat) return <EdgeOn />
  if (object.type === 'elliptical') return <Elliptical ratio={ratio} />
  if (object.type === 'lenticular') return <Lenticular />
  if (object.type === 'irregular') return <Irregular id={object.id} />

  return <Spiral barred={object.type === 'barred'} ratio={ratio} />
}
