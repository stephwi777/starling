import { Link } from 'react-router'
import IconWell from '../ui/IconWell.jsx'
import { ConstellationIcon, PineIcon, TelescopeIcon } from '../ui/icons.jsx'



// DOORS

const DOORS = [
  { to: '/map', Icon: PineIcon, title: 'Find dark skies', note: 'Parks and observatories near you' },
  { to: '/learn', Icon: ConstellationIcon, title: 'Find Cassiopeia', note: "This month's constellation" },
  { to: '/tools', Icon: TelescopeIcon, title: 'Sky tools', note: 'Moon phases, sky map and more' },
]

function Doors() {
  return (
    <nav className="doors" aria-label="Explore Starling">
      {DOORS.map(({ to, Icon, title, note }) => (
        <Link key={to} className="home-door" to={to}>
          <IconWell><Icon /></IconWell>
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
