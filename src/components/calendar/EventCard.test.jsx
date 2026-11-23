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
  expect(markup).toContain('Tap the star to favorite every Full Moon.')
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
