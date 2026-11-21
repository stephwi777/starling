// GROUPS

export const GROUPS = [
  { id: 'moon', name: 'Moon' },
  { id: 'eclipse', name: 'Eclipses and transits' },
  { id: 'planet', name: 'Planets' },
  { id: 'meteor', name: 'Meteor showers' },
  { id: 'sun', name: 'Sun and seasons' },
]



// KINDS

export const KINDS = [
  { id: 'full-moon', group: 'moon', name: 'Full Moon', on: true },
  { id: 'new-moon', group: 'moon', name: 'New Moon', on: true },
  { id: 'supermoon', group: 'moon', name: 'Supermoon', on: true },
  { id: 'blue-moon', group: 'moon', name: 'Blue Moon', on: true },
  { id: 'quarter-moon', group: 'moon', name: 'First and last quarter', on: false },
  { id: 'micromoon', group: 'moon', name: 'Micromoon', on: false },
  { id: 'black-moon', group: 'moon', name: 'Black Moon', on: false },
  { id: 'moon-distance', group: 'moon', name: 'Closest and farthest', on: false },
  { id: 'moon-node', group: 'moon', name: 'Crossing the Sun’s path', on: false },

  { id: 'solar-eclipse', group: 'eclipse', name: 'Solar eclipses', on: true },
  { id: 'lunar-eclipse', group: 'eclipse', name: 'Lunar eclipses', on: true },
  { id: 'transit', group: 'eclipse', name: 'Mercury and Venus transits', on: true },

  { id: 'opposition', group: 'planet', name: 'At their best', on: true },
  { id: 'venus-brightest', group: 'planet', name: 'Venus at its brightest', on: true },
  { id: 'mars-closest', group: 'planet', name: 'Mars closest to Earth', on: true },
  { id: 'planet-pair', group: 'planet', name: 'Close pairs of planets', on: true },
  { id: 'moon-planet', group: 'planet', name: 'Moon near a planet', on: true },
  { id: 'parade', group: 'planet', name: 'Planet parades', on: true },
  { id: 'station', group: 'planet', name: 'Turning points', on: false },
  { id: 'solar-conjunction', group: 'planet', name: 'Behind or in front of the Sun', on: false },
  { id: 'planet-distance', group: 'planet', name: 'Closest and farthest from the Sun', on: false },

  { id: 'major-shower', group: 'meteor', name: 'Major showers', on: true },
  { id: 'minor-shower', group: 'meteor', name: 'Minor showers', on: true },

  { id: 'season', group: 'sun', name: 'Equinoxes and solstices', on: true },
  { id: 'earth-distance', group: 'sun', name: 'Earth closest and farthest', on: false },
]

export const DEFAULT_KINDS = KINDS.filter(kind => kind.on).map(kind => kind.id)

export function groupOf(kindId) {
  return KINDS.find(kind => kind.id === kindId)?.group ?? null
}
