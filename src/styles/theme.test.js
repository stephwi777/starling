import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { PRESETS, skyLook } from '../sky/skyLook.js'



// THEME

const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8')

function block(selector) {
  const start = css.indexOf(`${selector} {`)
  return css.slice(start, css.indexOf('\n}', start))
}

function tokens(selector) {
  return Object.fromEntries([...block(selector).matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, value]) => [name, value]))
}

const normal = tokens(':root')
const red = { ...normal, ...tokens(':root[data-light="red"]') }



// CONTRAST

function luminance(hex) {
  const channel = i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

function resolve(value, theme) {
  const name = value.match(/var\(--([\w-]+)\)/)?.[1]
  return name ? theme[name] : value
}

function mix(a, b, t) {
  const part = (hex, i) => parseInt(hex.slice(i, i + 2), 16)
  return '#' + [1, 3, 5].map(i => Math.round(part(a, i) + (part(b, i) - part(a, i)) * t).toString(16).padStart(2, '0')).join('')
}



// TESTS

test('sky looks use theme colors so red light can recolor them', () => {
  for (const preset of Object.values(PRESETS)) {
    const look = skyLook(preset)
    for (const value of [...Object.values(look.colors), look.snow]) {
      expect(value).toMatch(/^var\(--[\w-]+\)$/)
      expect(resolve(value, normal)).toMatch(/^#/)
      expect(resolve(value, red)).toMatch(/^#/)
    }
  }
})

test('intro text stays readable on every sky in both themes', () => {
  for (const theme of [normal, red]) {
    for (const preset of Object.values(PRESETS)) {
      const { colors, phase } = skyLook(preset)
      const behind = mix(resolve(colors.top, theme), resolve(colors.middle, theme), 0.45)
      const text = phase === 'day' ? theme.frost : theme.mist
      expect(contrast(text, behind)).toBeGreaterThanOrEqual(4.5)
    }
  }
})

test('text stays readable over every cloud shade in both themes', () => {
  for (const theme of [normal, red]) {
    for (let i = 1; i <= 4; i++) {
      expect(contrast(theme.frost, theme[`cloud-${i}`])).toBeGreaterThanOrEqual(4.5)
      expect(contrast(theme.frost, theme[`day-cloud-${i}`])).toBeGreaterThanOrEqual(4.5)
    }
  }
})

test('the logo and decorations use theme colors so red light can recolor them', () => {
  const files = ['../components/LogoMark.jsx', '../components/Meteors.jsx', '../components/Aurora.jsx', '../pages/Credits.jsx']

  for (const file of files) {
    expect(readFileSync(new URL(file, import.meta.url), 'utf8'), file).not.toMatch(/#[0-9a-f]{3,6}\b/i)
  }

  for (const name of ['wing', 'lilac', 'bronze-shade', 'crater']) {
    expect(normal[name], name).toMatch(/^#/)
    expect(red[name], name).not.toBe(normal[name])
  }
})
