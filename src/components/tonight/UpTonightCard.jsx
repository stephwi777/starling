import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { ClusterIcon, GalaxyIcon, MeteorIcon, SaturnIcon, SparkleIcon } from '../ui/icons.jsx'



// OBJECTS

const OBJECTS = [
  { name: 'Saturn', note: '4 fists up in the south', Icon: SaturnIcon },
  { name: 'Pleiades', note: 'Halfway up in the east', Icon: ClusterIcon },
  { name: 'Andromeda Galaxy', note: 'High in the northeast. Needs a dark sky.', Icon: GalaxyIcon, level: 2 },
  { name: 'Leonid meteors', note: 'About 15 an hour after midnight', Icon: MeteorIcon },
]



// UP TONIGHT CARD

function UpTonightCard() {
  return (
    <Card labelledBy="up-title">
      <div className="card-head">
        <IconWell><SparkleIcon /></IconWell>
        <h2 id="up-title">Up tonight</h2>
        <span className="see-all">See all 64</span>
      </div>

      <ul className="up-list">
        {OBJECTS.map(({ name, note, Icon, level }) => (
          <li key={name}>
            <IconWell><Icon /></IconWell>
            <span className="row-text">
              <strong>{name}{level && <span className="level">Level {level}</span>}</strong>
              <small>{note}</small>
            </span>
            <span className="chevron" aria-hidden="true">›</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default UpTonightCard
