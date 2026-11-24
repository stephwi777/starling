// SETTINGS

const HALF_HOUR = 30 * 60 * 1000
const LIMIT = 75
const encoder = new TextEncoder()



// TEXT

function stamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function plain(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function fold(line) {
  const parts = []
  let rest = line
  let room = LIMIT

  while (encoder.encode(rest).length > room) {
    let cut = room

    while (encoder.encode(rest.slice(0, cut)).length > room) cut -= 1

    parts.push(rest.slice(0, cut))
    rest = rest.slice(cut)
    room = LIMIT - 1
  }

  return [...parts, rest].join('\r\n ')
}

function dateOnly(key, extra = 0) {
  const [year, month, day] = key.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day + extra)).toISOString().slice(0, 10).replace(/-/g, '')
}



// EVENT

function alarmLines(event, timed) {
  return [
    'BEGIN:VALARM',
    `TRIGGER:${timed ? '-PT1H' : '-PT6H'}`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${plain(event.name)}`,
    'END:VALARM',
  ]
}

function eventLines(event, { place, url, now, remind }) {
  const span = event.span ?? event.window
  const end = span && (span.to > span.from ? span.to : new Date(span.from.getTime() + HALF_HOUR))

  const details = [
    event.note,
    !event.here && event.where,
    ...event.rows.map(([label, value]) => `${label}: ${value}`),
    url,
  ].filter(Boolean)

  return [
    'BEGIN:VEVENT',
    `UID:${event.id.replace(/[^\w-]/g, '-')}@starling`,
    `DTSTAMP:${stamp(now)}`,
    ...(span
      ? [`DTSTART:${stamp(span.from)}`, `DTEND:${stamp(end)}`]
      : [`DTSTART;VALUE=DATE:${dateOnly(event.day)}`, `DTEND;VALUE=DATE:${dateOnly(event.day, 1)}`]),
    `SUMMARY:${plain([event.name, ...(event.tags ?? [])].join(', '))}`,
    `DESCRIPTION:${plain(details.join('\n'))}`,
    `LOCATION:${plain(place.name)}`,
    url && `URL:${url}`,
    'TRANSP:TRANSPARENT',
    ...(remind ? alarmLines(event, Boolean(span)) : []),
    'END:VEVENT',
  ].filter(Boolean)
}



// CALENDAR FILE

export function calendarFile(events, { place, linkFor = () => null, now = new Date(), remind = () => true }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Starling//Sky calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${plain(`Starling sky events, ${place.name}`)}`,
    ...events.flatMap(event => eventLines(event, { place, url: linkFor(event), now, remind: remind(event) })),
    'END:VCALENDAR',
  ]

  return `${lines.map(fold).join('\r\n')}\r\n`
}

export function fileName(text) {
  return `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.ics`
}
