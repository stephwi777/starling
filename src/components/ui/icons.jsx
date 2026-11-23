import { MoonShape } from '../tonight/Icons.jsx'
import { Clipped } from '../sky-icons/parts.jsx'



// SHAPES

const TWINKLE = 'M0 -11 Q1.8 -1.8 11 0 Q1.8 1.8 0 11 Q-1.8 1.8 -11 0 Q-1.8 -1.8 0 -11 Z'
const DROP = 'M0 -4.2 Q3.2 0 3.2 1.6 A3.2 3.2 0 0 1 -3.2 1.6 Q-3.2 0 0 -4.2 Z'
const CRESCENT = 'M0 -10 A10 10 0 1 0 8 6 A8 8 0 1 1 0 -10 Z'
const FLAKE = 'M0 -3.6 V3.6 M-3.1 -1.8 L3.1 1.8 M-3.1 1.8 L3.1 -1.8'



// FRAME

function Icon({ children }) {
  return <svg viewBox="-13 -13 26 26" aria-hidden="true">{children}</svg>
}



// SUN RAYS

function SunRays({ inner, outer }) {
  return (
    <g stroke="var(--beak)" strokeWidth="2" strokeLinecap="round">
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
        const a = (angle * Math.PI) / 180

        return <path key={angle} d={`M${inner * Math.cos(a)} ${inner * Math.sin(a)} L${outer * Math.cos(a)} ${outer * Math.sin(a)}`} />
      })}
    </g>
  )
}



// ICONS

export function MoonIcon() {
  return <Icon><path d="M0 -10 A10 10 0 1 0 8 6 A8 8 0 1 1 0 -10 Z" fill="var(--moon)" /></Icon>
}

export function FullMoonIcon() {
  return <Icon><circle r="10" fill="var(--moon)" /></Icon>
}

export function NewMoonIcon() {
  return <Icon><circle r="9.2" fill="var(--moon-shadow)" /><circle r="10" fill="none" stroke="var(--moon)" strokeWidth="1.6" opacity="0.6" /></Icon>
}

export function HalfMoonIcon({ side = 'right' }) {
  return <Icon><circle r="10" fill="var(--moon-shadow)" /><path d={`M0 -10 A10 10 0 0 ${side === 'right' ? 1 : 0} 0 10 Z`} fill="var(--moon)" /></Icon>
}

export function CalendarIcon() {
  return (
    <Icon>
      <rect x="-10" y="-8" width="20" height="18" rx="4" fill="var(--snow)" />
      <rect x="-10" y="-8" width="20" height="6" rx="3" fill="var(--bronze)" />
      <circle cx="-4" cy="3" r="1.6" fill="var(--ink)" />
      <circle cx="1" cy="3" r="1.6" fill="var(--ink)" />
      <circle cx="6" cy="3" r="1.6" fill="var(--ink)" />
    </Icon>
  )
}

export function PineIcon() {
  return (
    <Icon>
      <path d="M0 -11 L8 4 L-8 4 Z" fill="var(--teal)" />
      <path d="M0 -4 L9 10 L-9 10 Z" fill="var(--teal)" />
      <rect x="-1.5" y="10" width="3" height="3" fill="var(--bronze)" />
    </Icon>
  )
}

export function TelescopeIcon() {
  return (
    <Icon>
      <path d="M-11 2 L6 -7 L8.5 -2 L-8.5 7 Z" fill="var(--snow)" />
      <path d="M-1 3 L-5 12 M-1 3 L3 12" stroke="var(--bronze)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="-9" r="2" fill="var(--beak)" />
    </Icon>
  )
}

