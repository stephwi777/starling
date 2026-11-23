import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import IconWell from '../src/components/ui/IconWell.jsx'
import SkyIcon from '../src/components/sky-icons/SkyIcon.jsx'
import EventIcon from '../src/components/calendar/EventIcon.jsx'
import { SunriseIcon, SunsetIcon, SeasonIcon } from '../src/components/ui/icons.jsx'
import { StarIcon } from '../src/components/sky-icons/stars.jsx'
import { Spark } from '../src/components/sky-icons/parts.jsx'
import { TINTS } from '../src/components/sky-icons/shapes.js'
import { SKY_STARS } from '../src/sky/catalog/sky.js'



// FRAME

function Icon({ children }) {
  return <svg viewBox="-13 -13 26 26" aria-hidden="true">{children}</svg>
}

const star = id => SKY_STARS.find(object => object.id === id)
const now = id => () => <SkyIcon object={star(id)} />



// DOUBLE STARS

const WORDS = {
  gold: 'var(--meteor-gold)',
  blue: 'var(--neptune)',
  orange: 'var(--star-orange)',
  white: 'var(--frost)',
  yellow: 'var(--star-warm)',
  'yellow-white': 'var(--star-cream)',
  'blue-white': 'var(--star-icy)',
  red: 'var(--star-red)',
  green: 'var(--leaf)',
}

const TINT_OF = { gold: 'yellow', blue: 'blue-white', 'blue-white': 'blue-white', white: 'white', yellow: 'yellow', 'yellow-white': 'yellow-white', orange: 'orange', red: 'red' }

function SparkPair({ object }) {
  const [first, second] = object.colors.split(' and ').map(word => word.trim())
  const tint = object.tint ?? TINT_OF[first]

  return (
    <>
      <g transform="translate(-2.6 2.4) scale(0.82)">
        <StarIcon tint={tint} mag={object.mag} />
      </g>
      <Spark x={7.4} y={-6.6} s={0.34} fill={WORDS[second ?? first] ?? TINTS[tint]} />
    </>
  )
}

const pair = id => () => <Icon><SparkPair object={star(id)} /></Icon>



// SUN ON THE HORIZON

const DOWN = 'M0 -11 V-3 M-2.6 -5.6 L0 -3 L2.6 -5.6'
const UP = 'M0 -3 V-11 M-2.6 -8.4 L0 -11 L2.6 -8.4'
const RAYS = [-180, -135, -45, 0]

function HorizonSun({ arrow, color }) {
  return (
    <Icon>
      <path d="M-11 6 H11" stroke="var(--mist)" strokeWidth="2" strokeLinecap="round" />
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        {RAYS.map(angle => {
          const a = (angle * Math.PI) / 180

          return <path key={angle} d={`M${7 * Math.cos(a)} ${3.6 + 7 * Math.sin(a)} L${9.6 * Math.cos(a)} ${3.6 + 9.6 * Math.sin(a)}`} />
        })}
      </g>
      <path d="M-5 3.6 A5 5 0 0 1 5 3.6 Z" fill={color} />
      <path d={arrow} stroke="var(--mist)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}



// ROWS

const ROWS = [
  {
    title: 'Double stars on Up tonight',
    note: 'Today, Up tonight draws double stars as two flat circles, so Rigel, Antares, Polaris and Castor look like planets there but like stars on the Calendar. The fix draws the main star exactly as a single star (same sparkle, same glow rule by brightness) with a small sparkle beside it for its partner, in the partner’s color.',
    options: [
      ['Now · Rigel', now('Rigel'), 'Two circles'],
      ['Rigel', pair('Rigel'), 'Bright: double glow'],
      ['Now · Antares', now('Antares'), 'Two circles'],
      ['Antares', pair('Antares'), 'Red with a green partner'],
      ['Now · Polaris', now('Polaris'), 'Two circles'],
      ['Polaris', pair('Polaris'), 'Single glow'],
      ['Calendar · Antares', () => <EventIcon icon="sky:Antares" />, 'For comparison'],
    ],
  },
  {
    title: 'Sunrise and sunset',
    note: 'The hourly sunrise and sunset suns have thinner rays (1.6) than every other sun (2). The fix uses the same ray weight and 45° spacing as the solstice sun, leaving the top open for the arrow.',
    options: [
      ['Now · Sunrise', () => <SunriseIcon />, 'Thin rays'],
      ['Sunrise', () => <HorizonSun arrow={UP} color="var(--beak)" />, 'Same rays as the solstice'],
      ['Now · Sunset', () => <SunsetIcon />, 'Thin rays'],
      ['Sunset', () => <HorizonSun arrow={DOWN} color="var(--bronze)" />, 'Same rays, sunset bronze'],
      ['Solstice', () => <SeasonIcon />, 'For comparison'],
    ],
  },
]



// OPTION

function Option({ name, Draw, note, current }) {
  return (
    <div className={current ? 'option now' : 'option'}>
      <div className="sizes">
        <span className="big"><Draw /></span>
        <IconWell><Draw /></IconWell>
      </div>
      <strong>{name}</strong>
      {note && <small>{note}</small>}
    </div>
  )
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Icon options</h1>
      <p>Each option is shown large and at its real size in an icon square. Darker cards are today’s icons; the others are the fixes.</p>

      {ROWS.map(row => (
        <section key={row.title}>
          <h2>{row.title}</h2>
          <p>{row.note}</p>
          <div className="options">
            {row.options.map(([name, Draw, note]) => <Option key={name} name={name} Draw={Draw} note={note} current={name.startsWith('Now')} />)}
          </div>
        </section>
      ))}
    </main>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(<Sheet />)

export default Sheet
