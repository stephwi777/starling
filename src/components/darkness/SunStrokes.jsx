import { sampleKind } from '../../sky/darkPanel.js'



// COLORS

const COLORS = {
  day: 'var(--beak)',
  twilight: 'var(--snow-shade)',
  moonlit: 'var(--moon)',
  dark: 'var(--teal)',
}



// RUNS

function runs(path, x, y) {
  const found = []

  path.sun.forEach((sun, i) => {
    const kind = sampleKind(sun, path.moon[i])
    const point = `${x(i).toFixed(1)} ${y(sun).toFixed(1)}`
    const last = found.at(-1)

    if (last?.kind === kind) {
      last.d += ` L${point}`
    } else {
      if (last) last.d += ` L${point}`
      found.push({ kind, d: `M${point}` })
    }
  })

  return found
}



// SUN STROKES

function SunStrokes({ path, x, y, width }) {
  return runs(path, x, y).map((run, i) => (
    <path key={i} d={run.d} fill="none" stroke={COLORS[run.kind]} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  ))
}

export default SunStrokes
