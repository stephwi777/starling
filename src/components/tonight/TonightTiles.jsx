import { PhaseMoon } from '../ui/icons.jsx'



// CLOUD BARS

const COVER = [0, 0, 5, 5, 0, 10, 20, 50, 70, 55, 30, 10]

function CloudBars() {
  return (
    <svg viewBox="0 0 160 40" width="100%" height="40" aria-hidden="true">
      {COVER.map((value, i) => {
        const height = 6 + value * 0.3

        return <rect key={i} x={i * 13.5} y={40 - height} width="10" height={height} rx="4" fill={value >= 40 ? 'var(--mist)' : 'var(--raised)'} />
      })}
    </svg>
  )
}



// DARKNESS ARC

function DarknessArc() {
  return (
    <svg viewBox="0 0 160 56" width="100%" height="56" aria-hidden="true">
      <path d="M4 14 Q 80 92 156 14" fill="none" stroke="var(--raised)" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 39 Q 80 70 126 39" fill="none" stroke="var(--teal)" strokeWidth="4" strokeLinecap="round" />
      <line x1="0" y1="14" x2="160" y2="14" stroke="var(--mist)" strokeWidth="1.5" strokeDasharray="3 5" />
      <circle cx="62" cy="52" r="5" fill="var(--frost)" />
    </svg>
  )
}



// SEEING DOTS

function SeeingDots() {
  return (
    <svg viewBox="0 0 160 30" width="100%" height="30" aria-hidden="true">
      {[0, 1, 2, 3, 4].map(i => <circle key={i} cx={12 + i * 32} cy="15" r="9" fill={i < 3 ? 'var(--teal)' : 'var(--raised)'} />)}
    </svg>
  )
}



// TILES

function TonightTiles() {
  return (
    <div className="tiles">
      <section className="tile" aria-labelledby="tile-moon">
        <h2 id="tile-moon">Moon</h2>
        <PhaseMoon lit={0.53} size={64} />
        <strong>53% lit</strong>
        <p>First quarter. Sets at 12:40am.</p>
      </section>

      <section className="tile" aria-labelledby="tile-dark">
        <h2 id="tile-dark">Darkness</h2>
        <DarknessArc />
        <strong>6:36pm</strong>
        <p>Fully dark until 5:29am.</p>
      </section>

      <section className="tile" aria-labelledby="tile-clouds">
        <h2 id="tile-clouds">Clouds</h2>
        <CloudBars />
        <strong>Clear till 1am</strong>
        <p>Then patchy until dawn.</p>
      </section>

      <section className="tile" aria-labelledby="tile-seeing">
        <h2 id="tile-seeing">Seeing</h2>
        <SeeingDots />
        <strong>Average</strong>
        <p>Stars will twinkle a little.</p>
      </section>
    </div>
  )
}

export default TonightTiles
