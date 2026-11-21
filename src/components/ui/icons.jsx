import { MoonShape } from '../tonight/Icons.jsx'



// SHAPES

const TWINKLE = 'M0 -11 Q1.8 -1.8 11 0 Q1.8 1.8 0 11 Q-1.8 1.8 -11 0 Q-1.8 -1.8 0 -11 Z'
const DROP = 'M0 -4.2 Q3.2 0 3.2 1.6 A3.2 3.2 0 0 1 -3.2 1.6 Q-3.2 0 0 -4.2 Z'
const FLAKE = 'M0 -3.6 V3.6 M-3.1 -1.8 L3.1 1.8 M-3.1 1.8 L3.1 -1.8'



// FRAME

function Icon({ children }) {
  return <svg viewBox="-13 -13 26 26" aria-hidden="true">{children}</svg>
}



// ICONS

export function MoonIcon() {
  return <Icon><path d="M0 -10 A10 10 0 1 0 8 6 A8 8 0 1 1 0 -10 Z" fill="var(--moon)" /></Icon>
}

export function FullMoonIcon() {
  return <Icon><circle r="10" fill="var(--moon)" /></Icon>
}

export function NewMoonIcon() {
  return <Icon><circle r="10" fill="var(--moon-dark)" /><circle r="10" fill="none" stroke="var(--moon)" strokeWidth="1.5" opacity="0.6" /></Icon>
}

export function HalfMoonIcon({ side = 'right' }) {
  return <Icon><circle r="10" fill="var(--moon-dark)" /><path d={`M0 -10 A10 10 0 0 ${side === 'right' ? 1 : 0} 0 10 Z`} fill="var(--moon)" /></Icon>
}

export function MeteorIcon() {
  return (
    <Icon>
      <path d="M-10 -10 L5 5" stroke="var(--bronze)" strokeWidth="3" strokeLinecap="round" />
      <path d="M-3 -11 L6 -2" stroke="var(--snow)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="7" r="3" fill="var(--frost)" />
    </Icon>
  )
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

export function SaturnIcon() {
  return (
    <Icon>
      <ellipse rx="11" ry="3.5" fill="none" stroke="var(--bronze)" strokeWidth="2" transform="rotate(-18)" />
      <circle r="6" fill="var(--bronze)" />
    </Icon>
  )
}

export function ClusterIcon() {
  return (
    <Icon>
      <circle cx="-4" cy="-3" r="2.3" fill="var(--frost)" />
      <circle cx="3" cy="-5" r="1.9" fill="var(--frost)" />
      <circle cx="5" cy="2" r="2.3" fill="var(--frost)" />
      <circle cx="-2" cy="5" r="1.9" fill="var(--frost)" />
      <circle cx="-7" cy="3" r="1.5" fill="var(--frost)" />
    </Icon>
  )
}

export function GalaxyIcon() {
  return (
    <Icon>
      <ellipse rx="11" ry="4.5" fill="var(--snow)" opacity="0.55" transform="rotate(-25)" />
      <ellipse rx="4" ry="2" fill="var(--frost)" transform="rotate(-25)" />
    </Icon>
  )
}



// HOUR ICONS

const DOWN = 'M0 -11 V-3 M-2.6 -5.6 L0 -3 L2.6 -5.6'
const UP = 'M0 -3 V-11 M-2.6 -8.4 L0 -11 L2.6 -8.4'
const TUCKED_DOWN = 'M4 -8.2 V-0.2 M1.5 -2.7 L4 -0.2 L6.5 -2.7'
const TUCKED_UP = 'M4 -0.2 V-8.2 M1.5 -5.7 L4 -8.2 L6.5 -5.7'
const CRESCENT = 'M0 -10 A10 10 0 1 0 8 6 A8 8 0 1 1 0 -10 Z'
const RAYS = [-160, -125, -55, -20]

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
      <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
        {RAYS.map(angle => {
          const a = (angle * Math.PI) / 180

          return <path key={angle} d={`M${7 * Math.cos(a)} ${4 + 7 * Math.sin(a)} L${9.4 * Math.cos(a)} ${4 + 9.4 * Math.sin(a)}`} />
        })}
      </g>
      <path d="M-5 4 A5 5 0 0 1 5 4 Z" fill={color} />
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
