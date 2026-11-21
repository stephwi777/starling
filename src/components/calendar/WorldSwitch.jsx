import { useState } from 'react'



// ICONS

function Pin() {
  return (
    <svg viewBox="-2 0 16 16" aria-hidden="true">
      <path d="M6 0C2.7 0 0 2.6 0 5.9 0 10.3 6 16 6 16s6-5.7 6-10.1C12 2.6 9.3 0 6 0Zm0 8.2A2.3 2.3 0 1 1 6 3.6a2.3 2.3 0 0 1 0 4.6Z" fill="currentColor" />
    </svg>
  )
}

function Globe() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="8" r="6.2" />
        <ellipse cx="8" cy="8" rx="2.7" ry="6.2" />
        <path d="M2 8 H14" />
      </g>
    </svg>
  )
}



// WORLD SWITCH

function WorldSwitch({ world, setWorld }) {
  const [moved, setMoved] = useState(false)

  function choose(next) {
    if (next === world) return

    setMoved(true)
    setWorld(next)
  }

  return (
    <div className={['world-switch', world && 'world', moved && 'moved'].filter(Boolean).join(' ')} role="group" aria-label="Which events to show">
      <button type="button" aria-pressed={!world} onClick={() => choose(false)}><Pin />Visible from here</button>
      <button type="button" aria-pressed={world} onClick={() => choose(true)}><Globe />Worldwide</button>
    </div>
  )
}

export default WorldSwitch
