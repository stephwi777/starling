import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import EventIcon from './EventIcon.jsx'



// TESTS

test('a planet pair draws both planets, one tucked behind the other', () => {
  const markup = renderToStaticMarkup(<EventIcon icon="pair:Venus+Jupiter" />)

  expect(markup.match(/<g transform="translate/g)).toHaveLength(2)
  expect(markup).not.toBe(renderToStaticMarkup(<EventIcon icon="planet:Venus" />))
})

test('an occultation draws a faint full Moon with a star at its dark edge', () => {
  const markup = renderToStaticMarkup(<EventIcon icon="occultation" />)

  expect(markup).toContain('var(--moon-shadow)')
  expect(markup).toContain('var(--moon)')
  expect(markup).toContain('var(--frost)')
})
