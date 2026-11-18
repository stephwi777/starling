// LOOKS

const COLORS = Object.fromEntries(['clear', 'moonlit', 'patchy', 'overcast', 'dusk', 'day'].map(name => [
  name,
  { top: `var(--${name}-top)`, middle: `var(--${name}-middle)`, low: `var(--${name}-low)` },
]))

const SNOW = {
  moonlit: 'var(--snow-moonlit)',
  overcast: 'var(--snow-overcast)',
  dusk: 'var(--snow-dusk)',
  day: 'var(--snow-day)',
}

export const PRESETS = {
  clear: { sunAlt: -30, moonAlt: 30, moonLit: 0.08, moonAngle: 30, cloudCover: 0, isHome: true },
  moonlit: { sunAlt: -30, moonAlt: 40, moonLit: 0.93, moonAngle: 160, cloudCover: 0, isHome: true },
  patchy: { sunAlt: -30, moonAlt: 20, moonLit: 0.3, moonAngle: 65, cloudCover: 55, isHome: true },
  overcast: { sunAlt: -30, moonAlt: -10, moonLit: 0.5, moonAngle: 90, cloudCover: 95, isHome: true },
  dusk: { sunAlt: -4, moonAlt: 25, moonLit: 0.35, moonAngle: 70, cloudCover: 0, isHome: true },
  day: { sunAlt: 30, moonAlt: 20, moonLit: 0.6, moonAngle: 110, cloudCover: 20, isHome: true },
}



// HELPERS

function cloudLevel(cover) {
  if (cover === null || cover === undefined || cover < 15) return 0
  if (cover < 40) return 1
  if (cover < 75) return 2
  return 3
}

function phaseOf(sunAlt, isHome) {
  if (sunAlt > 0 && isHome) return 'day'
  if (sunAlt > -12) return 'dusk'
  return 'night'
}

function nameOf(phase, clouds, moonUp, moonLit) {
  if (phase === 'day' || phase === 'dusk') return phase
  if (clouds === 3) return 'overcast'
  if (clouds === 2) return 'patchy'
  if (moonUp && moonLit > 0.6) return 'moonlit'
  return 'clear'
}

function starAmount(name, clouds) {
  if (name === 'day' || clouds === 3) return 0

  const base = name === 'dusk' ? 0.3 : 1

  return clouds === 2 ? base * 0.6 : base
}



// SKY LOOK

export function skyLook({ sunAlt, moonAlt, moonLit, moonAngle, cloudCover, isHome }) {
  const phase = phaseOf(sunAlt, isHome)
  const clouds = cloudLevel(cloudCover)
  const moonUp = moonAlt > 0
  const name = nameOf(phase, clouds, moonUp, moonLit)
  const stars = name === 'moonlit' ? 1 - moonLit * 0.7 : starAmount(name, clouds)

  return {
    phase,
    name,
    colors: COLORS[name],
    stars,
    clouds,
    moon: moonUp ? { angle: moonAngle, lit: moonLit, halo: moonLit > 0.6 } : null,
    sun: phase === 'day',
    snow: SNOW[name] ?? 'var(--snow)',
  }
}



// HOME NIGHT

export function nightLook({ moonAngle, moonLit, south = false }) {
  return {
    ...skyLook({ sunAlt: -30, moonAlt: 30, moonLit: 0, moonAngle, cloudCover: null, isHome: true }),
    moon: { angle: moonAngle, lit: moonLit, halo: true, south },
  }
}
