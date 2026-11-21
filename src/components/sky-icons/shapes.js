// SEEDED RANDOM

export function seeded(text) {
  let h = 2166136261

  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619)

  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16

    return (h >>> 0) / 4294967296
  }
}



// COLORS

export const TINTS = {
  'blue-white': 'var(--star-icy)',
  white: 'var(--frost)',
  'yellow-white': 'var(--star-cream)',
  yellow: 'var(--star-warm)',
  orange: 'var(--star-orange)',
  red: 'var(--star-red)',
}



// SPARK PATH

export function sparkPath(s) {
  return `M0 ${-9 * s} Q${1.6 * s} ${-1.6 * s} ${9 * s} 0 Q${1.6 * s} ${1.6 * s} 0 ${9 * s} Q${-1.6 * s} ${1.6 * s} ${-9 * s} 0 Q${-1.6 * s} ${-1.6 * s} 0 ${-9 * s} Z`
}




// SCATTER

export function scatter(id, count, radius, [smallest, largest]) {
  const rand = seeded(id)
  const dots = []
  let tries = 0

  while (dots.length < count && tries++ < 400) {
    const a = rand() * Math.PI * 2
    const r = Math.sqrt(rand()) * radius
    const x = r * Math.cos(a)
    const y = r * Math.sin(a)
    const size = smallest + rand() * (largest - smallest)

    if (dots.every(([dx, dy, ds]) => Math.hypot(dx - x, dy - y) > ds + size + 0.9)) dots.push([x, y, size])
  }

  return dots
}
