import { MoonIcon } from './Icons.jsx'
import './NightPicker.css'



// NIGHT PICKER

function NightPicker({ nights, index, words, timeZone, onPick }) {
  const day = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' })

  return (
    <nav className="nights box" aria-label="Choose a night">
      {nights.map(night => (
        <button
          key={night.date}
          type="button"
          aria-pressed={night.index === index}
          onClick={() => onPick(night)}
        >
          <MoonIcon angle={night.moonAngle} />
          <strong>{night.index === 0 ? 'Tonight' : day.format(night.noon)}</strong>
          <span>{words[night.index] ?? ''}</span>
        </button>
      ))}
    </nav>
  )
}

export default NightPicker
