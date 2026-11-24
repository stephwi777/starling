import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import IconWell from '../src/components/ui/IconWell.jsx'
import EventIcon from '../src/components/calendar/EventIcon.jsx'
import { phaseAngle } from '../src/sky/skyLook.js'
import * as Icons from '../src/components/ui/icons.jsx'
import SkyIcon from '../src/components/sky-icons/SkyIcon.jsx'
import GearGlyph from '../src/components/sky-icons/GearGlyph.jsx'
import { SKY_DEEP, SKY_SHAPES, SKY_STARS } from '../src/sky/catalog/sky.js'



// GROUPS

const event = icon => () => <EventIcon icon={icon} />

const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']

const BRIGHT = PLANETS.slice(0, 5)
const PAIRS = BRIGHT.flatMap((a, i) => BRIGHT.slice(i + 1).map(b => [a, b]))

const ALL_SKY = [...SKY_STARS, ...SKY_DEEP, ...SKY_SHAPES]
const sky = id => () => <SkyIcon object={ALL_SKY.find(object => object.id === id)} />

function Glyph({ box = '0 0 16 16', children }) {
  return <svg viewBox={box} style={{ color: 'var(--mist)' }} aria-hidden="true">{children}</svg>
}

const PIN = 'M6 0C2.7 0 0 2.6 0 5.9 0 10.3 6 16 6 16s6-5.7 6-10.1C12 2.6 9.3 0 6 0Zm0 8.2A2.3 2.3 0 1 1 6 3.6a2.3 2.3 0 0 1 0 4.6Z'

