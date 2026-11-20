import { MoonIcon, PlanetIcon } from './planets.jsx'
import { DoubleIcon, StarIcon } from './stars.jsx'
import { FigureIcon } from './figures.jsx'
import { GalaxyIcon } from './galaxies.jsx'
import { ClusterIcon, GlobularIcon } from './clusters.jsx'
import { NebulaIcon } from './nebulas.jsx'
import { ShowerIcon } from './showers.jsx'



// DRAWING

function Drawing({ object, moonAngle }) {
  switch (object.kind) {
    case 'moon':
      return <MoonIcon angle={moonAngle ?? 90} />
    case 'planet':
      return <PlanetIcon name={object.name} />
    case 'star':
      return <StarIcon tint={object.tint} mag={object.mag} />
    case 'double':
      return <DoubleIcon object={object} />
    case 'shape':
      return object.figure ? <FigureIcon figure={object.figure} /> : null
    case 'galaxy':
      return <GalaxyIcon object={object} />
    case 'cluster':
      return <ClusterIcon object={object} />
    case 'globular':
      return <GlobularIcon object={object} />
    case 'nebula':
    case 'planetary':
      return <NebulaIcon object={object} />
    case 'shower':
      return <ShowerIcon />
    default:
      return null
  }
}



// SKY ICON

function SkyIcon({ object, moonAngle }) {
  return (
    <svg className="sky-icon" viewBox="-13 -13 26 26" aria-hidden="true">
      <Drawing object={object} moonAngle={moonAngle} />
    </svg>
  )
}

export default SkyIcon
