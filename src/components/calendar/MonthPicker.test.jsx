import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import MonthPicker from './MonthPicker.jsx'



// HELPERS

const draw = year => renderToStaticMarkup(<MonthPicker year={year} month={6} current={{ year: 2026, month: 11 }} anchor={{ current: null }} onPick={() => {}} onClose={() => {}} />)



// TESTS

test('the year arrows at the range ends stay focusable', () => {
  const late = draw(2036)
  const early = draw(2025)

  expect(late).toMatch(/aria-label="Next year" aria-disabled="true"/)
  expect(early).toMatch(/aria-label="Previous year" aria-disabled="true"/)
  expect(late).not.toMatch(/disabled=""/)
  expect(early).not.toMatch(/disabled=""/)
})
