import { Dot, Spark } from './parts.jsx'
import { scatter, seeded } from './shapes.js'



// COLORS

const ROSE = 'var(--meteor-rose)'
const TEAL = 'var(--teal)'
const FROST = 'var(--frost)'
const HOLE = 'var(--zenith)'
const LANE = 'var(--raised)'



// CLOUD

function Cloud({ id, color, count = 5 }) {
  const rand = seeded(id)
  const puffs = Array.from({ length: count }, () => [(rand() - 0.5) * 10, (rand() - 0.5) * 8, 3.5 + rand() * 3.4, 0.22 + rand() * 0.2])

  return puffs.map(([x, y, r, opacity], i) => <Dot key={i} x={x} y={y} r={r} fill={color} opacity={Number(opacity.toFixed(2))} />)
}

function Stars({ points, r, fill }) {
  return points.map(([x, y]) => <Dot key={`${x}${y}`} x={x} y={y} r={r} fill={fill} />)
}



// SPECIAL SHAPES

function Coalsack() {
  return (
    <>
      {scatter('C99s', 26, 11, [0.4, 0.8]).map(([x, y, r], i) => <Dot key={i} x={x} y={y} r={r} fill={FROST} />)}
      <path d="M-6 -6 Q0 -9 5 -5 Q8 0 5 5 Q0 8 -5 5 Q-8 0 -6 -6 Z" fill={HOLE} />
    </>
  )
}

const TARANTULA_LEGS = [0, 1, 2, 3, 4, 5].map(i => `M0 0 Q${(Math.cos(i) * 5).toFixed(1)} ${(Math.sin(i) * 5).toFixed(1)} ${(Math.cos(i + 0.4) * 10).toFixed(1)} ${(Math.sin(i + 0.4) * 10).toFixed(1)}`)
const CRAB_THREADS = [0, 1, 2, 3, 4, 5, 6].map(i => `M${(Math.cos(i) * 2).toFixed(1)} ${(Math.sin(i) * 2).toFixed(1)} L${(Math.cos(i * 0.9) * 8).toFixed(1)} ${(Math.sin(i * 0.9) * 7).toFixed(1)}`)

