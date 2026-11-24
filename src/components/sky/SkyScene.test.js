import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'



// STYLES

const css = readFileSync(new URL('./SkyScene.css', import.meta.url), 'utf8')



// TESTS

test('the snow on the hills changes color as slowly as the sky fades', () => {
  expect(css).toMatch(/\.band \.hills path \{\s*transition: fill 2s ease;/)
})

test('the snow on the hills switches at once when motion is reduced or paused', () => {
  expect(css).toMatch(/\.still \.band \.hills path \{\s*transition: none;/)
  expect(css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))).toContain('.band .hills path')
})
