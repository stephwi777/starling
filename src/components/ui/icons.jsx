import { SHAPES, shapePath } from './constellationShapes.js'



// FRAME

function Icon({ children }) {
  return <svg viewBox="-13 -13 26 26">{children}</svg>
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

export function HalfMoonIcon() {
  return <Icon><circle r="10" fill="var(--moon-dark)" /><path d="M0 -10 A10 10 0 0 1 0 10 Z" fill="var(--moon)" /></Icon>
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
