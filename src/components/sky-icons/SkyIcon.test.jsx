import { readdirSync, readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { SKY_DEEP, SKY_SHAPES, SKY_STARS } from '../../sky/catalog/sky.js'
import { MOON, PLANETS } from '../../sky/catalog/planets.js'
import SkyIcon from './SkyIcon.jsx'



// HELPERS

function draw(object, moonAngle) {
  return renderToStaticMarkup(<SkyIcon object={object} moonAngle={moonAngle} />)
}

function drawsSomething(markup) {
  return /<(path|circle|ellipse|rect|g)[\s>]/.test(markup)
}



// TESTS

test('every object in the catalog gets an icon', () => {
  const everything = [...SKY_STARS, ...SKY_SHAPES.map(shape => ({ ...shape, kind: 'shape' })), ...SKY_DEEP, ...PLANETS, { kind: 'shower', name: 'Perseids' }]

  for (const object of everything) {
    const markup = draw(object)

    expect(markup, object.name).toContain('<svg')
    expect(drawsSomething(markup), object.name).toBe(true)
  }
})

test('the Moon shows its phase', () => {
  expect(draw(MOON, 0)).not.toBe(draw(MOON, 90))
})

test('each planet looks different', () => {
  const looks = new Set(PLANETS.map(planet => draw(planet)))

  expect(looks.size).toBe(PLANETS.length)
})

test('two copies of a clipped icon get their own clip ids', () => {
  const jupiter = PLANETS.find(planet => planet.name === 'Jupiter')
  const markup = renderToStaticMarkup(<>{draw(jupiter)}<SkyIcon object={jupiter} /><SkyIcon object={jupiter} /></>)
  const ids = [...markup.matchAll(/clipPath id="([^"]+)"/g)].map(match => match[1])

  expect(new Set(ids).size).toBe(ids.length)
})

test('icon colors all come from theme tokens', () => {
  const folder = new URL('./', import.meta.url)

  for (const file of readdirSync(folder).filter(name => name.endsWith('.jsx') && !name.includes('.test.'))) {
    expect(readFileSync(new URL(file, folder), 'utf8'), file).not.toMatch(/#[0-9a-f]{3,6}\b/i)
  }
})
