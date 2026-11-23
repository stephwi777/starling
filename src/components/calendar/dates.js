// DATES

export function eventDate(event) {
  const [year, month, day] = event.day.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(Date.UTC(year, month - 1, day))
}

export function shortDate(event, today) {
  const [year, month, day] = event.day.split('-').map(Number)
  const options = { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: today?.startsWith(`${year}-`) ? undefined : 'numeric' }

  return new Intl.DateTimeFormat('en-US', options).format(Date.UTC(year, month - 1, day))
}
