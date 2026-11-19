import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import IconWell from '../src/components/ui/IconWell.jsx'
import { SHAPES } from '../src/components/ui/constellationShapes.js'
import { phaseAngle } from '../src/sky/skyLook.js'
import * as Icons from '../src/components/ui/icons.jsx'



// GROUPS

const GROUPS = [
  {
    title: 'Hour by hour',
    size: 26,
    items: [
      ['Sunset', Icons.SunsetIcon, 'The moment the Sun sets'],
      ['Twilight', Icons.TwilightIcon, 'Hours while the Sun is just below the horizon, and the moment morning twilight begins'],
      ['Fully dark', Icons.SparkleIcon, 'The moment it gets fully dark'],
      ['Clear', Icons.ClearIcon, 'Dark hours under 20% cloud'],
      ['Patchy', Icons.PatchyIcon, 'Dark hours with 20–60% cloud'],
      ['Cloudy', Icons.CloudIcon, 'Dark hours with 60% cloud or more'],
      ['Dark', Icons.DarkIcon, 'Dark hours while the forecast is loading or unavailable'],
      ['Moonrise', Icons.MoonriseIcon, 'The Moon rises during the night'],
      ['Moonset', Icons.MoonsetIcon, 'The Moon sets during the night'],
      ['Sunrise', Icons.SunriseIcon, 'The end of the night'],
    ],
  },
  {
    title: 'Card headings',
    well: true,
    items: [
      ['Hour by hour', Icons.ClockIcon, 'Tonight: the hours heading (shown small, beside the words)'],
      ['Next 7 nights', Icons.NightsIcon, 'Tonight'],
      ['Up tonight', Icons.SparkleIcon, 'Tonight'],
      ['Tonight in your place', Icons.MoonIcon, 'Home: Tonight card'],
      ['Coming up', Icons.CalendarIcon, 'Home: Coming up card'],
    ],
  },
  {
    title: 'Coming up events',
    well: true,
    items: [
      ['Meteor shower', Icons.MeteorIcon, 'Home: Coming up, and Tonight: Up tonight'],
      ['Full Moon', Icons.FullMoonIcon, 'Home: Coming up'],
      ['New Moon', Icons.NewMoonIcon, 'Home: Coming up'],
      ['First quarter', () => <Icons.HalfMoonIcon side="right" />, 'Home: Coming up (lit side flips in the south)'],
      ['Last quarter', () => <Icons.HalfMoonIcon side="left" />, 'Home: Coming up'],
    ],
  },
  {
    title: 'Up tonight',
    well: true,
    items: [
      ['Saturn', Icons.SaturnIcon, 'Tonight: Up tonight'],
      ['Pleiades', Icons.ClusterIcon, 'Tonight: Up tonight'],
      ['Andromeda Galaxy', Icons.GalaxyIcon, 'Tonight: Up tonight'],
    ],
  },
  {
    title: 'Home doors',
    well: true,
    items: [
      ['Find dark skies', Icons.PineIcon, 'Home: door to the Map'],
      ['Sky tools', Icons.TelescopeIcon, 'Home: door to Tools'],
      ...Object.keys(SHAPES).map(name => [name, () => <Icons.ConstellationIcon name={name} />, 'Home: this month’s constellation']),
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



// ITEM

function Item({ name, Icon, used, size, well }) {
  return (
    <div className="item">
      <div className="sizes">
        <span className="big"><Icon /></span>
        {well ? <IconWell><Icon /></IconWell> : <span className="actual" style={{ '--size': `${size}px` }}><Icon /></span>}
      </div>
      <strong>{name}</strong>
      <small>{used}</small>
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Icon sheet</h1>
      <p>Every icon on the site. Each one is shown large on the left and at its real size on the right.</p>


      {GROUPS.map(group => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <div className="grid">
            {group.items.map(([name, Icon, used]) => (
              <Item key={name} name={name} Icon={Icon} used={used} size={group.size} well={group.well} />
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2>Moon phases</h2>
        <div className="grid">
          {PHASES.map(([name, lit]) => (
            <Item key={name} name={name} Icon={() => <Icons.PhaseMoon angle={phaseAngle(lit)} size={64} />} used="Tonight: Moon tile and Next 7 nights" size={24} />
          ))}
          <Item name="Waxing, southern sky" Icon={() => <Icons.PhaseMoon angle={phaseAngle(0.66)} size={64} south />} used="The same Moon, mirrored for the southern hemisphere" size={24} />
        </div>
      </section>
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
