import './Clouds.css'



// SHAPES

const CLOUD = 'M18 62 Q2 62 4 48 Q6 36 22 38 Q24 18 48 18 Q62 2 86 10 Q104 -2 124 14 Q148 8 158 28 Q184 26 190 44 Q198 62 176 62 Z'

const LAYOUTS = {
  1: [{ x: 58, y: 18, width: 22, shade: 0, speed: 50 }],
  2: [
    { x: -4, y: 10, width: 30, shade: 0, speed: 38 },
    { x: 54, y: 30, width: 26, shade: 1, speed: 46 },
    { x: 28, y: 50, width: 22, shade: 2, speed: 52 },
  ],
  3: [
    { x: -12, y: -6, width: 46, shade: 0, speed: 60 },
    { x: 34, y: 6, width: 50, shade: 1, speed: 70 },
    { x: -6, y: 28, width: 44, shade: 2, speed: 64 },
    { x: 46, y: 40, width: 42, shade: 3, speed: 58 },
  ],
}

const NIGHT_SHADES = ['#2c2a5e', '#332f68', '#2a2759', '#3a3966']
const DAY_SHADES = ['#8a9bd3', '#93a3d8', '#8597cf', '#9aa9dc']



// CLOUDS

function Clouds({ level, day }) {
  if (!level) return null

  const shades = day ? DAY_SHADES : NIGHT_SHADES

  return (
    <div className="clouds" aria-hidden="true">
      {LAYOUTS[level].map((cloud, i) => (
        <svg
          key={i}
          viewBox="0 0 200 70"
          style={{ left: `${cloud.x}%`, top: `${cloud.y}%`, width: `${cloud.width}%`, animationDuration: `${cloud.speed}s` }}
        >
          <path d={CLOUD} fill={shades[cloud.shade]} opacity={day ? 0.55 : 1} />
        </svg>
      ))}
    </div>
  )
}

export default Clouds
