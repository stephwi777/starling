import { useId } from 'react'
import './OptionSwitch.css'



// OPTION SWITCH

function OptionSwitch({ label, options, value, onChange }) {
  const id = useId()

  return (
    <div className="switch" role="group" aria-labelledby={id}>
      <span id={id}>{label}</span>
      <span className="options">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </span>
    </div>
  )
}

export default OptionSwitch
