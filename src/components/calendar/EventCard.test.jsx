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

test('a starred event says what it covers', () => {
  const markup = draw(['full-moon'])

  expect(markup).toContain('aria-pressed="true"')
  expect(markup).toContain('In your favorites: every Full Moon.')
})

test('an extra subject alone leaves the star off but is named', () => {
  const markup = draw(['supermoon'])

  expect(markup).toContain('aria-pressed="false"')
  expect(markup).toContain('In your favorites: every supermoon.')
})

test('both subjects are named together', () => {
  expect(draw(['full-moon', 'supermoon'])).toContain('In your favorites: every Full Moon and every supermoon.')
})

test('three favorites read as a list', () => {
  const blue = { ...EVENT, subjects: [...EVENT.subjects, { key: 'blue-moon', label: 'every Blue Moon' }] }
  const markup = renderToStaticMarkup(<EventCard event={blue} anchor={null} place={KC} today="2026-12-01" south={false} onClose={() => {}} favorites={['full-moon', 'supermoon', 'blue-moon']} onFavorite={() => {}} />)

  expect(markup).toContain('In your favorites: every Full Moon, every supermoon, and every Blue Moon.')
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
