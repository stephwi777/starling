import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import MonthGrid from './MonthGrid.jsx'



// HELPERS

const GEMINIDS = { id: 'g', kinds: ['major-shower'], group: 'meteor', icon: 'shower', day: '2026-12-13', here: true, tags: [], short: 'Geminids peak', tiny: 'Geminids', subjects: [{ key: 'shower:Geminids', label: 'every Geminids peak' }] }
const MOON = { id: 'm', kinds: ['moon-planet'], group: 'planet', icon: 'planet:Jupiter', day: '2026-12-13', here: true, tags: [], short: 'Moon meets Jupiter', tiny: 'Moon & Jupiter', subjects: [{ key: 'moon-planet:Jupiter', label: 'every time the Moon passes Jupiter' }] }

function draw(narrow) {
  return renderToStaticMarkup(
    <MonthGrid year={2026} month={12} events={[GEMINIDS, MOON]} favorites={['shower:Geminids']} today="2026-12-01" selected="2026-12-01" narrow={narrow} south={false} onMonth={() => {}} onToday={() => {}} onDay={() => {}} onPick={() => {}} />,
  )
}



// TESTS

test('a phone day counts its favorites and marks the label', () => {
  const markup = draw(true)

  expect(markup).toMatch(/aria-label="[^"]*13, 2 events, 1 favorite"/)
  expect(markup).toMatch(/<i data-group="meteor" class="fav">/)
})

test('a big-calendar favorite chip is marked for eyes and screen readers', () => {
  const markup = draw(false)

  expect(markup).toMatch(/class="chip fav"[^>]*data-event="g"/)
  expect(markup).toContain('<span class="visually-hidden">Favorite, </span>')
  expect(markup).not.toMatch(/class="chip fav"[^>]*data-event="m"/)
})
