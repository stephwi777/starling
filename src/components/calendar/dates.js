// DATES

export function eventDate(event) {
  const [year, month, day] = event.day.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(Date.UTC(year, month - 1, day))
}
