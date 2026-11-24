import { CLOUD_PATHS } from './cloudShapes.js'
import { LAYOUTS } from './cloudLayouts.js'
import './Clouds.css'



// CLOUD

function placeOf(cloud) {
  if (cloud.moon) return { right: `${cloud.moon.right}px`, top: `${cloud.moon.top}px`, width: `${cloud.w}cqw` }
  if (cloud.at !== undefined) return { left: `${cloud.at}%`, bottom: `calc(var(--ground) * ${cloud.ground})`, width: `${cloud.tall}cqh`, translate: '-50% 0' }
  if (cloud.ground !== undefined) return { left: `${cloud.x}%`, bottom: `calc(var(--ground) * ${cloud.ground})`, width: `${cloud.w}%` }
  if (cloud.tuck !== undefined) return { left: `${cloud.x}%`, '--top': `${cloud.y}%`, '--tuck': cloud.tuck, width: `${cloud.w}%` }

  return { left: `${cloud.x}%`, top: `${cloud.y}%`, width: `${cloud.w}%` }
}

function Cloud({ cloud }) {
  const box = (
    <div className={cloud.tuck === undefined ? 'cloud-box' : 'cloud-box tuck'} style={placeOf(cloud)}>
      <svg className={cloud.flip ? 'cloud flip' : 'cloud'} viewBox="0 0 200 72">
        <path d={CLOUD_PATHS[cloud.shape]} style={{ fill: `var(--shade-${cloud.shade})` }} />
      </svg>
    </div>
  )

  return cloud.moon ? <div className="moon-spot">{box}</div> : box
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
          <Group clouds={LAYOUTS[3].desktop} size="desktop" />
          <Group clouds={LAYOUTS[3].phone} size="phone" />
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
