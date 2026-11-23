import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import EventRow from './EventRow.jsx'



// HELPERS

const EVENT = { id: 'g', kinds: ['major-shower'], group: 'meteor', icon: 'shower', day: '2026-12-13', time: 'Peak night', here: true, tags: [], name: 'Geminids peak' }

const draw = favorite => renderToStaticMarkup(<EventRow event={EVENT} south={false} dated favorite={favorite} onPick={() => {}} />)



// TESTS

test('a favorite row is marked for eyes and screen readers', () => {
  const markup = draw(true)

  expect(markup).toMatch(/class="event-row fav"/)
  expect(markup).toContain('<span class="visually-hidden">Favorite, </span>')
})

test('other rows are not marked', () => {
  const markup = draw(false)

  expect(markup).not.toContain('fav')
  expect(markup).not.toContain('Favorite')
})
