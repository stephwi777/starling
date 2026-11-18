import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import LogoMark from './LogoMark.jsx'
import { usePlace } from '../place/usePlace.js'
import { shortName } from '../place/placeNames.js'
import './Header.css'



// HEADER

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { place, isSample, openPicker } = usePlace()

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)

    update()
    window.addEventListener('scroll', update, { passive: true })

    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header className={scrolled ? 'header scrolled' : 'header'}>
      <div className="bar">
        <Link className="logo" to="/">
          <LogoMark />
          Starling
        </Link>

        <nav aria-label="Main">
          <NavLink to="/tonight">Tonight</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/map">Map</NavLink>
          <NavLink to="/learn">Learn</NavLink>
          <NavLink to="/tools">Tools</NavLink>
        </nav>

        <button className="location" aria-haspopup="dialog" onClick={openPicker}>
          <svg viewBox="0 0 12 16" aria-hidden="true">
            <path d="M6 0C2.7 0 0 2.6 0 5.9 0 10.3 6 16 6 16s6-5.7 6-10.1C12 2.6 9.3 0 6 0Zm0 8.2A2.3 2.3 0 1 1 6 3.6a2.3 2.3 0 0 1 0 4.6Z" />
          </svg>
          {isSample ? 'Set location' : shortName(place)}
        </button>
      </div>
    </header>
  )
}

export default Header