export function ClockIcon() {
  return (
    <Icon>
      <circle r="10" fill="var(--snow)" />
      <path d="M0 -6 V0 L4 3" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function NightsIcon() {
  return (
    <Icon>
      <rect x="-10" y="-8" width="20" height="19" rx="4" fill="var(--snow)" />
      <path d="M-10 -1.5 V-4 A4 4 0 0 1 -6 -8 H6 A4 4 0 0 1 10 -4 V-1.5 Z" fill="var(--teal)" />
      <path d="M-5 -11 V-5.5 M5 -11 V-5.5" stroke="var(--frost)" strokeWidth="2.6" strokeLinecap="round" />
      <path d={CRESCENT} fill="var(--ink)" transform="translate(1.1 4.4) scale(0.42)" />
    </Icon>
  )
}

export function SparkleIcon() {
  return <Icon><path d={TWINKLE} fill="var(--beak)" /></Icon>
}



// EARTH AND MOON

function smooth(points) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const f = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`
  const closed = [...points, points[0]]
  let d = `M${f(mid(points[0], points[1]))}`

  for (let i = 1; i < closed.length; i++) d += ` Q${f(closed[i])} ${f(mid(closed[i], closed[i + 1] ?? closed[1]))}`

  return `${d} Z`
}

const LAND = [
  smooth([[-11, -11], [-0.6, -11], [-0.4, -9.6], [-1, -7.6], [-2.3, -6.7], [-3.4, -5.9], [-3.6, -4.4], [-4.6, -4.6], [-6, -4.8], [-7, -4.3], [-7, -3], [-6.6, -1.6], [-5.8, -0.4], [-5, 0.2], [-6.6, 0.2], [-8.4, -0.4], [-9.7, -2.7], [-11, -2.6]]),
  smooth([[-4.6, 0.2], [-2.7, -1], [-0.4, -0.4], [1.9, 0.4], [3.3, 1.6], [3.7, 2.7], [2.4, 4.1], [0.7, 5.9], [-0.1, 7.3], [-0.2, 9.4], [0.4, 10.4], [-1.6, 9.6], [-2.4, 7.4], [-3.2, 5], [-4.2, 2.8], [-4.9, 1.2]]),
  smooth([[11, -5.2], [8.7, -4.8], [6.4, -3.9], [4.9, -2.6], [4.7, -1], [5.6, 0.4], [6.4, 2.4], [6.9, 4.7], [6.7, 7.3], [7.4, 9], [11, 9]]),
  smooth([[6.6, -11], [11, -11], [11, -6.2], [8.7, -5.6], [7, -5.8], [5.9, -6.6], [6.1, -8], [6.6, -9.4]]),
]

function Earth({ x, y, r }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r / 10})`}>
      <Clipped shape={<circle r="10" />}>
        <circle r="10" fill="var(--earth-sea)" />
        {LAND.map(d => <path key={d} d={d} fill="var(--earth-land)" />)}
      </Clipped>
    </g>
  )
}

function SmallMoon({ x, y, size }) {
  return <path d={CRESCENT} fill="var(--moon)" transform={`translate(${x} ${y}) scale(${size})`} />
}

function Tether({ to }) {
  return <path d={`M-1.6 1.6 L${to} ${-to}`} stroke="var(--mist)" strokeWidth="1" strokeDasharray="1.2 1.4" strokeLinecap="round" />
}

export function MoonCloseIcon() {
  return (
    <Icon>
      <Earth x={-6} y={6} r={5} />
      <Tether to={0.4} />
      <SmallMoon x={5} y={-5} size={0.62} />
    </Icon>
  )
}

export function MoonFarIcon() {
  return (
    <Icon>
      <Earth x={-6} y={6} r={5} />
      <Tether to={6.4} />
      <SmallMoon x={9.2} y={-9.2} size={0.3} />
    </Icon>
  )
}

export function MoonNodeIcon() {
  return (
    <Icon>
      <path d="M-11.5 5 L11.5 -5" stroke="var(--beak)" strokeWidth="1.6" strokeDasharray="2.2 2" strokeLinecap="round" />
      <SmallMoon x={0} y={0} size={0.6} />
    </Icon>
  )
}



// HOUR ICONS

const DOWN = 'M0 -11 V-3 M-2.6 -5.6 L0 -3 L2.6 -5.6'
const UP = 'M0 -3 V-11 M-2.6 -8.4 L0 -11 L2.6 -8.4'
const TUCKED_DOWN = 'M4 -8.2 V-0.2 M1.5 -2.7 L4 -0.2 L6.5 -2.7'
const TUCKED_UP = 'M4 -0.2 V-8.2 M1.5 -5.7 L4 -8.2 L6.5 -5.7'
const RAYS = [-180, -135, -45, 0]

