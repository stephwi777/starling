import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import ToolTile from './ToolTile.jsx'



// HELPERS

const soon = { id: 'chart', title: 'Star chart', line: 'Find your way around tonight’s sky.', to: '/tools/chart', ready: false, Scene: null }
const ready = { ...soon, ready: true }

function draw(tool) {
  return renderToStaticMarkup(<MemoryRouter><ToolTile tool={tool} /></MemoryRouter>)
}



// COMING SOON

test('a coming soon tile names the tool, then says coming soon, with no link', () => {
  const html = draw(soon)

  expect(html).not.toContain('<a ')
  expect(html.indexOf('Star chart')).toBeLessThan(html.indexOf('Coming soon'))
})



// READY

test('a ready tile is one link to its tool and drops the label', () => {
  const html = draw(ready)

  expect(html.match(/<a /g)).toHaveLength(1)
  expect(html).toContain('href="/tools/chart"')
  expect(html).not.toContain('Coming soon')
})

test('the tool name is a heading under its group, and a ready tile’s link sits in it', () => {
  expect(draw(soon)).toContain('<h3>Star chart</h3>')
  expect(draw(ready)).toContain('<h3><a href="/tools/chart"')
})

test('a ready tool without a scene keeps a plain picture block', () => {
  expect(draw(ready)).toContain('<div class="tool-art"></div>')
})

test('a ready tool shows its scene in the picture block', () => {
  const Scene = () => <svg aria-hidden="true" />

  expect(draw({ ...ready, Scene })).toContain('<div class="tool-art"><svg aria-hidden="true"></svg></div>')
})
