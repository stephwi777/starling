// MOONS

const NIGHT = { sunAlt: -30, moonAlt: -10, moonLit: 0.02, moonAngle: 8, cloudCover: 5 }
const CRESCENT = { moonAlt: 25, moonLit: 0.22, moonAngle: 56 }
const HALF = { moonAlt: 30, moonLit: 0.5, moonAngle: 90 }
const BRIGHT = { moonAlt: 35, moonLit: 0.93, moonAngle: 160 }



// PREVIEWS

export const PREVIEWS = {
  1: NIGHT,
  2: { ...NIGHT, ...CRESCENT },
  3: { ...NIGHT, ...HALF },
  4: { ...NIGHT, ...BRIGHT },
  5: { ...NIGHT, cloudCover: 28 },
  6: { ...NIGHT, ...HALF, cloudCover: 28 },
  7: { ...NIGHT, cloudCover: 55 },
  8: { ...NIGHT, ...BRIGHT, cloudCover: 55 },
  9: { ...NIGHT, cloudCover: 92 },
  10: { ...NIGHT, ...BRIGHT, cloudCover: 92 },
  11: { ...NIGHT, cloudCover: 95, fall: 'rain' },
  12: { ...NIGHT, cloudCover: 95, fall: 'snow' },
  14: { ...NIGHT, ...BRIGHT, cloudCover: 95, fall: 'rain' },
  15: { ...NIGHT, ...CRESCENT, sunAlt: -5 },
  16: { ...NIGHT, sunAlt: -5, cloudCover: 55 },
  17: { ...NIGHT, sunAlt: -8, morning: true },
  18: { ...NIGHT, sunAlt: -8, cloudCover: 28, morning: true },
  19: { ...NIGHT, sunAlt: -9, twilightAllNight: true },
  20: { ...NIGHT, ...HALF, cloudCover: null },
  21: { ...NIGHT, ...BRIGHT, sunAlt: -5, cloudCover: 92 },
  22: { ...NIGHT, sunAlt: -8, cloudCover: 92, morning: true },
}
