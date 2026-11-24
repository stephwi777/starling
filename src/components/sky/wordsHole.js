// SETTINGS

export const HOLE_PAD = { x: 20, y: 14 }



// HOLE

export function wordsHole(lines, scene) {
  return {
    left: Math.min(...lines.map(line => line.left)) - scene.left - HOLE_PAD.x,
    right: Math.max(...lines.map(line => line.right)) - scene.left + HOLE_PAD.x,
    top: Math.min(...lines.map(line => line.top)) - scene.top - HOLE_PAD.y,
    bottom: Math.max(...lines.map(line => line.bottom)) - scene.top + HOLE_PAD.y,
  }
}