const SPECIAL = {
  M42: () => (
    <>
      <path d="M-1 -10 Q-9 -6 -10 2 Q-8 9 -1 10 Q3 6 9 8 Q4 2 7 -3 Q2 -3 -1 -10 Z" fill={ROSE} opacity="0.42" />
      <path d="M-1 -5 Q-5 0 -2 5 Q2 3 3 -1 Q1 -3 -1 -5 Z" fill={ROSE} opacity="0.6" />
      <Stars points={[[0.2, -0.6], [1.4, 0.2], [0.4, 1], [1.6, -1.2]]} r={0.8} fill={FROST} />
    </>
  ),
  M20: () => (
    <>
      <circle cy="1.6" r="8" fill={ROSE} opacity="0.5" />
      <path d="M0 1.6 L0 -5.6 M0 1.6 L-6.3 5.3 M0 1.6 L6.3 5.3" stroke={LANE} strokeWidth="1.3" strokeLinecap="round" />
      <Dot y={1.6} r={1.1} fill={FROST} />
    </>
  ),
  M8: () => (
    <>
      <ellipse rx="11" ry="6.5" fill={ROSE} opacity="0.35" transform="rotate(-10)" />
      <ellipse cx="2" rx="6" ry="4" fill={ROSE} opacity="0.5" />
      <path d="M-9 -1 Q-3 2 2 -2" stroke={LANE} strokeWidth="1.6" fill="none" />
      <Stars points={[[-6, -3], [-4, -5], [-7, -1]]} r={0.9} fill={FROST} />
    </>
  ),
  M16: () => (
    <>
      <Cloud id="M16" color={ROSE} count={4} />
      <path d="M-4 9 L-4 -1 Q-4 -3 -2.6 -3 Q-1.6 -3 -1.6 -1 L-1.6 9 Z M1 9 L1 2 Q1 0.6 2.2 0.6 Q3.2 0.6 3.2 2 L3.2 9 Z" fill={LANE} />
    </>
  ),
  C20: () => (
    <>
      <path d="M-11 -4.6 L-8.6 -8 L-3 -9 L2.4 -8.6 L3.6 -6.4 L5 -8.2 L8.4 -6.6 L10.4 -2.8 L8.4 -0.4 L7.4 1.6 L7.6 4.4 L6.6 6.4 L5.4 4 L3.4 3.4 L1 3.8 L0.2 6 L2.8 9.6 L1.2 10.2 L-2 7 L-4.4 3.6 L-6.8 1 L-8.4 -2 Z" fill={ROSE} opacity="0.55" strokeLinejoin="round" />
      <path d="M-6 -5 L1 -6.4 L5 -4 L4 0 L-2 1.6 L-5.6 -1 Z" fill={ROSE} opacity="0.45" />
    </>
  ),
  C49: () => (
    <>
      <Cloud id="C49r" color={ROSE} count={6} />
      <circle r="8.6" fill={ROSE} opacity="0.3" />
      <circle cx="0.4" cy="-0.4" r="6" fill="var(--meteor-lilac)" opacity="0.35" />
      <path d="M-0.4 -3.6 Q3.4 -4.8 5.2 -1.8 Q5.8 1.6 2.8 2.4 Q-0.4 2.6 -1 -0.4 Q-1.4 -2.6 -0.4 -3.6 Z" fill={HOLE} opacity="0.7" />
      <path d="M-6.4 -2.2 Q-5 -3.8 -3.4 -2.6 Q-2.8 -0.8 -4.2 0 Q-6 0.2 -6.4 -2.2 Z" fill={HOLE} opacity="0.55" />
      <Stars points={[[1.6, -1.8], [3, -0.6], [2, 0.8], [0.6, -0.6], [3.4, -2.4]]} r={0.55} fill="var(--star-icy)" />
    </>
  ),
  C92: () => (
    <>
      <Cloud id="C92" color={ROSE} count={6} />
      <path d="M-2 -8 L-1 0 L-5 7" stroke={LANE} strokeWidth="2" fill="none" />
      <Dot x={2} y={-1} r={1.5} fill="var(--star-warm)" />
    </>
  ),
  C103: () => (
    <>
      <Cloud id="C103" color={ROSE} count={4} />
      {TARANTULA_LEGS.map(d => <path key={d} d={d} stroke={ROSE} strokeWidth="1.4" fill="none" opacity="0.75" />)}
    </>
  ),
  M1: () => (
    <>
      <path d="M-9 -3 Q-6 -9 1 -8 Q8 -8 9 -1 Q10 6 3 8 Q-5 9 -8 4 Q-11 1 -9 -3 Z" fill="var(--star-orange)" opacity="0.3" />
      {CRAB_THREADS.map(d => <path key={d} d={d} stroke={ROSE} strokeWidth="1" opacity="0.8" />)}
      <Dot r={3} fill="var(--star-blue)" opacity={0.55} />
    </>
  ),
  C99: Coalsack,
  C27: () => (
    <>
      <path d="M-6 -7.4 Q4 -9.6 8 -2 Q9.6 5.6 2 8.6 Q6 3.4 4.4 -1.6 Q2.6 -6.4 -6 -7.4 Z" fill={ROSE} opacity="0.7" />
      <path d="M-7 -4 Q-2 -6 2 -3.6" stroke={ROSE} strokeWidth="1.2" fill="none" opacity="0.45" />
      <Dot x={-0.8} y={0.6} r={1.1} fill={FROST} />
    </>
  ),
  C11: () => (
    <>
      <circle cx="0.6" cy="0.6" r="9.4" fill={TEAL} opacity="0.1" />
      <circle cx="0.6" cy="0.6" r="8.2" fill="var(--neptune)" opacity="0.26" />
      <circle cx="0.6" cy="0.6" r="8.2" fill="none" stroke="var(--uranus)" strokeWidth="1.4" opacity="0.8" />
      <path d="M-0.6 -4.6 Q0.6 -6.6 2.6 -6.8 Q1.6 -5 2.4 -2.8" stroke="var(--star-orange)" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.8" />
      <Spark x={-3.2} y={-2.4} s={0.34} fill={FROST} />
    </>
  ),
  M27: () => (
    <>
      <ellipse rx="9.5" ry="8" fill={TEAL} opacity="0.22" />
      <path d="M-7 -7 L0 -1.5 L7 -7 L7 7 L0 1.5 L-7 7 Z" fill={TEAL} opacity="0.6" transform="rotate(90) scale(.9)" />
      <Dot r={1.2} fill={FROST} />
    </>
  ),
  M57: () => (
    <>
      <ellipse rx="8.5" ry="6.5" fill="none" stroke={TEAL} strokeWidth="3.2" />
      <ellipse rx="10" ry="8" fill="none" stroke={ROSE} strokeWidth="1" opacity="0.55" />
      <Dot r={0.9} fill={FROST} />
    </>
  ),
  M97: () => (
    <>
      <circle r="9" fill={TEAL} opacity="0.42" />
      <Dot x={-3.2} y={-0.6} r={2.3} fill={LANE} />
      <Dot x={3.2} y={-0.6} r={2.3} fill={LANE} />
    </>
  ),
  C63: () => (
    <>
      <path d="M-11.6 0.4 Q-5.6 -8.8 1.2 -8.6 Q8.6 -8 11.6 -0.4 Q7 8.6 -0.8 8.6 Q-8.6 8 -11.6 0.4 Z" fill="var(--star-orange)" opacity="0.6" />
      <circle r="5.8" fill="var(--meteor-gold)" />
      <circle r="4.4" fill="var(--star-icy)" />
      <circle r="2.2" fill="var(--neptune)" />
    </>
  ),
  C56: () => (
    <>
      <ellipse rx="8.8" ry="7.4" fill={TEAL} opacity="0.16" transform="rotate(-15)" />
      <ellipse rx="7.6" ry="6.2" fill="none" stroke={TEAL} strokeWidth="1.6" opacity="0.55" transform="rotate(-15)" />
      <path d="M-6.6 -2.6 Q-6 -5.6 -3 -6.4 M5 4.8 Q7.2 2.6 7.2 -0.6 M-2.2 6.4 Q0.4 7 2.6 6.2" stroke={TEAL} strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.85" />
      <Dot x={-0.4} y={0.2} r={1.1} fill={FROST} />
      <Dot x={0.9} y={-0.6} r={0.6} fill="var(--star-warm)" />
    </>
  ),
  C6: () => (
    <>
      <ellipse rx="5" ry="7.5" fill={TEAL} opacity="0.35" transform="rotate(35)" />
      <ellipse rx="3.2" ry="5.2" fill="none" stroke="var(--leaf)" strokeWidth="1.5" transform="rotate(-25)" />
      <Dot r={1} fill={FROST} />
    </>
  ),
  C55: () => (
    <>
      <ellipse rx="6.5" ry="4.6" fill={TEAL} opacity="0.65" />
      <path d="M-11 0 L-6.5 0 M6.5 0 L11 0" stroke={TEAL} strokeWidth="1.6" strokeLinecap="round" />
      <Dot r={1} fill={FROST} />
    </>
  ),
  C39: () => (
    <>
      <circle r="8.6" fill={TEAL} opacity="0.3" />
      <circle r="4.6" fill="var(--star-blue)" opacity="0.6" />
      <Dot r={1.4} fill={FROST} />
    </>
  ),
  C69: () => (
    <>
      <g transform="rotate(-52)">
        <path d="M0 0 Q4 -2.6 9 -4.6 Q12 -1 10.2 4.2 Q5 3.4 0 0 Z M0 0 Q-4 2.6 -9 4.6 Q-12 1 -10.2 -4.2 Q-5 -3.4 0 0 Z" fill="var(--star-orange)" opacity="0.55" />
        <path d="M0 0 Q3.5 -1.6 7.4 -2.4 Q8.8 0 7.6 2.4 Q3.6 2 0 0 Z M0 0 Q-3.5 1.6 -7.4 2.4 Q-8.8 0 -7.6 -2.4 Q-3.6 -2 0 0 Z" fill={ROSE} opacity="0.8" />
        <path d="M0 0 Q2.6 -0.8 5 -0.8 Q5.4 0.4 4.6 1.2 Q2.2 0.8 0 0 Z M0 0 Q-2.6 0.8 -5 0.8 Q-5.4 -0.4 -4.6 -1.2 Q-2.2 -0.8 0 0 Z" fill={FROST} opacity="0.75" />
      </g>
      <Dot r={1.1} fill={FROST} />
    </>
  ),
}



