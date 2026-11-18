// SETTINGS

const MOST_STARS = 140
const WIDE = 1425
const PADDING = 14



// HELPERS

function isClear(x, y, boxes) {
  return !boxes.some(box =>
    x >= box.left - PADDING &&
    x <= box.right + PADDING &&
    y >= box.top - PADDING &&
    y <= box.bottom + PADDING
  )
}



// VISIBLE STARS

export function visibleStars(stars, field, boxes, amount = 1) {
  const count = Math.round(MOST_STARS * Math.min(1, field.width / WIDE) * amount)

  return stars
    .filter(star => isClear((star.left / 100) * field.width, (star.top / 100) * field.height, boxes))
    .slice(0, count)
}
