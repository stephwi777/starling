import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/pages/Tonight.css'
import SkyScene from '../src/components/sky/SkyScene.jsx'
import { skyLook } from '../src/sky/skyLook.js'



// SAMPLE

const LOOK = skyLook({ sunAlt: -30, moonAlt: -10, moonLit: 0.5, moonAngle: 90, cloudCover: 95, isHome: false })

const LINES = {
  rain: 'Rain likely until 2am, then clearing before dawn.',
  snow: 'Snow likely all night. Stay in and stay warm!',
}

const DROP = 'M0 -4.2 Q3.2 0 3.2 1.6 A3.2 3.2 0 0 1 -3.2 1.6 Q-3.2 0 0 -4.2 Z'
const FLAKE = 'M0 -3.6 V3.6 M-3.1 -1.8 L3.1 1.8 M-3.1 1.8 L3.1 -1.8'

function seeded(seed) {
  let value = seed

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}



// SHAPES

function Drop({ size = 7 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="-3.6 -4.6 7.2 9.4" aria-hidden="true">
      <path d={DROP} fill="var(--star-blue)" opacity="0.8" />
    </svg>
  )
}

function Flake({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="-4.4 -4.4 8.8 8.8" aria-hidden="true">
      <path d={FLAKE} stroke="var(--frost)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Piece({ kind, round, size }) {
  if (kind === 'rain') return <Drop size={size} />
  if (round) return <span className="dot" style={{ '--size': `${size}px` }} />

  return <Flake size={size + 3} />
}



// TREATMENTS

function Everywhere({ kind }) {
  const random = seeded(kind === 'rain' ? 7 : 11)
  const count = kind === 'rain' ? 46 : 38

  return (
    <div className="falling" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const time = kind === 'rain' ? 1.1 + random() * 0.6 : 8 + random() * 5

        return (
          <span key={i} style={{ left: `${random() * 100}%`, animationDuration: `${time}s`, animationDelay: `${-random() * time}s` }}>
            <Piece kind={kind} round size={5 + random() * 4} />
          </span>
        )
      })}
    </div>
  )
}

const UNDER = [
  { from: 4, to: 28, top: 50 },
  { from: 50, to: 76, top: 58 },
  { from: 84, to: 96, top: 44 },
]

function FromClouds({ kind }) {
  const random = seeded(kind === 'rain' ? 3 : 5)

  return (
    <div className="falling short" aria-hidden="true">
      {UNDER.flatMap((cloud, c) => Array.from({ length: 6 }, (_, i) => {
        const time = kind === 'rain' ? 1.4 + random() * 0.5 : 5 + random() * 3

        return (
          <span
            key={`${c}-${i}`}
            style={{
              left: `${cloud.from + random() * (cloud.to - cloud.from)}%`,
              top: `${cloud.top}%`,
              '--drop': '90px',
              animationDuration: `${time}s`,
              animationDelay: `${-random() * time}s`,
            }}
          >
            <Piece kind={kind} size={7 + random() * 2} />
          </span>
        )
      }))}
    </div>
  )
}

function Still({ kind }) {
  const random = seeded(kind === 'rain' ? 19 : 23)

  return (
    <div className="falling" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <span key={i} style={{ left: `${3 + random() * 94}%`, top: `${8 + random() * 78}%`, animation: 'none' }}>
          <Piece kind={kind} size={7 + random() * 3} />
        </span>
      ))}
    </div>
  )
}



// SKY

function Sky({ kind, Treatment }) {
  return (
    <div className="frame">
      <SkyScene look={LOOK} size="band" decor={<Treatment kind={kind} />}>
        <div className="band-text">
          <h1>
            <span className="band-title">Kansas City</span>
            <span>Monday, November 23</span>
          </h1>
          <p className="band-line">{LINES[kind]}</p>
        </div>
      </SkyScene>
    </div>
  )
}

const OPTIONS = [
  {
    title: 'A · Falling everywhere',
    note: 'Rain or snow falls across the whole sky, in front of the clouds but behind the words. Rain is quick little drops in the same shape as the icon; snow is soft round flakes drifting slowly with a gentle sway. The most like being outside.',
    Treatment: Everywhere,
  },
  {
    title: 'B · Falling from the clouds',
    note: 'A few short showers drop from under the clouds and fade out before the ground, like the cloud-with-drops icon brought to life. Calmer, with more of the sky left clear for the text. Snow uses the icon’s flake shape.',
    Treatment: FromClouds,
  },
  {
    title: 'C · Still',
    note: 'No motion at all: a light scatter of drops or flakes sits in the sky like a pattern. The quietest, and the same for everyone whether or not animations are paused.',
    Treatment: Still,
  },
]



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Rain and snow in the Tonight sky</h1>
      <p>Every version uses the real overcast sky and clouds. Rain or snow shows when the hour the sky is showing has a rain chance of 50% or more, the same rule as the hourly row. The sentence under the place name always says it in words too.</p>

      {OPTIONS.map(option => (
        <section key={option.title} className="option">
          <h2>{option.title}</h2>
          <p>{option.note}</p>
          <div className="pair">
            <div>
              <h3>Rain</h3>
              <Sky kind="rain" Treatment={option.Treatment} />
            </div>
            <div>
              <h3>Snow</h3>
              <Sky kind="snow" Treatment={option.Treatment} />
            </div>
          </div>
        </section>
      ))}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<Sheet />)
