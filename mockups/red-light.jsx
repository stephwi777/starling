import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/Header.css'
import '../src/components/Footer.css'
import '../src/components/MotionToggle.css'
import LogoMark from '../src/components/LogoMark.jsx'



// OPTIONS

const OPTIONS = [
  {
    id: 'moon',
    title: 'C1. Moon switch',
    text: 'The Moon rolls across a tiny night sky, and the stars twinkle as it passes. When red light is on, the whole sky, Moon included, turns red.',
  },
  {
    id: 'flashlight',
    title: 'C2. Red flashlight',
    text: 'The knob is a little flashlight, like the red ones stargazers carry. Switching it on lights the bulb and shines a soft beam across the switch.',
  },
  {
    id: 'eye',
    title: 'C3. Night eye',
    text: 'The knob is an eye that blinks when you switch it. With red light on, its pupil opens wide, which is what red light is for: keeping your eyes adjusted to the dark.',
  },
]



// KNOBS

function MoonKnob() {
  return (
    <svg viewBox="0 0 28 28">
      <circle className="moon-face" cx="14" cy="14" r="14" />
      <circle className="crater" cx="9.5" cy="10" r="3" />
      <circle className="crater" cx="17.5" cy="17.5" r="4" />
      <circle className="crater" cx="18" cy="7.5" r="1.6" />
    </svg>
  )
}

function FlashlightKnob() {
  return (
    <svg viewBox="0 0 28 28">
      <circle className="torch-body" cx="14" cy="14" r="14" />
      <circle className="torch-lens" cx="14" cy="14" r="8.5" />
      <circle className="torch-bulb" cx="14" cy="14" r="4" />
    </svg>
  )
}

function EyeKnob({ on }) {
  return (
    <svg viewBox="0 0 28 28" key={on}>
      <circle className="eye-ball" cx="14" cy="14" r="14" />
      <path className="eye-white" d="M4.5 14 C7.5 9.2 10.6 7.8 14 7.8 C17.4 7.8 20.5 9.2 23.5 14 C20.5 18.8 17.4 20.2 14 20.2 C10.6 20.2 7.5 18.8 4.5 14 Z" />
      <circle className="eye-pupil" cx="14" cy="14" r="2.6" />
      <rect className="eye-lid" x="3" y="6" width="22" height="16" rx="8" />
    </svg>
  )
}



// SWITCH

function Stars({ on }) {
  return (
    <span className="stars" key={on}>
      <i style={{ left: '22%', top: '30%' }} />
      <i style={{ left: '40%', top: '64%' }} />
      <i style={{ left: '60%', top: '26%' }} />
      <i style={{ left: '76%', top: '60%' }} />
    </span>
  )
}

function FunSwitch({ kind, on, toggle }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`fun-switch ${kind}`} onClick={toggle}>
      <span>Red light</span>

      <span className="track" aria-hidden="true">
        {kind === 'moon' && <Stars on={on} />}
        {kind === 'flashlight' && <span className="beam" />}

        <span className="knob">
          {kind === 'moon' && <MoonKnob />}
          {kind === 'flashlight' && <FlashlightKnob />}
          {kind === 'eye' && <EyeKnob on={on} />}
        </span>
      </span>
    </button>
  )
}



// PREVIEW PAGE

function Preview({ option }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.light = on ? 'red' : 'normal'
  }, [on])

  return (
    <>
      <header className="header">
        <div className="bar">
          <a className="logo" href="#top">
            <LogoMark />
            Starling
          </a>

          <nav aria-label="Main">
            <a className="active" href="#top">Tonight</a>
            <a href="#top">Calendar</a>
            <a href="#top">Map</a>
            <a href="#top">Learn</a>
            <a href="#top">Tools</a>
          </nav>

          <button type="button" className="location">
            <svg viewBox="0 0 12 16" aria-hidden="true">
              <path d="M6 0C2.7 0 0 2.6 0 5.9 0 10.3 6 16 6 16s6-5.7 6-10.1C12 2.6 9.3 0 6 0Zm0 8.2A2.3 2.3 0 1 1 6 3.6a2.3 2.3 0 0 1 0 4.6Z" />
            </svg>
            <span>Kansas City</span>
          </button>
        </div>
      </header>

      <main className="sample">
        <h1>Monday night, November 23</h1>
        <p>Clear early, then a bright Moon most of the night.</p>

        <div className="tiles">
          <div className="tile">
            <div className="moon-drawing" aria-hidden="true" />
            <strong>99% lit</strong>
            <small>Full Moon tonight</small>
          </div>

          <div className="tile">
            <strong className="teal">Moonless</strong>
            <small>No moonless hours tonight</small>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-body">
          <div className="footer-base">
            <p>© 2026 Stephanie Wilson. All rights reserved.</p>

            <div className="footer-switches">
              <button type="button" className="motion">Pause animations</button>
              <FunSwitch kind={option} on={on} toggle={() => setOn(now => !now)} />
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}



// SHEET

const DESKTOP = 1200

function WideFrame({ title, src }) {
  const [scale, setScale] = useState(1)
  const box = useRef(null)

  useEffect(() => {
    const watcher = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / DESKTOP)))

    watcher.observe(box.current)
    return () => watcher.disconnect()
  }, [])

  return (
    <div ref={box} className="wide" style={{ height: 440 * scale }}>
      <iframe title={title} src={src} style={{ width: DESKTOP, height: 440, transform: `scale(${scale})` }} />
    </div>
  )
}

function Sheet() {
  return (
    <div className="sheet">
      <h1>A fun red light switch for the footer</h1>
      <p>Each switch sits next to Pause animations at the bottom of every page. Below is a close-up you can try, then the switch in place, wide and at phone size. Every switch says “Red light” and works with the keyboard and screen readers.</p>

      {OPTIONS.map(option => (
        <Option key={option.id} option={option} />
      ))}
    </div>
  )
}

function Option({ option }) {
  const [on, setOn] = useState(false)
  const src = `./red-light.html?frame=${option.id}`

  return (
    <section>
      <h2>{option.title}</h2>
      <p>{option.text} <a href={src} target="_blank" rel="noreferrer">Open full size</a></p>

      <div className="close-up">
        <FunSwitch kind={option.id} on={on} toggle={() => setOn(now => !now)} />
      </div>

      <div className="frames">
        <WideFrame title={`${option.title}, wide`} src={src} />
        <iframe className="phone" title={`${option.title}, phone`} src={src} />
      </div>
    </section>
  )
}



// START

const frame = new URLSearchParams(location.search).get('frame')

document.body.className = frame ? 'in-frame' : ''
createRoot(document.getElementById('root')).render(frame ? <Preview option={frame} /> : <Sheet />)

export default Sheet
