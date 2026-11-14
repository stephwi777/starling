import { expect, test } from 'vitest'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './settingsStorage.js'



// FAKE STORAGE

function fakeStorage() {
  const items = new Map()

  return {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
  }
}

function throwingStorage() {
  return {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
  }
}



// TESTS

test('saved settings load back exactly', () => {
  const storage = fakeStorage()
  const settings = { mode: 'advanced', gear: 2, light: 'red' }
  saveSettings(settings, storage)
  expect(JSON.parse(storage.getItem('starling.settings'))).toEqual({ version: 1, settings })
  expect(loadSettings(storage)).toEqual(settings)
})

test('nothing saved gives the defaults', () => {
  expect(loadSettings(fakeStorage())).toEqual({ mode: 'hobbyist', gear: 3, light: 'normal' })
  expect(DEFAULT_SETTINGS).toEqual({ mode: 'hobbyist', gear: 3, light: 'normal' })
})

test('broken JSON gives the defaults', () => {
  const storage = fakeStorage()
  storage.setItem('starling.settings', '{oops')
  expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)
})

test('a different version gives the defaults', () => {
  const storage = fakeStorage()
  storage.setItem('starling.settings', JSON.stringify({ version: 2, settings: { mode: 'advanced', gear: 1, light: 'red' } }))
  expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)
})

test('unknown values give the defaults', () => {
  const storage = fakeStorage()

  for (const settings of [
    { mode: 'expert', gear: 2, light: 'normal' },
    { mode: 'advanced', gear: 4, light: 'normal' },
    { mode: 'advanced', gear: '2', light: 'normal' },
    { mode: 'advanced', gear: 2, light: 'green' },
  ]) {
    storage.setItem('starling.settings', JSON.stringify({ version: 1, settings }))
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)
  }
})

test('blocked storage never throws', () => {
  expect(loadSettings(throwingStorage())).toEqual(DEFAULT_SETTINGS)
  expect(() => saveSettings(DEFAULT_SETTINGS, throwingStorage())).not.toThrow()
})
