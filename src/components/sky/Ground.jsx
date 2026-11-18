// PINES

const PINES = {
  tall: [
    { left: 15, bottom: 30, height: 22 },
    { left: 73.4, bottom: 34, height: 20 },
    { left: 76, bottom: 31, height: 28 },
    { left: 78.7, bottom: 33, height: 17 },
  ],
  band: [
    { left: 10.5, bottom: 26, height: 32 },
    { left: 82, bottom: 30, height: 30 },
    { left: 84.4, bottom: 27, height: 40 },
  ],
}

function Pine({ left, bottom, height }) {
  return (
    <svg className="pine" viewBox="0 -2 60 88" style={{ left: `${left}%`, bottom: `${bottom}%`, height: `${height}%` }}>
      <path
        d="M30 0 L42 22 L36 22 L48 44 L40 44 L54 70 L34 70 L34 84 L26 84 L26 70 L6 70 L20 44 L12 44 L24 22 L18 22 Z"
        fill="var(--ink)"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}



// HILLS

function TallHills({ snow }) {
  return (
    <svg className="hills" viewBox="0 0 1440 280" preserveAspectRatio="none">
      <path d="M0 120 C 160 70, 300 90, 430 110 S 700 60, 860 96 S 1180 70, 1440 104 L 1440 280 L 0 280 Z" fill="var(--far-hills)" />
      <path d="M0 178 C 220 140, 420 150, 640 172 S 1040 140, 1440 160 L 1440 280 L 0 280 Z" fill="var(--snow-shade)" />
      <path d="M0 214 C 260 190, 560 196, 820 210 S 1240 196, 1440 204 L 1440 280 L 0 280 Z" fill={snow} />
    </svg>
  )
}

function BandHills({ snow }) {
  return (
    <svg className="hills" viewBox="0 0 1440 130" preserveAspectRatio="none">
      <path d="M0 52 C 200 20, 420 40, 640 46 S 1100 22, 1440 44 L 1440 130 L 0 130 Z" fill="var(--far-hills)" />
      <path d="M0 92 C 300 70, 700 80, 1000 88 S 1300 76, 1440 82 L 1440 130 L 0 130 Z" fill={snow} />
    </svg>
  )
}



// GROUND

function Ground({ size, snow }) {
  return (
    <div className="ground" aria-hidden="true">
      {size === 'tall' ? <TallHills snow={snow} /> : <BandHills snow={snow} />}
      {PINES[size].map(pine => <Pine key={pine.left} {...pine} />)}
    </div>
  )
}

export default Ground
