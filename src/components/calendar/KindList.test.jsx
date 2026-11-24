import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { DEFAULT_KINDS } from '../../sky/calendar/kinds.js'
import KindList from './KindList.jsx'



// HELPERS

const draw = (favoritesOnly, favoriteCount) => renderToStaticMarkup(<KindList id="k" kinds={DEFAULT_KINDS} favoritesOnly={favoritesOnly} favoriteCount={favoriteCount} toggleKind={() => {}} setGroup={() => {}} setFavoritesOnly={() => {}} suggest={() => {}} />)



// TESTS

test('the event types say they are paused while only favorites show', () => {
  expect(draw(true, 2)).toContain('Paused while Only my favorites is on')
  expect(draw(false, 2)).not.toContain('Paused')
  expect(draw(true, 0)).not.toContain('Paused')
})
