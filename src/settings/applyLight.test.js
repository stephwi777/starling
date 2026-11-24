import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { applyLight } from './applyLight.js'



// FAKE PAGE

function fakeRoot(light) {
  const steps = []
  const classes = new Set()

  return {
    steps,
    classes,
    dataset: { light },
    classList: {
      add: name => {
        classes.add(name)
        steps.push(`add ${name}`)
      },
      remove: name => {
        classes.delete(name)
        steps.push(`remove ${name}`)
      },
    },
    getBoundingClientRect() {
      steps.push(`paint ${this.dataset.light} ${classes.has('switching') ? 'still' : 'moving'}`)
      return {}
    },
  }
}



// SWITCHING

test('the new colors are drawn once with transitions off, then transitions come back', () => {
  const root = fakeRoot('normal')

  applyLight(root, 'red')

  expect(root.dataset.light).toBe('red')
  expect(root.steps).toEqual(['add switching', 'paint red still', 'remove switching'])
  expect(root.classes.has('switching')).toBe(false)
})

test('nothing happens when the light is already set', () => {
  const root = fakeRoot('red')

  applyLight(root, 'red')

  expect(root.steps).toEqual([])
})

test('the theme turns transitions off while switching, except on the switch itself', () => {
  const css = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8')

  expect(css).toMatch(/:root\.switching :not\(\.red-switch, \.red-switch \*\),\s*:root\.switching :not\(\.red-switch, \.red-switch \*\)::(before|after)/)
  expect(css).toMatch(/:root\.switching[^{]*\{\s*transition: none !important;/)
})
