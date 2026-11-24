// FAVORITES

export function favoredSubjects(event, favorites) {
  return (event.subjects ?? []).filter(subject => favorites.includes(subject.key))
}

export function isFavorite(event, favorites) {
  return favoredSubjects(event, favorites).length > 0
}

export function favoriteNote(subject, adding) {
  return `${adding ? 'Added' : 'Removed'} ${subject.label}`
}
