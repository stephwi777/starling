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
  expect(bright.stars).toBeLessThan(0.4)

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
  expect(Object.keys(PRESETS).sort()).toEqual(['clear', 'day', 'dusk', 'moonlit', 'overcast', 'patchy'])
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
