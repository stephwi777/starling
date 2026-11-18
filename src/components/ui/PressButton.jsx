import { Link } from 'react-router'
import './ui.css'



// PRESS BUTTON

function PressButton({ to, onClick, children }) {
  if (to) return <Link className="press" to={to}>{children}</Link>

  return <button type="button" className="press" onClick={onClick}>{children}</button>
}

export default PressButton
