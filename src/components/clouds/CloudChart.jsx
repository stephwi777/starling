import { useRef } from 'react'
import { barLayers } from '../../sky/cloudPanel.js'
import { clock } from '../../sky/words.js'



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

function Cloud({ x, top, size }) {
  const k = size / 22

  return (
    <g transform={`translate(${x} ${top - 2 - 7 * k}) scale(${k})`} fill="var(--frost)">
      <circle cx="-5.5" cy="2.5" r="4.5" />
      <circle cx="0.5" cy="-1" r="6.5" />
      <circle cx="5.5" cy="2.5" r="4.5" />
      <rect x="-5.5" y="2.5" width="11" height="4.5" />
    </g>
  )
}



// BAR

function Bar({ hour, x, width, cell }) {
  let top = BASE

  const parts = barLayers(hour).map(({ layer, size }) => {
    const height = size * SCALE

    top -= height

    return <rect key={layer} x={x} y={top} width={width} height={height} {...FILLS[layer]} />
  })

  return (
    <g>
      {parts}
      {(hour.cover ?? 0) < 5 && <rect x={x} y={BASE - 3} width={width} height="3" rx="1.5" fill="var(--raised)" opacity={hour.cover === null ? 0.5 : 1} />}
      {hour.cover >= 60 && <Cloud x={x + width / 2} top={top} size={cell * 0.9} />}
    </g>
  )
}



// HOUR PICKING

const KEYS = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }

function useHourPicking(count, onChoose, onStep, onNight) {
  const dragging = useRef(false)

  function pick(event) {
    const box = event.currentTarget.getBoundingClientRect()
    const index = Math.floor(((event.clientX - box.left) / box.width) * count)

    onChoose(Math.max(0, Math.min(count - 1, index)))
  }

  return {
    onPointerDown(event) {
      dragging.current = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      pick(event)
    },
    onPointerMove(event) {
      if (dragging.current) pick(event)
    },
    onPointerUp() {
      dragging.current = false
    },
    onPointerCancel() {
      dragging.current = false
    },
    onKeyDown(event) {
      const moves = {
        ...KEYS,
        Home: () => onChoose(0),
        End: () => onChoose(count - 1),
        PageUp: () => onNight(-1),
        PageDown: () => onNight(1),
      }
      const move = moves[event.key]

      if (move === undefined) return

      event.preventDefault()

      if (typeof move === 'number') onStep(move)
      else move()
    },
  }
}



// LABELS

function localHour(date, timeZone) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(date))
}



// CLOUD CHART

function CloudChart({ hours, chosen, valueText, timeZone, onChoose, onStep, onNight }) {
  const picking = useHourPicking(hours.length, onChoose, onStep, onNight)
  const cell = WIDTH / hours.length
  const width = cell * 0.62
  const middle = i => ((i + 0.5) / hours.length) * 100

  return (
    <div className="clouds-chart">
      <div
        className="clouds-bars"
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

      <div className="clouds-hours" aria-hidden="true">
        {hours.map((hour, i) => localHour(hour.time, timeZone) % 3 === 0 && (
          <span key={i} style={{ left: `${middle(i)}%` }}>{clock(hour.time, timeZone)}</span>
        ))}
      </div>

      <div className="clouds-key" aria-hidden="true">
        <span><i className="low" />Low</span>
        <span><i className="mid" />Middle</span>
        <span><i className="high" />High</span>
      </div>
    </div>
  )
}

export default CloudChart
