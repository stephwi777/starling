import { MoonShape } from '../tonight/Icons.jsx'
import { SHAPES, shapePath } from './constellationShapes.js'



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

export function ConstellationIcon({ name = 'Cassiopeia' }) {
  const shape = SHAPES[name]
  const busy = shape.stars.length > 6

  return (
    <Icon>
      <path d={shapePath(shape)} fill="none" stroke="var(--snow)" strokeWidth={busy ? 1.3 : 1.6} strokeLinejoin="round" />
      {shape.stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={busy ? 1.9 : 2.4} fill={i === shape.bright ? 'var(--beak)' : 'var(--frost)'} />
      ))}
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
      <rect x="-10" y="-8" width="20" height="18" rx="4" fill="var(--snow)" />
      <rect x="-10" y="-8" width="20" height="6" rx="3" fill="var(--teal)" />
    </Icon>
  )
}

export function SparkleIcon() {
  return <Icon><path d="M0 -11 Q1.8 -1.8 11 0 Q1.8 1.8 0 11 Q-1.8 1.8 -11 0 Q-1.8 -1.8 0 -11 Z" fill="var(--beak)" /></Icon>
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

export function SunsetIcon() {
  return (
    <Icon>
      <path d="M-11 6 H11" stroke="var(--mist)" strokeWidth="2" strokeLinecap="round" />
      <path d="M-7 6 A7 7 0 0 1 7 6 Z" fill="var(--bronze)" />
    </Icon>
  )
}

export function TwilightIcon() {
  return (
    <Icon>
      <circle r="8" fill="var(--snow-shade)" opacity="0.5" />
      <path d="M-2 -8 A8 8 0 1 0 8 3 A6.5 6.5 0 1 1 -2 -8 Z" fill="var(--snow)" />
    </Icon>
  )
}

export function ClearIcon() {
  return (
    <Icon>
      <circle cx="-5" cy="-4" r="1.8" fill="var(--frost)" />
      <circle cx="4" cy="-7" r="1.3" fill="var(--frost)" />
      <circle cx="6" cy="4" r="2" fill="var(--frost)" />
      <circle cx="-4" cy="6" r="1.2" fill="var(--frost)" />
    </Icon>
  )
}

export function MoonsetIcon() {
  return (
    <Icon>
      <path d="M-11 6 H11" stroke="var(--mist)" strokeWidth="2" strokeLinecap="round" />
      <path d="M-6 6 A6 6 0 0 1 6 6 Z" fill="var(--moon)" />
      <path d="M0 -10 V-2 M-3 -5 L0 -2 L3 -5" stroke="var(--mist)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </Icon>
  )
}

export function CloudIcon() {
  return <Icon><path d="M-9 6 Q-12 0 -6 -1 Q-5 -8 2 -7 Q8 -7 8 -1 Q12 0 10 6 Z" fill="var(--mist)" /></Icon>
}

export function DawnIcon() {
  return (
    <Icon>
      <path d="M-11 6 H11" stroke="var(--mist)" strokeWidth="2" strokeLinecap="round" />
      <path d="M-7 6 A7 7 0 0 1 7 6 Z" fill="var(--snow)" opacity="0.7" />
    </Icon>
  )
}



// PHASE MOON

export function PhaseMoon({ angle, size, south }) {
  return (
    <svg className="phase-moon" viewBox="-60 -60 120 120" width={size} height={size} aria-hidden="true">
      <circle r="70" fill="var(--moon)" opacity="0.08" />
      <g transform={south ? 'scale(-1 1)' : undefined}>
        <MoonShape angle={angle} r={56} />
      </g>
    </svg>
  )
}
