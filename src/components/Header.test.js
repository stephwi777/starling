import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'



// TESTS

test('header menu styles only apply inside the header', () => {
  const css = readFileSync(new URL('./Header.css', import.meta.url), 'utf8')
  const bare = css.split('\n').filter(line => /^\s*nav\b/.test(line))
  expect(bare).toEqual([])
})
