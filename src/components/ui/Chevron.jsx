import './ui.css'



// CHEVRON

function Chevron({ left = false, className = '' }) {
  const classes = ['chevron', left && 'left', className].filter(Boolean).join(' ')

  return <span className={classes} aria-hidden="true" />
}

export default Chevron
