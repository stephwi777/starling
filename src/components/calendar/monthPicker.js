// RANGE

export function pickerRange(currentYear) {
  return { from: currentYear - 1, to: currentYear + 10 }
}

export function clampYear(year, { from, to }) {
  return Math.min(to, Math.max(from, year))
}



// FOCUS

const FOCUSABLE = 'button, a, input, select, textarea, [tabindex]'

export function refocusTitle(target) {
  return !target?.closest?.(FOCUSABLE)
}

export function leftPicker(next, panel, title) {
  return !next || (!panel.contains(next) && !title.contains(next))
}
