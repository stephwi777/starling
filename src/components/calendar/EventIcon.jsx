import { litSide } from '../../sky/moonFacts.js'
import { DEEP_SKY } from '../../sky/catalog/deepSky.js'
import { STARS } from '../../sky/catalog/stars.js'
import {
  FullMoonIcon,
  HalfMoonIcon,
  LunarEclipseIcon,
  MilkyWayIcon,
  MoonIcon,
  NewMoonIcon,
  ParadeIcon,
  SeasonIcon,
  SolarEclipseIcon,
  TransitIcon,
} from '../ui/icons.jsx'
import SkyIcon from '../sky-icons/SkyIcon.jsx'



// ICONS

const ICONS = {
  'full-moon': () => <FullMoonIcon />,
  'new-moon': () => <NewMoonIcon />,
  'moon-close': () => <MoonIcon />,
  'moon-far': () => <MoonIcon />,
  'moon-node': () => <MoonIcon />,
  'solar-eclipse': () => <SolarEclipseIcon />,
  'lunar-eclipse': () => <LunarEclipseIcon />,
  'transit': () => <TransitIcon />,
  'season': () => <SeasonIcon />,
  'parade': () => <ParadeIcon />,
  'milky-way': () => <MilkyWayIcon />,
  'shower': () => <SkyIcon object={{ kind: 'shower' }} />,
}



// EVENT ICON

function EventIcon({ icon, south }) {
  if (icon.startsWith('planet:')) return <SkyIcon object={{ kind: 'planet', name: icon.slice(7) }} />
  if (icon.startsWith('sky:')) return <SkyIcon object={[...STARS, ...DEEP_SKY].find(object => object.id === icon.slice(4))} />
  if (icon === 'first-quarter' || icon === 'last-quarter') return <HalfMoonIcon side={litSide(icon, south)} />

  const Icon = ICONS[icon]

  return Icon ? <Icon /> : null
}

export default EventIcon
