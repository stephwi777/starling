import { expect, test } from 'vitest'
import { calendarFile, fileName } from './ics.js'



// HELPERS

const PLACE = { name: 'Kansas City, MO' }
const NOW = new Date('2026-11-20T12:00:00Z')

const timed = {
  id: 'lunar-eclipse-1772519640000',
  day: '2026-03-03',
  name: 'Total lunar eclipse',
  note: 'Earth’s shadow covers the whole Moon; safe to watch.',
  here: true,
  where: null,
  rows: [['Totality', '5:04am–6:03am']],
  span: { from: new Date('2026-03-03T08:44:00Z'), to: new Date('2026-03-03T14:23:00Z') },
}

const allDay = { id: 'season-1798000000000', day: '2026-12-21', name: 'December solstice', note: 'Longest night of the year.', here: true, where: null, rows: [] }

const file = (events, options = {}) => calendarFile(events, { place: PLACE, now: NOW, ...options })



// TESTS

test('a calendar file wraps its events with the standard header and footer', () => {
  const text = file([allDay])

  expect(text.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true)
  expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true)
  expect(text).toContain('X-WR-CALNAME:Starling sky events\\, Kansas City\\, MO')
})

test('timed events keep their start and end in UTC', () => {
  const text = file([timed])

  expect(text).toContain('DTSTART:20260303T084400Z')
  expect(text).toContain('DTEND:20260303T142300Z')
  expect(text).toContain('SUMMARY:Total lunar eclipse')
})

test('events without times become all-day entries', () => {
  const text = file([allDay])

  expect(text).toContain('DTSTART;VALUE=DATE:20261221')
  expect(text).toContain('DTEND;VALUE=DATE:20261222')
})

test('details, places and links are escaped and included', () => {
  const text = file([timed], { linkFor: () => 'https://example.com/calendar?event=1' }).replace(/\r\n /g, '')

  expect(text).toContain('DESCRIPTION:Earth’s shadow covers the whole Moon\\; safe to watch.\\nTotality: 5:04am–6:03am\\nhttps://example.com/calendar?event=1')
  expect(text).toContain('URL:https://example.com/calendar?event=1')
})

test('long lines fold at 75 bytes', () => {
  const long = { ...allDay, note: 'A'.repeat(200) }

  expect(file([long]).split('\r\n').every(line => new TextEncoder().encode(line).length <= 75)).toBe(true)
})

test('file names are tidy', () => {
  expect(fileName('Geminids peak, 2026')).toBe('geminids-peak-2026.ics')
})



// REMINDERS

test('a timed event reminds you an hour before it starts', () => {
  const text = file([timed])

  expect(text).toContain('BEGIN:VALARM')
  expect(text).toContain('TRIGGER:-PT1H')
  expect(text).toContain('ACTION:DISPLAY')
  expect(text).toContain('END:VALARM')
})

test('an all-day event reminds you at 6pm the evening before', () => {
  expect(file([allDay])).toContain('TRIGGER:-PT6H')
})

test('reminders can be left out', () => {
  expect(file([timed, allDay], { remind: () => false })).not.toContain('VALARM')
})

test('only the chosen events get reminders', () => {
  const text = file([timed, allDay], { remind: event => event.id === timed.id })

  expect(text.match(/BEGIN:VALARM/g)).toHaveLength(1)
  expect(text).toContain('TRIGGER:-PT1H')
  expect(text).not.toContain('TRIGGER:-PT6H')
})
