// LOOKS

const COLORS = Object.fromEntries(['clear', 'moonlit', 'patchy', 'overcast', 'dusk', 'dawn', 'day'].map(name => [
  name,
  { top: `var(--${name}-top)`, middle: `var(--${name}-middle)`, low: `var(--${name}-low)` },
]))

COLORS.overcast.middle = 'color-mix(in srgb, var(--overcast-top), var(--overcast-low))'

const SNOW = {
  moonlit: 'var(--snow-moonlit)',
  overcast: 'var(--snow-overcast)',
  dusk: 'var(--snow-dusk)',
  dawn: 'var(--snow-dawn)',
  day: 'var(--snow-day)',
}

export const PRESETS = {
  clear: { sunAlt: -30, moonAlt: 30, moonLit: 0.08, moonAngle: 30, cloudCover: 0, isHome: true },
  moonlit: { sunAlt: -30, moonAlt: 40, moonLit: 0.93, moonAngle: 160, cloudCover: 0, isHome: true },
  patchy: { sunAlt: -30, moonAlt: 20, moonLit: 0.3, moonAngle: 65, cloudCover: 55, isHome: true },
  overcast: { sunAlt: -30, moonAlt: -10, moonLit: 0.5, moonAngle: 90, cloudCover: 95, isHome: true },
  dusk: { sunAlt: -4, moonAlt: 25, moonLit: 0.35, moonAngle: 70, cloudCover: 0, isHome: true },
  dawn: { sunAlt: -8, moonAlt: -10, moonLit: 0.3, moonAngle: 60, cloudCover: 0, morning: true },
  day: { sunAlt: 30, moonAlt: 20, moonLit: 0.6, moonAngle: 110, cloudCover: 20, isHome: true },
}



// HELPERS

function cloudLevel(cover, fall) {
  if (fall) return 3
  if (cover === null || cover === undefined || cover < 15) return 0
  if (cover < 40) return 1
  if (cover < 75) return 2
  return 3
}

function phaseOf(sunAlt, isHome, twilightAllNight) {
  if (sunAlt > 0 && isHome) return 'day'
  if (sunAlt > -12 || twilightAllNight) return 'dusk'
  return 'night'
}

function nameOf(phase, clouds, moonUp, moonLit, morning, twilightAllNight) {
  if (phase === 'day') return phase
  if (phase === 'dusk') return morning && !twilightAllNight ? 'dawn' : 'dusk'
  if (clouds === 3) return 'overcast'
  if (clouds === 2) return 'patchy'
  if (moonUp && moonLit > 0.6) return 'moonlit'
  return 'clear'
}

function starAmount(name, clouds, moonLit) {
  if (name === 'day' || clouds === 3) return 0
  if (name === 'moonlit') return 1 - moonLit * 0.25

  const base = name === 'dusk' || name === 'dawn' ? 0.3 : 1

  return clouds === 2 ? base * 0.6 : base
}



// SKY LOOK

export function skyLook({ sunAlt, moonAlt, moonLit, moonAngle, cloudCover, isHome = false, fall = null, morning = false, twilightAllNight = false, south = false }) {
  const phase = phaseOf(sunAlt, isHome, twilightAllNight)
  const clouds = cloudLevel(cloudCover, fall)
  const moonUp = moonAlt > 0 && clouds < 3
  const name = nameOf(phase, clouds, moonUp, moonLit, morning, twilightAllNight)

  return {
    phase,
    name,
    colors: COLORS[name],
    stars: starAmount(name, clouds, moonLit),
    clouds,
    moon: moonUp ? { angle: moonAngle, lit: moonLit, halo: moonLit > 0.6, south } : null,
    sun: phase === 'day',
    snow: SNOW[name] ?? 'var(--snow)',
    fall,
  }
}



// HOME NIGHT

export function phaseAngle(lit) {
  return (Math.acos(1 - 2 * lit) * 180) / Math.PI
}

export function nightLook({ moonAngle, moonLit, south = false }) {
  const look = skyLook({ sunAlt: -30, moonAlt: 30, moonLit: 0, moonAngle, cloudCover: null, isHome: true, south })

  return { ...look, moon: { ...look.moon, lit: moonLit, halo: true } }
}
