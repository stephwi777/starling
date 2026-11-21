import { litSide } from '../../sky/comingUp.js'
import {
  FullMoonIcon,
  HalfMoonIcon,
  LunarEclipseIcon,
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
  'shower': () => <SkyIcon object={{ kind: 'shower' }} />,
}



// EVENT ICON

function EventIcon({ icon, south }) {
  if (icon.startsWith('planet:')) return <SkyIcon object={{ kind: 'planet', name: icon.slice(7) }} />
  if (icon === 'first-quarter' || icon === 'last-quarter') return <HalfMoonIcon side={litSide(icon, south)} />

  const Icon = ICONS[icon]

  return Icon ? <Icon /> : null
}

export default EventIcon
