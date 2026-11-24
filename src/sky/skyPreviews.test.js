import { expect, test } from 'vitest'
import { PREVIEWS } from './skyPreviews.js'
import { skyLook } from './skyLook.js'



// TESTS

test('every approved look has a preview', () => {
  expect(Object.keys(PREVIEWS).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22])
})

test('each preview gives the look it stands for', () => {
  const look = number => skyLook(PREVIEWS[number])

  expect(look(1)).toMatchObject({ name: 'clear', clouds: 0, moon: null })
  expect(look(2).moon.halo).toBe(false)
  expect(look(4)).toMatchObject({ name: 'moonlit', clouds: 0 })
  expect(look(5)).toMatchObject({ name: 'clear', clouds: 1 })
  expect(look(8)).toMatchObject({ name: 'patchy', clouds: 2 })
  expect(look(10)).toMatchObject({ name: 'overcast', clouds: 3, moon: null })
  expect(look(12)).toMatchObject({ name: 'overcast', fall: 'snow' })
  expect(look(16)).toMatchObject({ name: 'dusk', clouds: 2 })
  expect(look(17)).toMatchObject({ name: 'dawn', clouds: 0 })
  expect(look(19)).toMatchObject({ name: 'dusk', clouds: 0 })
  expect(look(20)).toMatchObject({ name: 'clear', clouds: 0 })
  expect(look(20).moon).not.toBeNull()
  expect(look(21)).toMatchObject({ name: 'dusk', clouds: 3, moon: null })
  expect(look(22)).toMatchObject({ name: 'dawn', clouds: 3 })
})
