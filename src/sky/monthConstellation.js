import { CONSTELLATIONS } from './catalog/constellations.js'



// MONTHS

export const NORTH = ['Orion', 'Auriga', 'Gemini', 'Leo', 'Big Dipper', 'Scorpius', 'Lyra', 'Sagittarius', 'Cygnus', 'Great Square', 'Cassiopeia', 'Taurus']

export const SOUTH = ['Orion', 'Orion', 'Gemini', 'Leo', 'Leo', 'Scorpius', 'Scorpius', 'Sagittarius', 'Sagittarius', 'Great Square', 'Great Square', 'Taurus']



// MONTH CONSTELLATION

export function monthConstellation(date, place) {
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: place.timeZone, month: 'numeric' }).format(date)) - 1
  const name = (place.latitude < 0 ? SOUTH : NORTH)[month]

  return CONSTELLATIONS.find(constellation => constellation.name === name)
}
