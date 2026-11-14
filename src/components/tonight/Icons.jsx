import './Icons.css'



// MOON

export function MoonShape({ angle, r = 10 }) {
  const lit = (1 - Math.cos((angle * Math.PI) / 180)) / 2
  const waxing = angle < 180
  const rx = r * Math.abs(1 - 2 * lit)
  const outer = waxing ? 1 : 0
  const inner = lit < 0.5 ? 1 - outer : outer

  return (
    <>
      <circle r={r} fill="var(--moon-dark)" />
      <path d={`M0 ${-r} A${r} ${r} 0 0 ${outer} 0 ${r} A${rx} ${r} 0 0 ${inner} 0 ${-r} Z`} fill="var(--moon)" />
    </>
  )
}

export function MoonIcon({ angle }) {
  return (
    <svg className="moon-icon" viewBox="-12 -12 24 24" aria-hidden="true">
      <MoonShape angle={angle} />
    </svg>
  )
}



// OBJECTS

function Dots({ points, r = 2.2, fill = 'var(--frost)' }) {
  return points.map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={fill} />)
}

function shape(object, moonAngle) {
  const color = `var(${object.color})`

  switch (object.kind) {
    case 'moon':
      return <MoonShape angle={moonAngle} r={9} />
    case 'planet':
      if (object.name === 'Saturn') {
        return (
          <>
            <ellipse rx="11" ry="3.5" fill="none" stroke={color} strokeWidth="2" transform="rotate(-18)" />
            <circle r="6" fill={color} />
          </>
        )
      }
      if (object.name === 'Jupiter') {
        return (
          <>
            <circle r="8" fill={color} />
            <path d="M-7.5 -2.5 H7.5 M-7.5 2.5 H7.5" stroke="var(--panel)" strokeWidth="1.5" />
          </>
        )
      }
      return <circle r={object.gear === 3 ? 4 : 7} fill={color} />
    case 'star':
      return <path d="M0 -9 Q1.5 -1.5 9 0 Q1.5 1.5 0 9 Q-1.5 1.5 -9 0 Q-1.5 -1.5 0 -9 Z" fill="var(--frost)" />
    case 'shape':
      return (
        <>
          <path d="M-9 -5 L-3 4 L2 -3 L9 5" fill="none" stroke="var(--snow)" strokeWidth="1.5" />
          <Dots points={[[-9, -5], [-3, 4], [2, -3], [9, 5]]} />
        </>
      )
    case 'cluster':
      return <Dots points={[[-4, -3], [3, -5], [5, 2], [-2, 5], [-7, 3]]} r={1.9} />
    case 'galaxy':
      return (
        <>
          <ellipse rx="10" ry="4" fill="var(--snow)" opacity="0.55" transform="rotate(-25)" />
          <ellipse rx="4" ry="2" fill="var(--frost)" transform="rotate(-25)" />
        </>
      )
    case 'nebula':
      return (
        <>
          <circle r="8" fill="var(--snow)" opacity="0.35" />
          <circle cx="2" cy="-1" r="4.5" fill="var(--snow)" opacity="0.6" />
        </>
      )
    case 'planetary':
      return <circle r="6.5" fill="none" stroke="var(--teal)" strokeWidth="3" />
    case 'globular':
      return (
        <>
          <circle r="7.5" fill="var(--snow)" opacity="0.35" />
          <circle r="3.5" fill="var(--frost)" />
        </>
      )
    case 'double':
      return (
        <>
          <circle cx="-4" r="3.5" fill="var(--bronze)" />
          <circle cx="5" r="2.5" fill="var(--neptune)" />
        </>
      )
    case 'shower':
      return (
        <>
          <path d="M-9 -9 L6 6" stroke="var(--bronze)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="7" cy="7" r="2.5" fill="var(--frost)" />
        </>
      )
    default:
      return <circle r="5" fill={color} />
  }
}

export function ObjectIcon({ object, moonAngle }) {
  return (
    <svg className="object-icon" viewBox="-13 -13 26 26" aria-hidden="true">
      {shape(object, moonAngle)}
    </svg>
  )
}



// GEAR

const GEAR_NAMES = ['your eyes', 'binoculars', 'a telescope']

function Eye() {
  return (
    <svg viewBox="0 0 18 18">
      <path d="M1.5 9 Q9 2 16.5 9 Q9 16 1.5 9 Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="9" r="2.6" fill="currentColor" />
    </svg>
  )
}

function Binoculars() {
  return (
    <svg viewBox="0 0 18 18">
      <circle cx="5" cy="11.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="13" cy="11.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 8 V3.5 H6.5 V8 M11.5 8 V3.5 H14.5 V8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function Telescope() {
  return (
    <svg viewBox="0 0 18 18">
      <path d="M2 10 L13 4.5 L14.6 7.6 L3.6 13 Z" fill="currentColor" />
      <path d="M9 10.5 L6 16.5 M9 10.5 L12 16.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function GearIcons({ level }) {
  const label = `Visible with ${GEAR_NAMES[level - 1]}`

  return (
    <span className="gear" title={label}>
      <span className="visually-hidden">{label}</span>
      {[Eye, Binoculars, Telescope].map((Icon, i) => (
        <span key={i} className={i + 1 >= level ? 'on' : 'off'} aria-hidden="true">
          <Icon />
        </span>
      ))}
    </span>
  )
}
