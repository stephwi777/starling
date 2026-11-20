// SETTINGS

const GAP = 14
const MARGIN = 16
const CORNER = 36



// HELPERS

function clamp(value, low, high) {
  return Math.min(Math.max(value, low), Math.max(low, high))
}



// PLACE

export function popoverPlace(tile, panel, viewport) {
  const room = { right: viewport.width - MARGIN - tile.right - GAP, left: tile.left - GAP - MARGIN }
  const side = room.right >= panel.width || room.right >= room.left ? 'right' : 'left'
  const wanted = side === 'right' ? tile.right + GAP : tile.left - GAP - panel.width
  const shown = Math.min(panel.height, viewport.height - 2 * MARGIN)
  const middle = (tile.top + tile.bottom) / 2
  const top = clamp(middle - shown / 2, MARGIN, viewport.height - MARGIN - shown)

  return {
    fits: Math.max(room.right, room.left) >= panel.width,
    side,
    left: clamp(wanted, MARGIN, viewport.width - MARGIN - panel.width),
    top,
    arrow: clamp(middle - top, CORNER, shown - CORNER),
  }
}
