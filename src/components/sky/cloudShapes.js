// SHAPES

export const SHAPES = {
  wide: [[38, 54, 16], [66, 42, 24], [104, 34, 30], [142, 44, 22], [170, 56, 14]],
  tall: [[44, 52, 18], [84, 32, 30], [122, 46, 22], [152, 58, 12]],
  long: [[33, 60, 10], [52, 52, 16], [84, 46, 20], [118, 50, 18], [146, 54, 16], [164, 60, 10]],
  hump: [[51, 55, 15], [80, 52, 18], [120, 38, 26], [152, 54, 16]],
  small: [[54, 56, 14], [86, 44, 22], [116, 56, 14]],
}

const BOTTOM = 70
const SAMPLE = 0.5



// EDGES

function reach([cx, , r], x) {
  return Math.sqrt(Math.max(r * r - (x - cx) ** 2, 0))
}

export function topAt(bumps, x) {
  const tops = bumps.filter(([cx, , r]) => Math.abs(x - cx) <= r).map(bump => bump[1] - reach(bump, x))

  return tops.length ? Math.min(...tops) : null
}

export function bottomAt(bumps, x) {
  const first = bumps[0]
  const last = bumps.at(-1)

  if (x < first[0]) return Math.min(BOTTOM, first[1] + reach(first, x))
  if (x > last[0]) return Math.min(BOTTOM, last[1] + reach(last, x))

  return BOTTOM
}



// PATH

export function cloudPath(bumps) {
  const start = bumps[0][0] - bumps[0][2]
  const end = bumps.at(-1)[0] + bumps.at(-1)[2]
  const xs = Array.from({ length: Math.ceil((end - start) / SAMPLE) + 1 }, (_, i) => Math.min(start + i * SAMPLE, end))
  const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`

  return `M${xs.map(x => point(x, topAt(bumps, x))).join(' L')} L${xs.toReversed().map(x => point(x, bottomAt(bumps, x))).join(' L')} Z`
}

export const CLOUD_PATHS = Object.fromEntries(Object.entries(SHAPES).map(([name, bumps]) => [name, cloudPath(bumps)]))
