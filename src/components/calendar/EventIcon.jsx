import { litSide } from '../../sky/moonFacts.js'
import { DEEP_SKY } from '../../sky/catalog/deepSky.js'
import { STARS } from '../../sky/catalog/stars.js'
import {
  CometIcon,
  FullMoonIcon,
  HalfMoonIcon,
  LunarEclipseIcon,
  MilkyWayIcon,
  MoonCloseIcon,
  MoonFarIcon,
  MoonNodeIcon,
  NewMoonIcon,
  OccultationIcon,
  ParadeIcon,
  SeasonIcon,
  SolarEclipseIcon,
  TransitIcon,
} from '../ui/icons.jsx'
import SkyIcon from '../sky-icons/SkyIcon.jsx'
import { PlanetIcon } from '../sky-icons/planets.jsx'



// ICONS

const ICONS = {
  'full-moon': () => <FullMoonIcon />,
  'new-moon': () => <NewMoonIcon />,
  'moon-close': () => <MoonCloseIcon />,
  'moon-far': () => <MoonFarIcon />,
  'moon-node': () => <MoonNodeIcon />,
  'occultation': () => <OccultationIcon />,
  'solar-eclipse': () => <SolarEclipseIcon />,
  'lunar-eclipse': () => <LunarEclipseIcon />,
  'transit': () => <TransitIcon />,
  'comet': () => <CometIcon />,
  'season': () => <SeasonIcon />,
  'parade': () => <ParadeIcon />,
  'milky-way': () => <MilkyWayIcon />,
  'shower': () => <SkyIcon object={{ kind: 'shower' }} />,
}



// PLANET PAIR

function PairIcon({ front, back }) {
  return (
    <svg className="sky-icon" viewBox="-13 -13 26 26" aria-hidden="true">
      <g transform="translate(3.8 -3.8) scale(0.6)"><PlanetIcon name={back} /></g>
      <g transform="translate(-3.4 3.4) scale(0.66)"><PlanetIcon name={front} /></g>
    </svg>
  )
}



// EVENT ICON

function EventIcon({ icon, south }) {
  if (icon.startsWith('pair:')) {
    const [front, back] = icon.slice(5).split('+')

    return <PairIcon front={front} back={back} />
  }

  if (icon.startsWith('planet:')) return <SkyIcon object={{ kind: 'planet', name: icon.slice(7) }} />
  if (icon.startsWith('sky:')) return <SkyIcon object={[...STARS, ...DEEP_SKY].find(object => object.id === icon.slice(4))} />
  if (icon === 'first-quarter' || icon === 'last-quarter') return <HalfMoonIcon side={litSide(icon, south)} />

  const Icon = ICONS[icon]

  return Icon ? <Icon /> : null
}

export default EventIcon
