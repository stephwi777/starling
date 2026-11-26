// TOOLS

function tool(id, title, line, to = `/tools/${id}`) {
  return { id, title, line, to, ready: false, Scene: null }
}



// GROUPS

export const TOOL_GROUPS = [
  {
    id: 'find',
    title: 'Find your way around the sky',
    tools: [
      tool('chart', 'Star chart', 'Find your way around tonight’s sky.'),
      tool('phone', 'Phone sky view', 'Hold up your phone and see what you’re looking at.'),
      tool('photo', 'Photo star finder', 'Share a night photo and we’ll name what’s in it.'),
      tool('solar-system', 'Solar system view', 'See where the planets are around the Sun.'),
    ],
  },
  {
    id: 'catch',
    title: 'Catch something special',
    tools: [
      tool('passes', 'Space station passes', 'See when the station flies over you!'),
      tool('aurora', 'Aurora', 'Could you catch an aurora tonight?'),
      tool('sunset', 'Sunset forecast', 'Will tonight’s sunset be a colorful one?'),
      tool('moonbow', 'Moonbow chances', 'A rainbow by moonlight. Rare, but here’s when to look.'),
    ],
  },
  {
    id: 'plan',
    title: 'Plan your night out',
    tools: [
      tool('map', 'Sky map', 'Dark places, light pollution and the aurora on one map.', '/map'),
      tool('satellite', 'Live cloud satellite', 'Watch the clouds move in from space.'),
      tool('almanac', 'Almanac', 'Rise, set and twilight times for any date.'),
      tool('printables', 'Printable charts', 'Star wheels and finder charts to print and take outside.'),
    ],
  },
  {
    id: 'closer',
    title: 'Look closer',
    tools: [
      tool('moon-map', 'Moon map', 'Seas and craters you can spot with binoculars.'),
      tool('sun', 'The Sun today', 'Today’s sunspots and flares, straight from NASA!'),
      tool('jupiter', 'Jupiter’s moons', 'See where Jupiter’s four big moons are tonight.'),
      tool('eyepiece', 'Eyepiece view', 'See how an object will look in your telescope or camera.'),
    ],
  },
]

export const TOOLS = TOOL_GROUPS.flatMap(group => group.tools)
