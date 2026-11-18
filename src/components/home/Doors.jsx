import { Link } from 'react-router'
import IconWell from '../ui/IconWell.jsx'
import { ConstellationIcon, PineIcon, TelescopeIcon } from '../ui/icons.jsx'
import { monthConstellation } from '../../sky/monthConstellation.js'



// HELPERS

const PATTERNS = ['Big Dipper', 'Great Square']

function starName(name) {
  return PATTERNS.includes(name) ? `the ${name}` : name
}



// DOORS

function Doors({ now, place }) {
  const constellation = monthConstellation(now, place)

  const doors = [
    { to: '/map', icon: <PineIcon />, title: 'Find dark skies', note: 'Parks and observatories near you' },
    { to: '/learn', icon: <ConstellationIcon name={constellation.name} />, title: `Find ${starName(constellation.name)}`, note: PATTERNS.includes(constellation.name) ? "This month's star pattern" : "This month's constellation" },
    { to: '/tools', icon: <TelescopeIcon />, title: 'Sky tools', note: 'Moon phases, sky map and more' },
  ]

  return (
    <nav className="doors" aria-label="Explore Starling">
      {doors.map(({ to, icon, title, note }) => (
        <Link key={to} className="home-door" to={to}>
          <IconWell>{icon}</IconWell>
          <span>
            <strong>{title}</strong>
            <small>{note}</small>
          </span>
        </Link>
      ))}
    </nav>
  )
}

export default Doors
