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
      <path d={`M${x1} ${y1} L${(x2 + nx).toFixed(2)} ${(y2 + ny).toFixed(2)} L${(x2 - nx).toFixed(2)} ${(y2 - ny).toFixed(2)} Z`} fill={color} />
      <Dot x={x2} y={y2} r={width / 2} fill={color} />
    </>
  )
}

const STREAKS = [
  { from: [-3.6, -4.4], to: [8.6, 1.4], width: 3, color: 'var(--meteor-gold)' },
  { from: [-4.4, -3.4], to: [1.2, 9], width: 2.6, color: 'var(--meteor-rose)' },
  { from: [-3, -5.6], to: [6.4, -6.6], width: 2.2, color: 'var(--uranus)' },
  { from: [-5.6, -3], to: [-6.4, 4.8], width: 2, color: 'var(--meteor-lilac)' },
]



// SHOWER ICON

export function ShowerIcon() {
  return (
    <>
      {STREAKS.map(streak => <Streak key={streak.color} {...streak} />)}
      <Spark x={-6} y={-6} s={0.5} fill="var(--frost)" />
    </>
  )
}
