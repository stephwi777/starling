// TALL GROUND

function TallGround({ snow }) {
  return (
    <svg className="ground" viewBox="0 0 1440 280" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 120 C 160 70, 300 90, 430 110 S 700 60, 860 96 S 1180 70, 1440 104 L 1440 280 L 0 280 Z" fill="var(--far-hills)" />
      <path d="M0 178 C 220 140, 420 150, 640 172 S 1040 140, 1440 160 L 1440 280 L 0 280 Z" fill="var(--snow-shade)" />
      <path d="M0 214 C 260 190, 560 196, 820 210 S 1240 196, 1440 204 L 1440 280 L 0 280 Z" fill={snow} />
      <g fill="var(--horizon)">
        <path d="M1060 150 l14 -40 l14 40 Z M1066 132 l8 -24 l8 24 Z" />
        <path d="M1092 158 l18 -54 l18 54 Z M1099 132 l11 -32 l11 32 Z" />
        <path d="M1130 156 l12 -34 l12 34 Z" />
        <path d="M210 168 l15 -44 l15 44 Z M216 146 l9 -28 l9 28 Z" />
        <rect x="1108" y="158" width="4" height="8" />
        <rect x="223" y="168" width="4" height="7" />
      </g>
      <path d="M1104 106 q4 -6 10 -4 l5 -2 l-4 4 q-2 5 -8 5 q-3 0 -3 -3 Z" fill="var(--ink)" />
    </svg>
  )
}



// BAND GROUND

function BandGround({ snow }) {
  return (
    <svg className="ground" viewBox="0 0 1440 130" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 52 C 200 20, 420 40, 640 46 S 1100 22, 1440 44 L 1440 130 L 0 130 Z" fill="var(--far-hills)" />
      <path d="M0 92 C 300 70, 700 80, 1000 88 S 1300 76, 1440 82 L 1440 130 L 0 130 Z" fill={snow} />
      <g fill="var(--horizon)">
        <path d="M1180 76 l11 -34 l11 34 Z M1184 62 l7 -20 l7 20 Z" />
        <path d="M1204 80 l14 -44 l14 44 Z" />
        <path d="M150 82 l12 -36 l12 36 Z" />
      </g>
    </svg>
  )
}



// GROUND

function Ground({ size, snow }) {
  return size === 'tall' ? <TallGround snow={snow} /> : <BandGround snow={snow} />
}

export default Ground
