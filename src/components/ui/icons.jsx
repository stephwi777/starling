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

export function ConstellationIcon() {
  return (
    <Icon>
      <path d="M-11 -4 L-5 6 L0 -2 L5 6 L11 -5" fill="none" stroke="var(--snow)" strokeWidth="1.6" />
      <circle cx="-11" cy="-4" r="2.4" fill="var(--frost)" />
      <circle cx="-5" cy="6" r="2.4" fill="var(--beak)" />
      <circle cx="0" cy="-2" r="2.4" fill="var(--frost)" />
      <circle cx="5" cy="6" r="2.4" fill="var(--frost)" />
      <circle cx="11" cy="-5" r="2.4" fill="var(--frost)" />
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

export function DarkSkyIcon() {
  return (
    <Icon>
      <circle r="10" fill="var(--zenith)" />
      <circle cx="-4" cy="-3" r="1.4" fill="var(--frost)" />
      <circle cx="4" cy="-5" r="1" fill="var(--frost)" />
      <circle cx="3" cy="4" r="1.6" fill="var(--star-warm)" />
      <circle cx="-3" cy="5" r="0.9" fill="var(--frost)" />
    </Icon>
  )
}

export function ThermometerIcon() {
  return (
    <Icon>
      <rect x="-3" y="-11" width="6" height="15" rx="3" fill="var(--snow)" />
      <circle cy="6" r="5" fill="var(--snow)" />
      <circle cy="6" r="3" fill="var(--bronze)" />
      <rect x="-1.2" y="-4" width="2.4" height="9" rx="1.2" fill="var(--bronze)" />
    </Icon>
  )
}
