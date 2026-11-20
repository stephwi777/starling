import { Dot, Spark } from './parts.jsx'



// STREAK

function Streak({ from, to, width, color }) {
  const [x1, y1] = from
  const [x2, y2] = to
  const length = Math.hypot(x2 - x1, y2 - y1)
  const nx = (-(y2 - y1) / length) * (width / 2)
  const ny = ((x2 - x1) / length) * (width / 2)

  return (
    <>
      <path d={`M${x1} ${y1} L${(x2 + nx).toFixed(2)} ${(y2 + ny).toFixed(2)} L${(x2 - nx).toFixed(2)} ${(y2 - ny).toFixed(2)} Z`} fill={color} opacity="0.85" />
      <Dot x={x2} y={y2} r={width / 2} fill={color} />
    </>
  )
}

const STREAKS = [
  { from: [-3.6, -4.4], to: [8.6, 1.4], width: 2.4, color: 'var(--meteor-gold)' },
  { from: [-4.4, -3.4], to: [1.2, 9], width: 2, color: 'var(--meteor-rose)' },
  { from: [-3, -5.6], to: [6.4, -6.6], width: 1.6, color: 'var(--uranus)' },
  { from: [-5.6, -3], to: [-6.4, 4.8], width: 1.4, color: 'var(--meteor-lilac)' },
]



// SHOWER ICON

export function ShowerIcon() {
  return (
    <>
      <Dot x={-6.5} y={-6.5} r={3.2} fill="var(--frost)" opacity={0.14} />
      <Spark x={-6.5} y={-6.5} s={0.26} fill="var(--frost)" />
      {STREAKS.map(streak => <Streak key={streak.color} {...streak} />)}
    </>
  )
}
