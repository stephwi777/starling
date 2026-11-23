import { expect, test } from 'vitest'
import { loadFavorites, saveFavorites } from './favoriteStorage.js'



// HELPERS

function memory(text = null) {
  let value = text

  return {
    getItem: () => value,
    setItem: (_, next) => {
      value = next
    },
  }
}

const broken = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}



// TESTS

test('a first visit has no favorites', () => {
  expect(loadFavorites(memory())).toEqual([])
})

test('favorites are saved and loaded back', () => {
  const storage = memory()

  saveFavorites(['shower:Geminids'], storage)

  expect(loadFavorites(storage)).toEqual(['shower:Geminids'])
})

test('junk or old saves give no favorites', () => {
  expect(loadFavorites(memory('not json'))).toEqual([])
  expect(loadFavorites(memory(JSON.stringify({ version: 99, keys: ['full-moon'] })))).toEqual([])
  expect(loadFavorites(memory(JSON.stringify({ version: 1, keys: 'full-moon' })))).toEqual([])
})

test('blocked storage never throws', () => {
  expect(loadFavorites(broken)).toEqual([])
  expect(() => saveFavorites(['full-moon'], broken)).not.toThrow()
})
