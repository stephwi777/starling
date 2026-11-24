import { expect, test } from 'vitest'
import { PRESETS, nightLook, skyLook } from './skyLook.js'



// HELPERS

const night = { sunAlt: -30, moonAlt: -10, moonLit: 0.1, moonAngle: 40, cloudCover: 0, isHome: true }



// TESTS

test('daytime only on the home page', () => {
  const home = skyLook({ ...night, sunAlt: 10 })
  expect(home).toMatchObject({ phase: 'day', name: 'day', sun: true, stars: 0 })
  expect(skyLook({ ...night, sunAlt: 10, isHome: false }).phase).toBe('dusk')
})

test('twilight is dusk and full darkness is night', () => {
  expect(skyLook({ ...night, sunAlt: -5 }).phase).toBe('dusk')
  expect(skyLook(night).phase).toBe('night')
})

test('cloud cover becomes four cloud levels', () => {
  expect(skyLook({ ...night, cloudCover: 10 }).clouds).toBe(0)
  expect(skyLook({ ...night, cloudCover: 30 }).clouds).toBe(1)
  expect(skyLook({ ...night, cloudCover: 60 }).clouds).toBe(2)
  expect(skyLook({ ...night, cloudCover: 90 })).toMatchObject({ clouds: 3, name: 'overcast', stars: 0 })
  expect(skyLook({ ...night, cloudCover: null }).clouds).toBe(0)
})

test('a bright Moon lifts the sky and hides faint stars', () => {
  const bright = skyLook({ ...night, moonAlt: 30, moonLit: 0.9 })
  expect(bright.name).toBe('moonlit')
  expect(bright.moon.halo).toBe(true)
  expect(bright.stars).toBeCloseTo(1 - 0.9 * 0.25)

  const thin = skyLook({ ...night, moonAlt: 30, moonLit: 0.1 })
  expect(thin).toMatchObject({ name: 'clear', stars: 1 })
  expect(thin.moon.halo).toBe(false)
})

test('a Moon below the horizon is not drawn', () => {
  expect(skyLook({ ...night, moonAlt: -10 }).moon).toBeNull()
})

test('every preset gives its own look', () => {
  for (const name of Object.keys(PRESETS)) {
    expect(skyLook(PRESETS[name]).name).toBe(name)
  }
  expect(Object.keys(PRESETS).sort()).toEqual(['clear', 'dawn', 'day', 'dusk', 'moonlit', 'overcast', 'patchy'])
})

test('the home page always shows a clear night sky with a glowing Moon', () => {
  const look = nightLook({ moonAngle: 120, moonLit: 0.75 })
  expect(look).toMatchObject({ phase: 'night', name: 'clear', clouds: 0, sun: false, stars: 1 })
  expect(look.moon).toEqual({ angle: 120, lit: 0.75, halo: true, south: false })
  expect(nightLook({ moonAngle: 30, moonLit: 0.1 }).moon.halo).toBe(true)
})

test('the home Moon is mirrored for places south of the equator', () => {
  expect(nightLook({ moonAngle: 90, moonLit: 0.5 }).moon.south).toBe(false)
  expect(nightLook({ moonAngle: 90, moonLit: 0.5, south: true }).moon.south).toBe(true)
})

test('home keeps exactly the same clear night', () => {
  expect(nightLook({ moonAngle: 120, moonLit: 0.75 })).toEqual({
    phase: 'night',
    name: 'clear',
    colors: { top: 'var(--clear-top)', middle: 'var(--clear-middle)', low: 'var(--clear-low)' },
    stars: 1,
    clouds: 0,
    moon: { angle: 120, lit: 0.75, halo: true, south: false },
    sun: false,
    snow: 'var(--snow)',
    fall: null,
  })
})

test('a bright Moon only fades a quarter of the stars', () => {
  expect(skyLook({ ...night, isHome: false, moonAlt: 30, moonLit: 0.92 }).stars).toBeCloseTo(0.77)
})

test('cloudy skies use a two-color gradient and hide the Moon', () => {
  const look = skyLook({ ...night, isHome: false, moonAlt: 30, moonLit: 0.9, cloudCover: 90 })
  expect(look).toMatchObject({ name: 'overcast', clouds: 3, stars: 0, moon: null })
  expect(look.colors.middle).toBe('color-mix(in srgb, var(--overcast-top), var(--overcast-low))')
})

test('rain or snow always brings the cloudy sky', () => {
  expect(skyLook({ ...night, isHome: false, cloudCover: 20, fall: 'rain' })).toMatchObject({ name: 'overcast', clouds: 3, fall: 'rain', moon: null })
})

test('morning twilight has its own colors', () => {
  const look = skyLook({ ...night, isHome: false, sunAlt: -8, morning: true })
  expect(look).toMatchObject({ phase: 'dusk', name: 'dawn', snow: 'var(--snow-dawn)' })
  expect(look.colors.low).toBe('var(--dawn-low)')
})

test('cloudy twilight keeps the twilight colors with huge clouds', () => {
  expect(skyLook({ ...night, isHome: false, sunAlt: -5, cloudCover: 92 })).toMatchObject({ name: 'dusk', clouds: 3, stars: 0, moon: null })
  expect(skyLook({ ...night, isHome: false, sunAlt: -5, fall: 'snow', morning: true })).toMatchObject({ name: 'dawn', clouds: 3, fall: 'snow' })
})

test('nights that never get fully dark stay in evening twilight', () => {
  expect(skyLook({ ...night, isHome: false, sunAlt: -15, morning: true, twilightAllNight: true })).toMatchObject({ phase: 'dusk', name: 'dusk' })
})

test('the Moon is flipped in the south', () => {
  expect(skyLook({ ...night, isHome: false, moonAlt: 20, moonLit: 0.5, south: true }).moon.south).toBe(true)
})
