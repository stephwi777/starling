import { barLayers } from '../../sky/cloudPanel.js'
import useChartPicking from '../panel/useChartPicking.js'
import HourLabels from '../panel/HourLabels.jsx'
import { Fall } from '../ui/icons.jsx'



// SIZES

const WIDTH = 320
const HEIGHT = 104
const BASE = HEIGHT - 6
const SCALE = (HEIGHT - 32) / 100

const FILLS = {
  low: { fill: 'var(--frost)', opacity: 1 },
  mid: { fill: 'var(--snow-shade)', opacity: 1 },
  high: { fill: 'var(--snow)', opacity: 0.45 },
}



// CLOUD

function Cloud({ x, top, size, lift = 0 }) {
  const k = size / 22

  return (
    <g transform={`translate(${x} ${top - 2 - 7 * k - lift}) scale(${k})`} fill="var(--frost)">
      <circle cx="-5.5" cy="2.5" r="4.5" />
      <circle cx="0.5" cy="-1" r="6.5" />
      <circle cx="5.5" cy="2.5" r="4.5" />
      <rect x="-5.5" y="2.5" width="11" height="4.5" />
    </g>
  )
}



// BAR

function stack(hour) {
  return barLayers(hour).reduce((pieces, { layer, size }) => {
    const height = size * SCALE
    const below = pieces.at(-1)?.y ?? BASE

    return [...pieces, { layer, height, y: below - height }]
  }, [])
}

function Bar({ hour, x, width, cell }) {
  const pieces = stack(hour)
  const top = pieces.at(-1)?.y ?? BASE
  const parts = pieces.map(({ layer, height, y }) => <rect key={layer} x={x} y={y} width={width} height={height} {...FILLS[layer]} />)

  return (
    <g>
      {parts}
      {(hour.cover ?? 0) < 5 && <rect x={x} y={BASE - 3} width={width} height="3" rx="1.5" fill="var(--raised)" opacity={hour.cover === null ? 0.5 : 1} />}
      {(hour.cover >= 60 || hour.fall) && <Cloud x={x + width / 2} top={top} size={cell * 0.9} lift={hour.fall ? 7 : 0} />}
      {hour.fall && (
        <>
          <Fall kind={hour.fall} x={x + width / 2 - 3.2} y={top - 4.5} scale={0.62} />
          <Fall kind={hour.fall} x={x + width / 2 + 3.2} y={top - 4.5} scale={0.62} />
        </>
      )}
    </g>
  )
}



// CLOUD CHART

function CloudChart({ hours, chosen, valueText, timeZone, onChoose, onStep, onNight }) {
  const picking = useChartPicking(hours.length, { onChoose, onStep, onNight })
  const cell = WIDTH / hours.length
  const width = cell * 0.62

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
          {hours.map((hour, i) => <Bar key={hour.time.getTime()} hour={hour} x={i * cell + (cell - width) / 2} width={width} cell={cell} />)}
        </svg>
      </div>

      <HourLabels hours={hours} timeZone={timeZone} />

      <div className="clouds-key" aria-hidden="true">
        <span><i className="low" />Low</span>
        <span><i className="mid" />Middle</span>
        <span><i className="high" />High</span>
      </div>
    </div>
  )
}

export default CloudChart
