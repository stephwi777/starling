import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import IconWell from '../ui/IconWell.jsx'
import { PineIcon, SparkleIcon, TelescopeIcon } from '../ui/icons.jsx'
import SkyIcon from '../sky-icons/SkyIcon.jsx'



// HELPERS

const PATTERNS = ['Big Dipper', 'Great Square']

function starName(name) {
  return PATTERNS.includes(name) ? `the ${name}` : name
}



// DOORS

function useConstellation(now, place) {
  const [constellation, setConstellation] = useState(null)
  const month = `${now.getUTCFullYear()}-${now.getUTCMonth()}`

  useEffect(() => {
    let current = true

    import('../../sky/monthConstellation.js').then(({ monthConstellation }) => {
      if (current) setConstellation(monthConstellation(new Date(), place))
    })

    return () => {
      current = false
    }
  }, [month, place])

  return constellation
}

function Doors({ now, place }) {
  const constellation = useConstellation(now, place)
  const shape = constellation && PATTERNS.includes(constellation.name)

  const doors = [
    { to: '/map', icon: <PineIcon />, title: 'Find dark skies', note: 'Parks and observatories near you' },
    {
      to: '/learn',
      icon: constellation ? <SkyIcon object={constellation} /> : <SparkleIcon />,
      title: constellation ? `Find ${starName(constellation.name)}` : 'Find a constellation',
      note: shape ? "This month's star pattern" : "This month's constellation",
    },
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
