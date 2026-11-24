import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import Chevron from './Chevron.jsx'



// HELPERS

const DRAWN = [
  '../../pages/Tonight.css',
  '../tonight/UpTonightCard.jsx',
  '../uptonight/UpGroup.jsx',
  '../uptonight/UpFilters.jsx',
  '../panel/NightStrip.jsx',
  '../moon/MoonCalendar.jsx',
  '../../pages/Calendar.css',
  '../calendar/MonthGrid.jsx',
  '../calendar/MonthPicker.jsx',
  '../calendar/KindList.jsx',
]



// CHEVRON

test('a chevron is one hidden shape, turned around for "back"', () => {
  expect(renderToStaticMarkup(<Chevron />)).toBe('<span class="chevron" aria-hidden="true"></span>')
  expect(renderToStaticMarkup(<Chevron left className="up-chevron" />)).toBe('<span class="chevron left up-chevron" aria-hidden="true"></span>')
})

test('chevrons are drawn from the shared shape, never typed or copied', () => {
  for (const file of DRAWN) {
    const text = readFileSync(new URL(file, import.meta.url), 'utf8')

    expect(text, file).not.toMatch(/[›‹]/)
    expect(text, file).not.toMatch(/L1[01] 8|L[56] 8|function Chevron/)
  }
})
