import Card from '../ui/Card.jsx'
import { ClearIcon, CloudIcon, DawnIcon, MoonsetIcon, SparkleIcon, SunsetIcon, TwilightIcon } from '../ui/icons.jsx'



// HOURS

const ICONS = {
  sunset: SunsetIcon,
  twilight: TwilightIcon,
  dark: SparkleIcon,
  clear: ClearIcon,
  moonset: MoonsetIcon,
  cloud: CloudIcon,
  dawn: DawnIcon,
}

const HOURS = [
  { time: '5:04pm', icon: 'sunset', word: 'Sunset', moment: true },
  { time: '6pm', icon: 'twilight', word: 'Twilight' },
  { time: '6:36pm', icon: 'dark', word: 'Fully dark', moment: true },
  { time: '7pm', icon: 'clear', word: 'Clear' },
  { time: '8pm', icon: 'clear', word: 'Clear' },
  { time: '9pm', icon: 'clear', word: 'Clear' },
  { time: '10pm', icon: 'clear', word: 'Clear' },
  { time: '11pm', icon: 'clear', word: 'Clear' },
  { time: '12am', icon: 'clear', word: 'Clear' },
  { time: '12:40am', icon: 'moonset', word: 'Moonset', moment: true },
  { time: '1am', icon: 'cloud', word: 'Patchy' },
  { time: '2am', icon: 'cloud', word: 'Patchy' },
  { time: '3am', icon: 'cloud', word: 'Patchy' },
  { time: '4am', icon: 'clear', word: 'Clear' },
  { time: '5:29am', icon: 'dawn', word: 'Dawn', moment: true },
]



// HOURS CARD

function HoursCard() {
  return (
    <Card labelledBy="hours-title" className="hours-card">
      <h2 id="hours-title" className="visually-hidden">Hour by hour</h2>
      <p className="hours-summary">Patchy clouds roll in around 1am. Leonid meteors are best after the Moon sets at 12:40am.</p>

      <ul className="hours">
        {HOURS.map(hour => {
          const Icon = ICONS[hour.icon]

          return (
            <li key={hour.time} className={hour.moment ? 'moment' : undefined}>
              <span className="hour-time">{hour.time}</span>
              <Icon />
              <span className="hour-word">{hour.word}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default HoursCard