const GROUPS = [
  {
    title: 'Calendar events',
    well: true,
    items: [
      ['Full Moon', event('full-moon'), 'Full, Blue and super Moons'],
      ['New Moon', event('new-moon'), 'New and Black Moons'],
      ['First quarter', event('first-quarter'), 'Lit side flips in the south'],
      ['Last quarter', event('last-quarter'), ''],
      ['Moon closest', event('moon-close'), ''],
      ['Moon farthest', event('moon-far'), ''],
      ['Moon crosses the Sun’s path', event('moon-node'), ''],
      ['Moon covers a star or planet', event('occultation'), 'Occultations'],
      ['Solar eclipse', event('solar-eclipse'), ''],
      ['Lunar eclipse', event('lunar-eclipse'), ''],
      ['Transit', event('transit'), 'Mercury or Venus crossing the Sun'],
      ...PLANETS.map(name => [name, event(`planet:${name}`), 'At its best, pairs, Moon near a planet, turning points']),
      ...PAIRS.map(([a, b]) => [`${a} & ${b}`, event(`pair:${a}+${b}`), 'Two planets close together']),
      ['Planet parade', event('parade'), ''],
      ['Meteor shower', event('shower'), 'Every shower peak'],
      ['Pleiades', event('sky:M45'), 'Moon or a planet near the Pleiades'],
      ['Beehive', event('sky:M44'), 'Moon or a planet near the Beehive'],
      ['Aldebaran', event('sky:Aldebaran'), 'Moon near a bright star'],
      ['Regulus', event('sky:Regulus'), ''],
      ['Spica', event('sky:Spica'), ''],
      ['Antares', event('sky:Antares'), ''],
      ['Equinox / solstice', event('season'), 'Also Earth closest and farthest'],
      ['Milky Way season', event('milky-way'), 'Begins and ends'],
      ['Comet', event('comet'), 'Comet arrives, at its best, last look'],
    ],
  },
  {
    title: 'Up tonight objects',
    well: true,
    items: [
      ['Sirius', sky('Sirius'), 'Brightest star: biggest glow'],
      ['Vega', sky('Vega'), 'Very bright star'],
      ['Deneb', sky('Deneb'), 'Bright star: small glow'],
      ['Menkar', sky('Menkar'), 'Fainter star: no glow'],
      ['Albireo', sky('Albireo'), 'Double star'],
      ['Andromeda Galaxy', sky('M31'), 'Spiral galaxy'],
      ['M49', sky('M49'), 'Elliptical galaxy'],
      ['Cigar Galaxy', sky('M82'), 'Irregular galaxy'],
      ['Orion Nebula', sky('M42'), 'Bright nebula'],
      ['Ring Nebula', sky('M57'), 'Planetary nebula'],
      ['Crab Nebula', sky('M1'), 'Supernova remnant'],
      ['M78', sky('M78'), 'Reflection nebula'],
      ['Coalsack', sky('C99'), 'Dark nebula'],
      ['Hercules Cluster', sky('M13'), 'Globular cluster'],
      ['Pleiades', sky('M45'), 'Open cluster (real stars)'],
      ['Wild Duck Cluster', sky('M11'), 'Open cluster'],
      ['Sagittarius Star Cloud', sky('M24'), 'Milky Way star cloud'],
      ['Hyades', sky('C41'), 'Cluster with its V shape'],
      ['Orion', sky('Orion'), 'Constellation figure'],
      ['Big Dipper', sky('Big Dipper'), 'Star pattern'],
    ],
  },
  {
    title: 'Small interface glyphs',
    well: true,
    items: [
      ['Location pin', () => <Glyph box="-2 0 16 16"><path d={PIN} fill="currentColor" /></Glyph>, 'Header and Calendar switch'],
      ['Worldwide globe', () => <Glyph><g fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="8" cy="8" r="6.2" /><ellipse cx="8" cy="8" rx="2.7" ry="6.2" /><path d="M2 8 H14" /></g></Glyph>, 'Calendar switch'],
      ['Search', () => <Glyph><circle cx="6.8" cy="6.8" r="4.6" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M10.4 10.4 L14 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></Glyph>, 'Calendar and Up tonight search boxes'],
      ['Choose events', () => <Glyph><path d="M2 4 H14 M4.5 8 H11.5 M7 12 H9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></Glyph>, 'Calendar filter button'],
      ['Close', () => <Glyph><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></Glyph>, 'Panels, event cards and clearing a search'],
      ['Chevron', () => <Glyph><path d="M6 3 L11 8 L6 13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></Glyph>, 'Month arrows, Up tonight, panels'],
      ['Door sparkle', () => <Glyph box="0 0 14 14"><path d="M7 0 Q8 6 14 7 Q8 8 7 14 Q6 8 0 7 Q6 6 7 0 Z" fill="currentColor" /></Glyph>, 'Links like “Explore …”'],
      ['Eyes', () => <span style={{ color: 'var(--mist)' }}><GearGlyph gear={1} /></span>, 'Up tonight: gear needed'],
      ['Binoculars', () => <span style={{ color: 'var(--mist)' }}><GearGlyph gear={2} /></span>, ''],
      ['Telescope', () => <span style={{ color: 'var(--mist)' }}><GearGlyph gear={3} /></span>, ''],
    ],
  },
  {
    title: 'Hour by hour',
    size: 26,
    items: [
      ['Sunset', Icons.SunsetIcon, 'The moment the Sun sets'],
      ['Twilight', Icons.TwilightIcon, 'Twilight hours, and the moment dark ends'],
      ['Fully dark', Icons.SparkleIcon, 'The moment it gets fully dark'],
      ['Clear', Icons.ClearIcon, 'Dark hours under 20% cloud'],
      ['Patchy', Icons.PatchyIcon, 'Dark hours with 20–60% cloud'],
      ['Cloudy', Icons.CloudIcon, 'Dark hours with 60% cloud or more'],
      ['Rain', Icons.RainIcon, 'Hours with rain likely'],
      ['Snow', Icons.SnowIcon, 'Hours with snow likely'],
      ['Dark', Icons.DarkIcon, 'Dark hours while the forecast loads'],
      ['Moonrise', Icons.MoonriseIcon, ''],
      ['Moonset', Icons.MoonsetIcon, ''],
      ['Sunrise', Icons.SunriseIcon, 'The end of the night'],
    ],
  },
  {
    title: 'Card headings and Home doors',
    well: true,
    items: [
      ['Hour by hour', Icons.ClockIcon, 'Tonight (shown small, beside the words)'],
      ['Next 7 nights', Icons.NightsIcon, 'Tonight'],
      ['Up tonight', Icons.SparkleIcon, 'Tonight; also Home’s constellation door while it loads'],
      ['Tonight in your place', Icons.MoonIcon, 'Home: Tonight card'],
      ['Coming up', Icons.CalendarIcon, 'Home: Coming up card'],
      ['Find dark skies', Icons.PineIcon, 'Home: door to the Map'],
      ['Sky tools', Icons.TelescopeIcon, 'Home: door to Tools'],
    ],
  },

]

const PHASES = [
  ['New', 0.01],
  ['Waxing crescent', 0.2],
  ['First quarter', 0.5],
  ['Waxing gibbous', 0.8],
  ['Full', 0.99],
]



// NUMBERS

function numberOf(group, index) {
  return GROUPS.slice(0, group).reduce((sum, { items }) => sum + items.length, 0) + index + 1
}



// ITEM

function Item({ number, name, Icon, used, size, well }) {
  return (
    <div className="item">
      <div className="sizes">
        <span className="big"><Icon /></span>
        {well ? <IconWell><Icon /></IconWell> : <span className="actual" style={{ '--size': `${size}px` }}><Icon /></span>}
      </div>
      <strong>{number} · {name}</strong>
      <small>{used}</small>
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Icon sheet</h1>
      <p>Every icon on the site, numbered so you can point at them. Each one is shown large on the left and at its real size on the right.</p>


      {GROUPS.map((group, g) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <div className="grid">
            {group.items.map(([name, Icon, used], i) => (
              <Item key={name} number={numberOf(g, i)} name={name} Icon={Icon} used={used} size={group.size} well={group.well} />
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2>Moon phases</h2>
        <div className="grid">
          {PHASES.map(([name, lit], i) => (
            <Item key={name} number={numberOf(GROUPS.length, i)} name={name} Icon={() => <Icons.PhaseMoon angle={phaseAngle(lit)} size={64} />} used="Tonight: Moon tile and Next 7 nights" size={24} />
          ))}
          <Item number={numberOf(GROUPS.length, PHASES.length)} name="Waxing, southern sky" Icon={() => <Icons.PhaseMoon angle={phaseAngle(0.66)} size={64} south />} used="The same Moon, mirrored for the southern hemisphere" size={24} />
        </div>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
