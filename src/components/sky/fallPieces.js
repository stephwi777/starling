// SETTINGS

const KINDS = {
  rain: { seed: 7, count: 52, shortest: 1.2, spread: 0.6, grow: 0 },
  snow: { seed: 11, count: 42, shortest: 9, spread: 5, grow: 5 },
}



// HELPERS

function seeded(seed) {
  let value = seed

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}



// PIECES

export function fallPieces(kind) {
  const { seed, count, shortest, spread, grow } = KINDS[kind]
  const random = seeded(seed)

  return Array.from({ length: count }, () => {
    const duration = shortest + random() * spread
    const left = random() * 100
    const delay = -random() * duration

    return { duration, left, delay, size: 5 + random() * 4 + grow }
  })
}
