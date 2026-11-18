import './Clouds.css'



// SHAPES

const CLOUD = 'M18 62 Q2 62 4 48 Q6 36 22 38 Q24 18 48 18 Q62 2 86 10 Q104 -2 124 14 Q148 8 158 28 Q184 26 190 44 Q198 62 176 62 Z'

const LAYOUTS = {
  1: [{ x: 62, y: 22, width: 20, shade: 0, speed: 50 }],
  2: [
    { x: 56, y: 16, width: 24, shade: 0, speed: 38 },
    { x: 76, y: 34, width: 22, shade: 1, speed: 46 },
    { x: 60, y: 50, width: 18, shade: 2, speed: 52 },
  ],
  3: [
    { x: -12, y: 4, width: 46, shade: 0, speed: 60 },
    { x: 34, y: 12, width: 50, shade: 1, speed: 70 },
    { x: -6, y: 32, width: 44, shade: 2, speed: 64 },
    { x: 46, y: 42, width: 42, shade: 3, speed: 58 },
  ],
}

const NIGHT_SHADES = ['var(--cloud-1)', 'var(--cloud-2)', 'var(--cloud-3)', 'var(--cloud-4)']
const DAY_SHADES = ['var(--day-cloud-1)', 'var(--day-cloud-2)', 'var(--day-cloud-3)', 'var(--day-cloud-4)']



// CLOUDS

function Clouds({ level, day }) {
  if (!level) return null

  const shades = day ? DAY_SHADES : NIGHT_SHADES

  return (
    <div className={`clouds level-${level}`} aria-hidden="true">
      {LAYOUTS[level].map((cloud, i) => (
        <svg
          key={i}
          viewBox="0 0 200 70"
          style={{ left: `${cloud.x}%`, top: `${cloud.y}%`, width: `${cloud.width}%`, animationDuration: `${cloud.speed}s` }}
        >
          <path d={CLOUD} fill={shades[cloud.shade]} />
        </svg>
      ))}
    </div>
  )
}

export default Clouds
