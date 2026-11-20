import { STARS } from './stars.js'
import { CONSTELLATIONS } from './constellations.js'
import { ASTERISMS } from './asterisms.js'
import { DEEP_SKY } from './deepSky.js'
import { GEAR, HINTS } from './hints.js'



// WORDS

function article(word) {
  return /^[aeiou]/.test(word) ? 'An' : 'A'
}

const GALAXY_WORDS = {
  spiral: 'spiral',
  barred: 'barred spiral',
  elliptical: 'elliptical',
  irregular: 'irregular',
  lenticular: 'lens-shaped',
}

const DEEP_LINES = {
  'cluster/open': 'A cluster of young stars',
  'cluster/cloud': 'A bright patch of the Milky Way',
  'cluster/asterism': 'A small group of four stars',
  'globular/null': 'A ball of old stars',
  'planetary/null': 'The glowing shell of a dying star',
  'nebula/emission': 'A glowing cloud of gas',
  'nebula/reflection': 'A dusty cloud lit by nearby stars',
  'nebula/dark': 'A dark cloud of dust against the Milky Way',
  'nebula/remnant': 'What’s left of an exploded star',
  'double/null': 'A faint pair of stars',
}

function starLine(star) {
  if (star.kind === 'double') return `A double star in ${star.con}: ${star.colors}.`
  if (!star.tint) return `A bright star in ${star.con}.`

  return `${article(star.tint)} ${star.tint} star in ${star.con}.`
}

function deepLine(object) {
  if (object.kind === 'galaxy') {
    const word = GALAXY_WORDS[object.type]

    return `${article(word)} ${word} galaxy in ${object.con}.`
  }

  return `${DEEP_LINES[`${object.kind}/${object.type}`]} in ${object.con}.`
}

function constellationLine(constellation) {
  if (constellation.english === constellation.id) return 'One of the 88 constellations.'

  return `The ${constellation.english.toLowerCase()}.`
}



// BRIGHTNESS

const RANK_MAG = { 1: 2, 2: 3, 3: 4 }



// SKY LISTS

export const SKY_STARS = STARS.map(star => ({
  ...star,
  name: star.id,
  hint: HINTS[star.id] ?? starLine(star),
}))

export const SKY_SHAPES = [
  ...CONSTELLATIONS.map(constellation => ({
    ...constellation,
    name: constellation.id,
    kind: 'shape',
    group: 'constellation',
    mag: RANK_MAG[constellation.rank],
    hint: HINTS[constellation.id] ?? constellationLine(constellation),
  })),
  ...ASTERISMS.map(asterism => ({
    ...asterism,
    name: asterism.id,
    kind: 'shape',
    group: 'asterism',
    mag: 2,
    hint: HINTS[asterism.id] ?? 'A well-known star pattern.',
  })),
]

export const SKY_DEEP = DEEP_SKY.map(object => ({
  ...object,
  name: object.name ?? object.id,
  gear: GEAR[object.id] ?? object.gear,
  hint: HINTS[object.id] ?? deepLine(object),
}))