// FAMILIES

const REMNANT_ARCS = [0, 1, 2].map(i => ({
  d: `M${-9 + i * 2} ${7 - i * 4} Q${-2 + i} ${-6 + i * 2} ${8 - i} ${-8 + i * 5}`,
  color: i === 1 ? TEAL : ROSE,
  width: 1.6 - i * 0.3,
}))

function Remnant() {
  return REMNANT_ARCS.map(({ d, color, width }) => <path key={d} d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" opacity="0.85" />)
}

function Reflection({ id }) {
  return (
    <>
      <Cloud id={id} color="var(--star-blue)" count={4} />
      <Spark s={0.5} fill={FROST} />
    </>
  )
}

function Glowing({ id }) {
  return (
    <>
      <Cloud id={id} color={ROSE} />
      <Dot x={0.6} y={-0.4} r={1.2} fill={FROST} opacity={0.9} />
    </>
  )
}

function Shell() {
  return (
    <>
      <circle r="7" fill={TEAL} opacity="0.28" />
      <circle r="6" fill="none" stroke={TEAL} strokeWidth="2.6" />
      <Dot r={1.1} fill={FROST} />
    </>
  )
}



// NEBULA ICON

export function NebulaIcon({ object }) {
  const Special = SPECIAL[object.id]

  if (Special) return <Special />
  if (object.kind === 'planetary') return <Shell />
  if (object.type === 'reflection') return <Reflection id={object.id} />
  if (object.type === 'dark') return <Coalsack />
  if (object.type === 'remnant') return <Remnant />

  return <Glowing id={object.id} />
}
