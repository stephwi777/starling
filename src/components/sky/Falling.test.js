import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'



// STYLES

const css = readFileSync(new URL('./Falling.css', import.meta.url), 'utf8')
const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))



// TESTS

test('with reduced motion the rain freezes where it is instead of vanishing', () => {
  expect(reduced).toContain('animation-play-state: paused')
  expect(reduced).not.toContain('animation: none')
})

test('the rain clears a soft rectangle around the words', () => {
  for (const edge of ['--words-left', '--words-right', '--words-top', '--words-bottom']) expect(css).toContain(`var(${edge},`)
  expect(css).not.toContain('radial-gradient(ellipse')
})
