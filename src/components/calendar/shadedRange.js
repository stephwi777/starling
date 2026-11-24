// SHADED RANGE

export function shadedRange({ picked, dayEvents, narrow }) {
  const source = picked?.range ? picked : narrow ? dayEvents.find(event => event.range) : null

  return source ? { ...source.range, day: source.day, group: source.group } : null
}
