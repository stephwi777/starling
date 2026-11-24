import { CLOUD_PATHS } from './cloudShapes.js'
import { LAYOUTS } from './cloudLayouts.js'
import './Clouds.css'



// CLOUD

function placeOf(cloud) {
  if (cloud.moon) return undefined
  if (cloud.bottom !== undefined) return { left: `${cloud.x}%`, bottom: `${cloud.bottom}%`, width: `${cloud.w}%` }

  return { left: `${cloud.x}%`, top: `${cloud.y}%`, width: `${cloud.w}%` }
}

function Cloud({ cloud }) {
  const svg = (
    <svg className={cloud.flip ? 'cloud flip' : 'cloud'} viewBox="0 0 200 72" style={placeOf(cloud)}>
      <path d={CLOUD_PATHS[cloud.shape]} style={{ fill: `var(--shade-${cloud.shade})` }} />
    </svg>
  )

  if (!cloud.moon) return svg

  return (
    <div className="moon-spot">
      <div style={{ right: `${cloud.moon.right}px`, top: `${cloud.moon.top}px`, width: `${cloud.w}cqw` }}>{svg}</div>
    </div>
  )
}

function Group({ clouds, size }) {
  return (
    <div className={size}>
      {clouds.map((cloud, i) => <Cloud key={i} cloud={cloud} />)}
    </div>
  )
}



// CLOUDS

function Clouds({ level }) {
  if (!level) return null

  if (level === 3) {
    return (
      <div className="clouds level-3" aria-hidden="true">
        <div className="canvas">
          <Group clouds={LAYOUTS[3].canvas} size="all" />
        </div>
      </div>
    )
  }

  return (
    <div className={`clouds level-${level}`} aria-hidden="true">
      <Group clouds={LAYOUTS[level].desktop} size="desktop" />
      <Group clouds={LAYOUTS[level].phone} size="phone" />
    </div>
  )
}

export default Clouds
