import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { upTonight } from '../../sky/upTonight.js'
import { SparkleIcon } from '../ui/icons.jsx'
import SkyIcon from '../sky-icons/SkyIcon.jsx'
import TileLink from './TileLink.jsx'



// UP TONIGHT CARD

function UpTonightCard({ sky, place, link, panelClose }) {
  const { picks, total, empty } = upTonight(sky, place.timeZone)

  return (
    <Card labelledBy="up-title">
      <div className="card-head">
        <IconWell><SparkleIcon /></IconWell>
        <h2 id="up-title">Up tonight</h2>
        {total > 0 && <span className="up-count" aria-hidden="true">See all {total} ›</span>}
      </div>

      <TileLink id="up-title" to="up" link={link} panelClose={panelClose} />

      {empty ? (
        <p className="card-note">{empty}</p>
      ) : (
        <ul className="up-list">
          {picks.map(({ key, name, object, note, gear }) => (
            <li key={key}>
              <IconWell><SkyIcon object={object} moonAngle={sky.night.moonAngle} /></IconWell>
              <span className="row-text">
                <strong>
                  {name}
                  {gear && <span className="level"><span className="visually-hidden">, best with </span>{gear}</span>}
                </strong>
                <small>{note}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default UpTonightCard
