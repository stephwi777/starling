import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { upTonight } from '../../sky/upTonight.js'
import { SparkleIcon } from '../ui/icons.jsx'
import SkyIcon from '../sky-icons/SkyIcon.jsx'
import TileLink from './TileLink.jsx'



// ROW

function Row({ name, object, note, gear, moonAngle }) {
  return (
    <li>
      <IconWell><SkyIcon object={object} moonAngle={moonAngle} /></IconWell>
      <span className="row-text">
        <strong>
          {name}
          {gear && <span className="level"><span className="visually-hidden">, best with </span>{gear}</span>}
        </strong>
        <small>{note}</small>
      </span>
    </li>
  )
}



// UP TONIGHT CARD

function UpTonightCard({ sky, place, link, panelClose }) {
  const { picks, total, empty } = upTonight(sky, place.timeZone)

  return (
    <Card labelledBy="up-title" className="up-card">
      <div className="card-head">
        <IconWell><SparkleIcon /></IconWell>
        <h2 id="up-title">Up tonight</h2>
        {total > 0 && <span className="up-count" aria-hidden="true">See all {total}<i>›</i></span>}
      </div>

      <TileLink id="up-title" to="up" link={link} panelClose={panelClose} />

      {empty ? (
        <p className="card-note">{empty}</p>
      ) : (
        <>
          <ul className="up-list">
            {picks.map(({ key, ...pick }) => <Row key={key} {...pick} moonAngle={sky.night.moonAngle} />)}
          </ul>

          <ul className="up-list up-ghosts" aria-hidden="true">
            {[0, 1, 2].map(index => (
              <li key={index}>
                <span className="well" />
                <span className="ghost-lines"><i /><i /></span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

export default UpTonightCard
