import { Dot } from './parts.jsx'



// FIGURE

function size(mag) {
  return Math.max(0.95, Math.min(2.2, 2.35 - 0.32 * mag))
}

export function FigureIcon({ figure }) {
  const busy = figure.stars.length > 9
  const brightest = figure.stars.reduce((best, star, i) => (star[2] < figure.stars[best][2] ? i : best), 0)
  const path = figure.lines.map(line => `M${line.map(([x, y]) => `${x} ${y}`).join(' L')}`).join(' ')

  return (
    <>
      <path d={path} fill="none" stroke="var(--snow)" strokeWidth={busy ? 1.05 : 1.25} strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
      {figure.stars.map(([x, y, mag], i) => (
        <Dot key={i} x={x} y={y} r={size(mag)} fill={i === brightest ? 'var(--beak)' : 'var(--frost)'} />
      ))}
    </>
  )
}