function Horizon({ arrow, children }) {
  return (
    <Icon>
      <path d="M-11 6 H11" stroke="var(--mist)" strokeWidth="2" strokeLinecap="round" />
      {children}
      {arrow && <path d={arrow} stroke="var(--mist)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </Icon>
  )
}

function Cloud({ fill }) {
  return (
    <g fill={fill}>
      <circle cx="-5.5" cy="2.5" r="4.5" />
      <circle cx="0.5" cy="-1" r="6.5" />
      <circle cx="5.5" cy="2.5" r="4.5" />
      <rect x="-5.5" y="2.5" width="11" height="4.5" />
    </g>
  )
}

function Twinkles({ fill }) {
  return (
    <g fill={fill}>
      <path d={TWINKLE} transform="translate(-3 -2) scale(0.6)" />
      <path d={TWINKLE} transform="translate(7 -7) scale(0.32)" />
      <path d={TWINKLE} transform="translate(6 6) scale(0.38)" />
    </g>
  )
}

function Sun({ color }) {
  return (
    <>
      <g stroke={color} strokeWidth="2" strokeLinecap="round">
        {RAYS.map(angle => {
          const a = (angle * Math.PI) / 180

          return <path key={angle} d={`M${7 * Math.cos(a)} ${3.6 + 7 * Math.sin(a)} L${9.6 * Math.cos(a)} ${3.6 + 9.6 * Math.sin(a)}`} />
        })}
      </g>
      <path d="M-5 3.6 A5 5 0 0 1 5 3.6 Z" fill={color} />
    </>
  )
}

function Crescent() {
  return <path d={CRESCENT} fill="var(--moon)" transform="translate(-2 -2.2) scale(0.62)" />
}

export function SunsetIcon() {
  return <Horizon arrow={DOWN}><Sun color="var(--bronze)" /></Horizon>
}

export function SunriseIcon() {
  return <Horizon arrow={UP}><Sun color="var(--beak)" /></Horizon>
}

export function MoonsetIcon() {
  return <Horizon arrow={TUCKED_DOWN}><Crescent /></Horizon>
}

export function MoonriseIcon() {
  return <Horizon arrow={TUCKED_UP}><Crescent /></Horizon>
}

export function TwilightIcon() {
  return (
    <Icon>
      <path d="M-5.5 1.3 A5.5 5.5 0 0 0 5.5 1.3 Z" fill="var(--snow-shade)" opacity="0.85" />
      <path d="M-11 -1 H11" stroke="var(--mist)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-5 9 H5" stroke="var(--mist)" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    </Icon>
  )
}

export function ClearIcon() {
  return <Icon><Twinkles fill="var(--frost)" /></Icon>
}

export function DarkIcon() {
  return <Icon><Twinkles fill="var(--mist)" /></Icon>
}

export function PatchyIcon() {
  return (
    <Icon>
      <path d={TWINKLE} fill="var(--frost)" transform="translate(-6 -6) scale(0.42)" />
      <g transform="translate(2.5 2.5) scale(0.75)"><Cloud fill="var(--frost)" /></g>
    </Icon>
  )
}

export function CloudIcon() {
  return <Icon><Cloud fill="var(--frost)" /></Icon>
}

export function Fall({ kind, x, y, scale = 1 }) {
  const place = `translate(${x} ${y}) scale(${scale})`

  if (kind === 'snow') return <path d={FLAKE} transform={place} stroke="var(--frost)" strokeWidth="1.3" strokeLinecap="round" />

  return <path d={DROP} transform={place} fill="var(--star-blue)" />
}

function Falling({ kind }) {
  return (
    <Icon>
      <g transform="translate(0 -3)"><Cloud fill="var(--frost)" /></g>
      <Fall kind={kind} x={-4} y={9} scale={0.7} />
      <Fall kind={kind} x={4} y={9} scale={0.7} />
    </Icon>
  )
}

export function RainIcon() {
  return <Falling kind="rain" />
}

export function SnowIcon() {
  return <Falling kind="snow" />
}

export function SolarEclipseIcon() {
  return (
    <Icon>
      <SunRays inner={8} outer={11} />
      <circle r="6.4" fill="var(--beak)" />
      <circle r="5.3" fill="var(--zenith)" />
    </Icon>
  )
}

export function LunarEclipseIcon() {
  return (
    <Icon>
      <Clipped shape={<circle r="10" />}>
        <rect x="-10" y="-10" width="20" height="20" fill="var(--mars)" />
        <circle cx="4.5" cy="4.5" r="12" fill="var(--mars-dark)" opacity="0.7" />
        <circle cx="-5.5" cy="-6.5" r="6.5" fill="var(--star-orange)" opacity="0.55" />
        <ellipse cx="-2.6" cy="-2.4" rx="2.8" ry="2" fill="var(--mars-dark)" opacity="0.7" />
        <ellipse cx="3" cy="-4.6" rx="2" ry="1.5" fill="var(--mars-dark)" opacity="0.6" />
        <ellipse cx="2.4" cy="2.6" rx="3" ry="2.2" fill="var(--mars-dark)" opacity="0.65" />
        <circle cx="-4" cy="4.6" r="1.2" fill="var(--mars-dark)" opacity="0.55" />
      </Clipped>
    </Icon>
  )
}

export function TransitIcon() {
  return (
    <Icon>
      <SunRays inner={9.2} outer={11.8} />
      <circle r="7.2" fill="var(--beak)" />
      <circle cx="2.6" cy="-1.8" r="1.9" fill="var(--zenith)" />
    </Icon>
  )
}

export function SeasonIcon() {
  return (
    <Icon>
      <SunRays inner={7.5} outer={10.5} />
      <circle r="5" fill="var(--beak)" />
    </Icon>
  )
}

const COMET_HEAD = [-6, 6]

function cometTail(width, length, bend) {
  const [x, y] = COMET_HEAD
  const along = Math.SQRT1_2
  const f = value => value.toFixed(2)
  const tip = [x + along * length, y - along * length]
  const mid = [x + along * length * 0.5 + along * bend, y - along * length * 0.5 + along * bend]
  const side = along * width

  return `M${f(x + side)} ${f(y + side)} Q${f(mid[0] + side / 2)} ${f(mid[1] + side / 2)} ${f(tip[0])} ${f(tip[1])} Q${f(mid[0] - side / 2)} ${f(mid[1] - side / 2)} ${f(x - side)} ${f(y - side)} A${width} ${width} 0 0 1 ${f(x + side)} ${f(y + side)} Z`
}

export function CometIcon() {
  const [x, y] = COMET_HEAD

  return (
    <Icon>
      <path d={cometTail(4.4, 23, 4)} fill="var(--star-icy)" opacity="0.32" />
      <path d={cometTail(2.9, 19, 3)} fill="var(--star-icy)" opacity="0.6" />
      <path d={cometTail(1.3, 14, 2)} fill="var(--frost)" opacity="0.7" />
      <circle cx={x} cy={y} r="4.4" fill="var(--star-teal)" opacity="0.4" />
      <circle cx={x} cy={y} r="2.7" fill="var(--frost)" />
    </Icon>
  )
}

const MILKY_STARS = [
  [-9.6, -7.8, 0.7, 0.9],
  [-5.4, -10.6, 0.35, 0.6],
  [10.6, 2.6, 0.5, 0.8],
  [2.8, 10.2, 0.3, 0.55],
]

export function MilkyWayIcon() {
  return (
    <Icon>
      {MILKY_STARS.map(([x, y, r, opacity]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="var(--frost)" opacity={opacity} />)}
      <g transform="rotate(-18)">
        <ellipse rx="12.4" ry="5.2" fill="var(--neptune)" opacity="0.4" />
        <ellipse rx="9.6" ry="3.9" fill="var(--meteor-lilac)" opacity="0.75" />
        <path d="M-12 1.6 Q-5 5.4 5 3.4 M12 -1.6 Q5 -5.4 -5 -3.4" fill="none" stroke="var(--snow)" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
        <ellipse rx="6" ry="2.5" fill="var(--meteor-rose)" />
        <ellipse rx="2.8" ry="1.5" fill="var(--star-cream)" />
      </g>
    </Icon>
  )
}

export function ParadeIcon() {
  return (
    <Icon>
      <circle cx="-8" cy="3.4" r="2.6" fill="var(--mars)" />
      <circle cx="-1.5" cy="-0.6" r="3.2" fill="var(--meteor-gold)" />
      <circle cx="5" cy="-3.8" r="2.6" fill="var(--jupiter-zone)" />
      <circle cx="10" cy="-7.2" r="2" fill="var(--bronze)" />
    </Icon>
  )
}



// PHASE MOON

export function PhaseMoon({ angle, size, south }) {
  return (
    <svg className="phase-moon" viewBox="-60 -60 120 120" width={size} height={size} aria-hidden="true">
      <circle r="70" fill="var(--moon)" opacity="0.08" />
      <g transform={south ? 'scale(-1 1)' : undefined}>
        <MoonShape angle={angle} r={56} shadow="var(--moon-shadow)" />
      </g>
    </svg>
  )
}
