import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import EventCard from './EventCard.jsx'



// HELPERS

const EVENT = {
  id: 'x',
  kinds: ['full-moon', 'supermoon'],
  group: 'moon',
  icon: 'full-moon',
  day: '2026-12-23',
  time: '7:29pm',
  here: true,
  tags: [],
  note: 'n',
  rows: [],
  name: 'Full Cold Moon',
  subjects: [{ key: 'full-moon', label: 'every Full Moon' }, { key: 'supermoon', label: 'every supermoon' }],
}

const KC = { name: 'Kansas City', latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }

function draw(favorites) {
  return renderToStaticMarkup(<EventCard event={EVENT} anchor={null} place={KC} today="2026-12-01" south={false} onClose={() => {}} favorites={favorites} onFavorite={() => {}} />)
}



// TESTS

test('an unstarred event offers its main subject', () => {
  const markup = draw([])

  expect(markup).toContain('aria-pressed="false"')
  expect(markup).toContain('aria-label="Favorite every Full Moon"')
  expect(markup).toContain('title="Favorite every Full Moon"')
  expect(markup).not.toContain('event-card-favorite')
})

test('a starred event shows a filled star and no extra line', () => {
  const markup = draw(['full-moon'])

  expect(markup).toContain('aria-pressed="true"')
  expect(markup).not.toContain('In your favorites')
})

test('an extra subject alone leaves the star off', () => {
  const markup = draw(['supermoon'])

  expect(markup).toContain('aria-pressed="false"')
  expect(markup).not.toContain('In your favorites')
})



test('the date and time share one line, with the time stressed', () => {
  expect(draw([])).toContain('<p>Wed, Dec 23 · <span class="event-card-time">7:29pm</span></p>')
})

test('a date in another year shows the year', () => {
  const later = renderToStaticMarkup(<EventCard event={{ ...EVENT, day: '2027-01-11' }} anchor={null} place={KC} today="2026-12-01" south={false} onClose={() => {}} favorites={[]} onFavorite={() => {}} />)

  expect(later).toContain('<p>Mon, Jan 11, 2027 · <span class="event-card-time">7:29pm</span></p>')
})

test('an event with no time shows the date alone', () => {
  const quiet = renderToStaticMarkup(<EventCard event={{ ...EVENT, time: '' }} anchor={null} place={KC} today="2026-12-01" south={false} onClose={() => {}} favorites={[]} onFavorite={() => {}} />)

  expect(quiet).toContain('<p>Wed, Dec 23</p>')
})

test('the status line starts closed but stays in place for screen readers', () => {
  expect(draw([])).toContain('<div class="event-card-status"><p role="status"></p></div>')
})



// RANGE

test('a card with a range tells screen readers which days are shaded', () => {
  const markup = renderToStaticMarkup(<EventCard event={{ ...EVENT, range: { from: '2027-07-17', to: '2027-08-24' } }} anchor={null} place={KC} today="2026-12-01" south={false} onClose={() => {}} favorites={[]} onFavorite={() => {}} />)

  expect(markup).toContain('<p class="visually-hidden">Jul 17–Aug 24 is shaded on the calendar.</p>')
})

test('a card without a range says nothing about shading', () => {
  expect(draw([])).not.toContain('shaded on the calendar')
})
