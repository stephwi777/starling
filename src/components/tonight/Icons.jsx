// MOON

export function MoonShape({ angle, r = 10, shadow = 'var(--moon-dark)' }) {
  const lit = (1 - Math.cos((angle * Math.PI) / 180)) / 2
  const waxing = angle < 180
  const rx = r * Math.abs(1 - 2 * lit)
  const outer = waxing ? 1 : 0
  const inner = lit < 0.5 ? 1 - outer : outer

  return (
    <>
      <circle r={r} fill={shadow} />
      <path d={`M0 ${-r} A${r} ${r} 0 0 ${outer} 0 ${r} A${rx} ${r} 0 0 ${inner} 0 ${-r} Z`} fill="var(--moon)" />
    </>
  )
}
