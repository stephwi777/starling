import { useId } from 'react'
import { STEP_COUNT } from '../../sky/darkPanel.js'
import { clock } from '../../sky/words.js'
import useChartPicking from '../panel/useChartPicking.js'
import SunStrokes from './SunStrokes.jsx'



// SIZES

const WIDTH = 320
const HEIGHT = 176
const LANE = 22
const LAST = STEP_COUNT - 1
const GUIDES = [36, 72, 108]
const LABELS = [0, 36, 72, 108, LAST]

const BANDS = [
  ['day', Infinity, 0],
  ['civil', 0, -6],
  ['nautical', -6, -12],
  ['astronomical', -12, -18],
  ['dark', -18, -Infinity],
]



// MOON LANE

function moonRuns(moon) {
  const runs = []

  moon.forEach((alt, i) => {
    if (alt <= 0) return

    const last = runs.at(-1)

    if (last && last.to === i - 1) last.to = i
    else runs.push({ from: i, to: i })
  })

  return runs
}

function MoonLane({ moon, lit, chosen, x }) {
  const runs = moonRuns(moon)
  const longest = runs.reduce((best, run) => (!best || run.to - run.from > best.to - best.from ? run : best), null)

  return (
    <svg viewBox={`0 0 ${WIDTH} ${LANE}`} width="100%" className="dark-lane" aria-hidden="true">
      <rect width={WIDTH} height={LANE} rx={LANE / 2} fill="var(--raised)" />
      {runs.map(run => (
        <rect key={run.from} x={x(run.from)} y="3" width={Math.max(x(run.to) - x(run.from), 6)} height={LANE - 6} rx="8" fill="var(--moon)" opacity="0.85" />
      ))}
      {longest && x(longest.to) - x(longest.from) > 90 && (
        <text x={(x(longest.from) + x(longest.to)) / 2} y="15" textAnchor="middle">Moon up · {lit}% lit</text>
      )}
      <line x1={x(chosen)} y1="0" x2={x(chosen)} y2={LANE} stroke="var(--beak)" strokeWidth="2" />
    </svg>
  )
}



// DARK CHART

function DarkChart({ path, range, lit, chosen, valueText, timeZone, onChoose, onStep, onNight }) {
  const clip = useId()
  const picking = useChartPicking(STEP_COUNT, { onChoose, onStep, onNight, bigStep: 6 })
  const x = i => (i / LAST) * WIDTH
  const y = alt => 8 + ((range.top - alt) / (range.top - range.bottom)) * (HEIGHT - 16)
  const edge = alt => Math.min(HEIGHT, Math.max(0, y(alt)))
  const showLine = alt => alt < range.top && alt > range.bottom

  return (
    <div className="dark-chart">
      <div
        className="dark-picker"
        role="slider"
        tabIndex={0}
        aria-label="Time"
        aria-valuemin={0}
        aria-valuemax={LAST}
        aria-valuenow={chosen}
        aria-valuetext={valueText}
        {...picking}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" aria-hidden="true">
          <defs>
            <clipPath id={clip}><rect width={WIDTH} height={HEIGHT} rx="16" /></clipPath>
          </defs>

          <g clipPath={`url(#${clip})`}>
            {BANDS.map(([name, top, bottom]) => (
              <rect key={name} className={`dark-band ${name}`} x="0" y={edge(top)} width={WIDTH} height={Math.max(0, edge(bottom) - edge(top))} />
            ))}

            {GUIDES.map(i => <line key={i} x1={x(i)} y1="0" x2={x(i)} y2={HEIGHT} stroke="var(--mist)" strokeOpacity="0.18" strokeDasharray="2 4" />)}

            {showLine(0) && (
              <>
                <line x1="0" y1={y(0)} x2={WIDTH} y2={y(0)} stroke="var(--mist)" strokeOpacity="0.7" strokeWidth="1.5" />
                <text x="8" y={y(0) - 5} fill="var(--mist)">Horizon</text>
              </>
            )}

            {showLine(-18) && (
              <>
                <line x1="0" y1={y(-18)} x2={WIDTH} y2={y(-18)} stroke="var(--teal)" strokeOpacity="0.55" strokeDasharray="3 4" />
                <text x="8" y={y(-18) + 12} fill="var(--teal)">Fully dark below</text>
              </>
            )}

            <SunStrokes path={path} x={x} y={y} width={3.5} />

            <line x1={x(chosen)} y1="0" x2={x(chosen)} y2={HEIGHT} stroke="var(--beak)" strokeOpacity="0.5" strokeWidth="1.5" />
            <circle cx={x(chosen)} cy={y(path.sun[chosen])} r="7" fill="var(--frost)" stroke="var(--zenith)" strokeWidth="2.5" />
          </g>
        </svg>

        <MoonLane moon={path.moon} lit={lit} chosen={chosen} x={x} />
      </div>

      <div className="dark-hours" aria-hidden="true">
        {LABELS.map(i => <span key={i} style={{ left: `${(i / LAST) * 100}%` }}>{clock(path.times[i], timeZone)}</span>)}
      </div>

      <div className="dark-key" aria-hidden="true">
        <span><i className="dark" />Moonless</span>
        <span><i className="moonlit" />Moon up</span>
        <span><i className="twilight" />Twilight</span>
        <span><i className="day" />Day</span>
      </div>
    </div>
  )
}

export default DarkChart
