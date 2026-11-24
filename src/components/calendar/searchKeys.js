// KEYS

export function submits(event, query) {
  return event.key === 'Enter' && !event.isComposing && Boolean(query.trim())
}
