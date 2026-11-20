import { clock } from '../../sky/words.js'
import './HourLabels.css'



// LOCAL HOUR

function localHour(date, timeZone) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(date))
}



// HOUR LABELS

function HourLabels({ hours, timeZone }) {
  const middle = i => ((i + 0.5) / hours.length) * 100

  return (
    <div className="hour-labels" aria-hidden="true">
      {hours.map((hour, i) => localHour(hour.time, timeZone) % 3 === 0 && (
        <span key={i} style={{ left: `${middle(i)}%` }}>{clock(hour.time, timeZone)}</span>
      ))}
    </div>
  )
}

export default HourLabels
