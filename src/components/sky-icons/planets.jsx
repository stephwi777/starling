import { MoonShape } from '../tonight/Icons.jsx'
import { Clipped, Dot } from './parts.jsx'



// PLANETS

function Mercury() {
  return (
    <>
      <Dot r={6.2} fill="var(--mist)" />
      <Dot x={-2} y={-1.4} r={1.2} fill="var(--snow-shade)" />
      <Dot x={2.2} y={1.8} r={1} fill="var(--snow-shade)" />
      <Dot x={1.2} y={-2.8} r={0.7} fill="var(--snow-shade)" />
      <Dot x={-1.4} y={3} r={0.6} fill="var(--snow-shade)" />
    </>
  )
}

function Venus() {
  return (
    <Clipped shape={<circle r="7.6" />}>
      <rect x="-8" y="-8" width="16" height="16" fill="var(--meteor-gold)" />
      <path d="M-8 -2.6 Q-3 -4.2 2 -2.8 Q5 -2 8 -3 V-1.4 Q4 -0.4 0 -1.2 Q-4 -2 -8 -0.8 Z M-8 3 Q-2 1.6 3 3 Q6 3.8 8 3.2 V4.8 Q3 5.6 -2 4.6 Q-6 4 -8 4.8 Z" fill="var(--star-cream)" opacity="0.8" />
    </Clipped>
  )
}

function Mars() {
  return (
    <Clipped shape={<circle r="7" />}>
      <rect x="-8" y="-8" width="16" height="16" fill="var(--mars)" />
      <path d="M-8 -2.4 Q-4.5 -4.6 -0.5 -2.6 Q3 -1 8 -3.2 V0.2 Q4 2 0 0.4 Q-4 -1.2 -8 1 Z" fill="var(--mars-dark)" />
      <path d="M-8 3.8 Q-3 2 1.5 3.8 Q5 5.2 8 3.6 V8 H-8 Z" fill="var(--mars-mid)" />
      <Dot x={4.2} y={-4.8} r={0.9} fill="var(--mars-mid)" />
      <Dot x={-3.2} y={2.4} r={0.75} fill="var(--mars-dark)" />
      <ellipse cy="-7.1" rx="3.4" ry="1.9" fill="var(--frost)" />
    </Clipped>
  )
}

function Jupiter() {
  return (
    <Clipped shape={<circle r="9.4" />}>
      <rect x="-10" y="-10" width="20" height="20" fill="var(--jupiter-zone)" />
      <path d="M-10 -10 H10 V-7 Q5 -6.4 0 -7.1 Q-5 -6.6 -10 -7.2 Z" fill="var(--jupiter-belt)" />
      <path d="M-10 -4.6 Q-5 -5.1 0 -4.5 Q5 -4 10 -4.7 V-2.6 Q5 -2.1 0 -2.8 Q-5 -2.3 -10 -2.8 Z" fill="var(--jupiter-belt)" />
      <path d="M-10 -0.9 Q-4 -1.4 2 -0.8 Q6 -0.5 10 -1.1 V1.4 Q4 1.9 -2 1.3 Q-6 1 -10 1.5 Z" fill="var(--jupiter-band)" />
      <path d="M-10 3.1 Q-4 2.6 1 3.2 Q6 3.7 10 3.1 V5.4 Q5 6 0 5.3 Q-5 4.8 -10 5.5 Z" fill="var(--jupiter-belt)" />
      <path d="M-10 7.6 Q0 7 10 7.6 V10 H-10 Z" fill="var(--jupiter-belt)" />
      <ellipse cx="3.6" cy="4.2" rx="2.5" ry="1.55" fill="var(--jupiter-band)" />
      <ellipse cx="3.6" cy="4.2" rx="1.55" ry="0.9" fill="var(--jupiter-spot)" />
    </Clipped>
  )
}

function Saturn() {
  return (
    <g transform="rotate(-18)">
      <path d="M-12.2 0 A12.2 3.8 0 0 1 12.2 0" stroke="var(--bronze)" strokeWidth="2" fill="none" />
      <Dot r={6.6} fill="var(--meteor-gold)" />
      <path d="M-6.4 -1.4 H6.4" stroke="var(--bronze)" strokeWidth="1.1" />
      <path d="M-12.2 0 A12.2 3.8 0 0 0 12.2 0" stroke="var(--bronze)" strokeWidth="2" fill="none" />
    </g>
  )
}

function Uranus() {
  return (
    <>
      <Dot r={6.4} fill="var(--uranus)" />
      <ellipse rx="2.2" ry="10.2" fill="none" stroke="var(--uranus)" strokeWidth="1" opacity="0.7" transform="rotate(-8)" />
    </>
  )
}

function Neptune() {
  return (
    <Clipped shape={<circle r="7" />}>
      <rect x="-8" y="-8" width="16" height="16" fill="var(--neptune)" />
      <path d="M-8 -5.2 H0.6 Q2.2 -5.2 2.2 -4 Q2.2 -3 3.8 -3 H8 V-1 H-1.4 Q-3 -1 -3 0.2 Q-3 1.2 -4.6 1.2 H-8 Z" fill="var(--neptune-dark)" />
      <path d="M-8 3.4 H1.8 Q3.4 3.4 3.4 4.6 Q3.4 5.6 5 5.6 H8 V8 H-8 Z" fill="var(--neptune-dark)" />
      <Dot x={4.6} y={-4.9} r={1} fill="var(--neptune-light)" />
      <Dot x={-4.6} y={-2.6} r={0.75} fill="var(--neptune-light)" />
    </Clipped>
  )
}

function Pluto() {
  return (
    <>
      <Dot r={5.2} fill="var(--pluto)" />
      <path d="M1.4 4 Q-1.6 1.6 -1.4 -0.4 Q-1.2 -1.8 0.2 -1.6 Q1 -1.5 1.4 -0.7 Q1.8 -1.6 2.8 -1.4 Q4 -1 3.6 0.6 Q3 2.4 1.4 4 Z" fill="var(--moon)" opacity="0.75" />
    </>
  )
}

const PLANETS = { Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto }



// PLANET ICON

export function PlanetIcon({ name }) {
  const Planet = PLANETS[name] ?? Mercury

  return <Planet />
}

export function MoonIcon({ angle }) {
  return <MoonShape angle={angle} r={10} shadow="var(--moon-shadow)" />
}
