import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import MonthGrid from './MonthGrid.jsx'



// HELPERS

const GEMINIDS = { id: 'g', kinds: ['major-shower'], group: 'meteor', icon: 'shower', day: '2026-12-13', here: true, tags: [], short: 'Geminids peak', tiny: 'Geminids', subjects: [{ key: 'shower:Geminids', label: 'every Geminids peak' }] }
const MOON = { id: 'm', kinds: ['moon-planet'], group: 'planet', icon: 'planet:Jupiter', day: '2026-12-13', here: true, tags: [], short: 'Moon meets Jupiter', tiny: 'Moon & Jupiter', subjects: [{ key: 'moon-planet:Jupiter', label: 'every time the Moon passes Jupiter' }] }

function draw(narrow, range) {
  return renderToStaticMarkup(
    <MonthGrid year={2026} month={12} events={[GEMINIDS, MOON]} favorites={['shower:Geminids']} today="2026-12-01" selected="2026-12-01" narrow={narrow} south={false} range={range} onMonth={() => {}} onToday={() => {}} onDay={() => {}} onPick={() => {}} />,
  )
}

const dayClass = (markup, day) => markup.match(new RegExp(`<li class="([^"]*)"[^>]*data-day="${day}"`))?.[1] ?? ''



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



// RANGE

test('an open event shades the days of its range and marks its own day', () => {
  const range = { from: '2026-12-04', to: '2026-12-20', day: '2026-12-13', group: 'meteor' }

  for (const narrow of [false, true]) {
    const markup = draw(narrow, range)

    expect(dayClass(markup, 3)).not.toContain('in-range')
    expect(dayClass(markup, 4)).toContain('in-range')
    expect(dayClass(markup, 13)).toContain('range-day')
    expect(dayClass(markup, 20)).toContain('in-range')
    expect(dayClass(markup, 21)).not.toContain('in-range')
    expect(markup).toMatch(/class="month-days" data-group="meteor"/)
  }
})

test('no event open, no shading', () => {
  expect(draw(false)).not.toContain('in-range')
})
