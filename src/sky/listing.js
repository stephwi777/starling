// FILTER

function matchesQuery(object, query) {
  const text = `${object.name} ${object.id ?? ''} ${object.con ?? ''}`.toLowerCase()

  return text.includes(query.trim().toLowerCase())
}

export function filterObjects(list, { query, show, gear, at, sun }) {
  return list.filter(object => {
    if (!matchesQuery(object, query)) return false
    if (object.gear > gear) return false
    if (show === 'now') return object.track[at].alt > 0 && sun[at] < -6
    if (show === 'tonight') return object.visible

    return true
  })
}



// SORT

function ease(object) {
  return object.gear * 4 + object.mag - object.track[object.bestIndex].alt / 40
}

export function sortEasiest(list) {
  return [...list].sort((a, b) => ease(a) - ease(b))
}
