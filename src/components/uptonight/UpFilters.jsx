import { useEffect, useRef, useState } from 'react'
import GearGlyph from '../sky-icons/GearGlyph.jsx'



// OPTIONS

const GEARS = [
  { value: 1, label: 'Eyes' },
  { value: 2, label: 'Binoculars' },
  { value: 3, label: 'Telescope' },
]

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'planet', label: 'Moon & planets' },
  { value: 'star', label: 'Stars' },
  { value: 'shape', label: 'Constellations' },
  { value: 'deep', label: 'Deep sky' },
  { value: 'meteor', label: 'Meteors' },
]

const CHEVRON = <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M5 3 L10 8 L5 13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>

function smooth() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('still') ? 'auto' : 'smooth'
}



// GEAR SWITCH

function GearSwitch({ gear, onGear }) {
  const buttons = useRef([])

  function onKeyDown(event) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]

    if (!step) return

    event.preventDefault()

    const next = Math.max(1, Math.min(3, gear + step))

    onGear(next)
    buttons.current[next - 1]?.focus()
  }

  return (
    <div className="up-gear" role="radiogroup" aria-label="Gear" onKeyDown={onKeyDown}>
      {GEARS.map(({ value, label }, i) => (
        <button
          key={value}
          ref={element => { buttons.current[i] = element }}
          type="button"
          role="radio"
          aria-checked={gear === value}
          tabIndex={gear === value ? 0 : -1}
          onClick={() => onGear(value)}
        >
          <GearGlyph gear={value} />
          {label}
        </button>
      ))}
    </div>
  )
}



// TYPE CHIPS

function TypeChips({ type, onType }) {
  const strip = useRef(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const element = strip.current

    const measure = () => setEdges({
      left: element.scrollLeft > 4,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    })

    measure()
    element.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      element.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  function choose(event, value) {
    onType(value)
    event.currentTarget.scrollIntoView({ behavior: smooth(), inline: 'nearest', block: 'nearest' })
  }

  function nudge(direction) {
    strip.current.scrollBy({ left: direction * strip.current.clientWidth * 0.7, behavior: smooth() })
  }

  return (
    <div className={['up-types', edges.left && 'can-left', edges.right && 'can-right'].filter(Boolean).join(' ')}>
      <button type="button" className="up-nudge left" aria-hidden="true" tabIndex={-1} onClick={() => nudge(-1)}>{CHEVRON}</button>
      <div className="up-chips" ref={strip} role="group" aria-label="Type">
        {TYPES.map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={type === value} onClick={event => choose(event, value)}>{label}</button>
        ))}
      </div>
      <button type="button" className="up-nudge right" aria-hidden="true" tabIndex={-1} onClick={() => nudge(1)}>{CHEVRON}</button>
    </div>
  )
}



// UP FILTERS

function UpFilters({ gear, type, query, onGear, onType, onQuery }) {
  return (
    <div className="up-filters">
      <GearSwitch gear={gear} onGear={onGear} />
      <TypeChips type={type} onType={onType} />
      <label className="up-search">
        <svg viewBox="-12 -12 24 24" width="16" height="16" aria-hidden="true"><circle cx="-2" cy="-2" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M3 3 L9 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        <span className="visually-hidden">Find an object</span>
        <input type="search" value={query} placeholder="Find a star, planet or nebula" onChange={event => onQuery(event.target.value)} />
      </label>
    </div>
  )
}

export default UpFilters
