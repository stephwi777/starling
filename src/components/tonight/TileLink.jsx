import { Link } from 'react-router'



// TILE LINK

function TileLink({ id, to, link, panelClose }) {
  function toggle(event) {
    if (!panelClose.current) return

    event.preventDefault()
    panelClose.current()
  }

  return <Link ref={link} className="tile-link" aria-labelledby={id} to={to} state={{ fromTonight: true }} onClick={toggle} />
}

export default TileLink
