import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import Tools from './Tools.jsx'



// HELPERS

const css = readFileSync(new URL('./Tools.css', import.meta.url), 'utf8')

function draw() {
  return renderToStaticMarkup(<MemoryRouter><Tools /></MemoryRouter>)
}



// PAGE

test('the page lists all 16 tools under its title', () => {
  const html = draw()

  expect(html).toContain('<h1>Sky tools</h1>')
  expect(html.match(/<li class="tool"/g)).toHaveLength(16)
})

test('each group of tools has its own heading and grid, in order', () => {
  const html = draw()
  const headings = [...html.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)].map(match => match[1])

  expect(headings).toEqual(['Find your way around the sky', 'Catch something special', 'Plan your night out', 'Look closer'])
  expect(html.match(/<ul class="tool-grid"/g)).toHaveLength(4)
})

test('at launch the grid has no links to tab onto', () => {
  expect(draw()).not.toContain('<a ')
})



// STYLES

test('tools styles use theme colors only, so red light works', () => {
  expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
})

test('a ready tile’s whole area stays clickable above its scene', () => {
  const cover = css.match(/\.tool a::after \{[^}]*\}/)[0]

  expect(cover).toMatch(/z-index: 1;/)
})

test('tiles and group headings rise in on scroll only when motion is allowed', () => {
  const motion = css.slice(css.indexOf('prefers-reduced-motion: no-preference'))

  expect(motion).toMatch(/@supports \(animation-timeline: view\(\)\)/)
  expect(motion).toMatch(/:root:not\(\.still\) :is\(\.tool, \.tool-group h2\) \{[^}]*animation: page-rise linear both;[^}]*animation-timeline: view\(\);/)
})

test('every tile in a row rises at the same time, with no left-to-right wave', () => {
  expect(css).not.toMatch(/--i/)
})

test('pressing a coming soon tile nudges its label instead of the tile', () => {
  const motion = css.slice(css.indexOf('prefers-reduced-motion: no-preference'))

  expect(motion).toMatch(/:root:not\(\.still\) \.tool:not\(:has\(a\)\):active \.tool-art span \{[^}]*scale: 1\.1;/)
})

test('the press only moves when motion is allowed', () => {
  const pressing = css.split('\n').filter(line => line.includes('scale: 0.985'))

  expect(pressing).toHaveLength(1)
  expect(css.indexOf('prefers-reduced-motion: no-preference')).toBeLessThan(css.indexOf('scale: 0.985'))
  expect(css).toMatch(/:root:not\(\.still\) \.tool:has\(a\):active/)
})
