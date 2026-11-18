import { Link } from 'react-router'
import './ui.css'



// PRESS BUTTON

function PressButton({ to, onClick, quiet, children }) {
  const className = quiet ? 'press quiet' : 'press'

  if (to) return <Link className={className} to={to}>{children}</Link>

  return <button type="button" className={className} onClick={onClick}>{children}</button>
}

export default PressButton
