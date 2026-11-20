import { hourScore } from '../../sky/seeing.js'
import useChartPicking from '../panel/useChartPicking.js'
import HourLabels from '../panel/HourLabels.jsx'



// SIZES

const WIDTH = 320
const HEIGHT = 92
const DOTS = 5
const GAP = (HEIGHT - 14) / DOTS



// COLUMN

function Column({ air, x, radius }) {
  const score = air ? hourScore(air) : 0

  return (
    <g opacity={air ? 1 : 0.5}>
      {Array.from({ length: DOTS }, (_, k) => (
        <circle key={k} cx={x} cy={HEIGHT - 12 - k * GAP - radius} r={radius} fill={k < score ? 'var(--teal)' : 'var(--raised)'} />
      ))}
    </g>
  )
}



// SEEING CHART

function SeeingChart({ hours, chosen, valueText, timeZone, onChoose, onStep, onNight }) {
  const picking = useChartPicking(hours.length, { onChoose, onStep, onNight })
  const cell = WIDTH / hours.length
  const radius = Math.min(cell * 0.28, 5.5)

  return (
    <div className="popover-chart">
      <div
        className="popover-picker"
        role="slider"
        tabIndex={0}
        aria-label="Hour"
        aria-valuemin={0}
        aria-valuemax={hours.length - 1}
        aria-valuenow={chosen}
        aria-valuetext={valueText}
        {...picking}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" aria-hidden="true">
          <rect x={chosen * cell + 2} y={HEIGHT - 3} width={cell - 4} height="3" rx="1.5" fill="var(--beak)" />
          {hours.map((hour, i) => <Column key={hour.time.getTime()} air={hour.air} x={i * cell + cell / 2} radius={radius} />)}
        </svg>
      </div>

      <HourLabels hours={hours} timeZone={timeZone} />
    </div>
  )
}

export default SeeingChart
