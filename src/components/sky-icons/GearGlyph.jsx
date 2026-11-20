// SHAPES

function Eye() {
  return (
    <>
      <path d="M-10 0 Q0 -10 10 0 Q0 10 -10 0 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle r="3.2" fill="currentColor" />
    </>
  )
}

function Binoculars() {
  return <path d="M-8.6 -7.4 Q-8.6 -10 -6.2 -10 Q-3.8 -10 -3.8 -7.4 L-1.36 1.2 L-10.64 1.2 Z M3.8 -7.4 Q3.8 -10 6.2 -10 Q8.6 -10 8.6 -7.4 L10.64 1.2 L1.36 1.2 Z M-3.4 -3.6 Q0 -5.4 3.4 -3.6 L2.2 3 L1.6 6.2 L-1.6 6.2 L-2.2 3 Z M-12 5 A6 6 0 1 1 0 5 A6 6 0 1 1 -12 5 Z M-9.6 5 A3.6 3.6 0 1 0 -2.4 5 A3.6 3.6 0 1 0 -9.6 5 Z M0 5 A6 6 0 1 1 12 5 A6 6 0 1 1 0 5 Z M2.4 5 A3.6 3.6 0 1 0 9.6 5 A3.6 3.6 0 1 0 2.4 5 Z" fill="currentColor" />
}

function Telescope() {
  return (
    <>
      <path d="M-10 2 L6 -7 L8.4 -2.4 L-7.6 6.6 Z" fill="currentColor" />
      <path d="M-1 3 L-4.6 11 M-1 3 L2.6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  )
}

const SHAPES = { 1: Eye, 2: Binoculars, 3: Telescope }



// GEAR GLYPH

function GearGlyph({ gear }) {
  const Shape = SHAPES[gear] ?? Eye

  return (
    <svg className="gear-glyph" viewBox="-12 -12 24 24" aria-hidden="true">
      <Shape />
    </svg>
  )
}

export default GearGlyph
