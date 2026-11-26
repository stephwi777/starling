import { expect, test } from 'vitest'
import { TOOL_GROUPS, TOOLS } from './toolList.js'



// GROUPS

test('tools sit in four groups of similar tools, most used first', () => {
  expect(TOOL_GROUPS.map(group => group.title)).toEqual(['Find your way around the sky', 'Catch something special', 'Plan your night out', 'Look closer'])
})

test('each group lists its tools from most to least used', () => {
  expect(TOOL_GROUPS.map(group => group.tools.map(tool => tool.id))).toEqual([
    ['chart', 'phone', 'photo', 'solar-system'],
    ['passes', 'aurora', 'sunset', 'moonbow'],
    ['map', 'satellite', 'almanac', 'printables'],
    ['moon-map', 'sun', 'jupiter', 'eyepiece'],
  ])
})



// TOOLS

test('every planned tool is listed once', () => {
  const ids = TOOLS.map(tool => tool.id)

  expect(ids).toHaveLength(16)
  expect(new Set(ids).size).toBe(16)
})

test('nothing is ready at launch', () => {
  expect(TOOLS.filter(tool => tool.ready)).toEqual([])
})

test('the sky map opens the Map page and every other tool its own page', () => {
  expect(TOOLS.find(tool => tool.id === 'map').to).toBe('/map')
  expect(TOOLS.filter(tool => tool.id !== 'map').every(tool => tool.to === `/tools/${tool.id}`)).toBe(true)
})
