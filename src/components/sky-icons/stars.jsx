import { Dot, Spark, TINTS } from './parts.jsx'



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

export function DoubleIcon({ object }) {
  if (object.name === 'Trapezium') return <Trapezium />
  if (object.name === 'Double Double') return DOUBLE_DOUBLE.map(([x, y]) => <Dot key={`${x}${y}`} x={x} y={y} r={2.1} fill="var(--frost)" />)

  if (!object.colors) {
    return (
      <>
        <Dot x={-2.5} r={2} fill="var(--star-warm)" />
        <Dot x={3} y={-1} r={1.5} fill="var(--star-blue)" />
      </>
    )
  }

  const words = object.colors.split(' and ').map(word => word.trim())
  const [first, second] = words.length > 1 ? words : [words[0], words[0]]
  const gap = object.apart > 200 ? 13 : object.apart > 20 ? 9.5 : 6.4
  const left = -gap / 2 - 0.6
  const right = gap / 2 + 0.8

  return (
    <>
      <Dot x={left} y={1.2} r={6.2} fill={WORDS[first] ?? 'var(--frost)'} opacity={0.18} />
      <Dot x={left} y={1.2} r={3.8} fill={WORDS[first] ?? 'var(--frost)'} />
      <Dot x={right} y={-1.4} r={2.6} fill={WORDS[second] ?? 'var(--frost)'} />
    </>
  )
}
