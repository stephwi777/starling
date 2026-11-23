import { Dot, Spark } from './parts.jsx'
import { TINTS } from './shapes.js'



// STAR

export function StarIcon({ tint, mag }) {
  const color = TINTS[tint] ?? 'var(--frost)'
  const size = mag < 1 ? 1 : mag < 2.5 ? 0.8 : 0.62

  return (
    <>
      {mag < 1 && <Dot r={10.5} fill={color} opacity={0.16} />}
      {mag < 1 && <Dot r={6.5} fill={color} opacity={0.22} />}
      {mag >= 1 && mag < 2.5 && <Dot r={6} fill={color} opacity={0.18} />}
      <Spark s={size} fill={color} />
    </>
  )
}



// DOUBLE

const WORDS = {
  gold: 'var(--meteor-gold)',
  blue: 'var(--neptune)',
  orange: 'var(--star-orange)',
  white: 'var(--frost)',
  yellow: 'var(--star-warm)',
  'yellow-white': 'var(--star-cream)',
  'blue-white': 'var(--star-icy)',
  red: 'var(--star-red)',
  green: 'var(--leaf)',
}

const DOUBLE_DOUBLE = [[-6, -4], [-3.6, -6.4], [4, 4.4], [6.6, 2.6]]
const TRAPEZIUM = { a: [-6.8, 0], b: [-3.8, 6.2], c: [2.2, -6], d: [8.4, 0.2] }

function Trapezium() {
  const { a, b, c, d } = TRAPEZIUM

  return (
    <>
      <path d={`M${a} L${c} L${d} L${b} Z`} fill="var(--meteor-rose)" opacity="0.12" stroke="var(--snow)" strokeWidth="0.8" strokeOpacity="0.45" strokeLinejoin="round" />
      {[[c, 0.42], [a, 0.36], [d, 0.33], [b, 0.28]].map(([[x, y], s]) => <Spark key={`${x}${y}`} x={x} y={y} s={s} fill="var(--star-icy)" />)}
    </>
  )
}

function Pair({ object }) {
  const words = object.colors ? object.colors.split(' and ').map(word => word.trim()) : []
  const partner = WORDS[words[1] ?? words[0]] ?? TINTS[object.tint] ?? 'var(--frost)'

  return (
    <>
      <g transform="translate(-2.6 2.4) scale(0.82)">
        <StarIcon tint={object.tint} mag={object.mag} />
      </g>
      <Spark x={7.4} y={-6.6} s={0.34} fill={partner} />
    </>
  )
}

export function DoubleIcon({ object }) {
  if (object.name === 'Trapezium') return <Trapezium />
  if (object.name === 'Double Double') return DOUBLE_DOUBLE.map(([x, y]) => <Spark key={`${x}${y}`} x={x} y={y} s={0.3} fill="var(--frost)" />)

  return <Pair object={object} />
}
