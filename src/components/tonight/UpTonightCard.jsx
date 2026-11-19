import Card from '../ui/Card.jsx'
import IconWell from '../ui/IconWell.jsx'
import { upTonight } from '../../sky/upTonight.js'
import { SHAPES } from '../ui/constellationShapes.js'
import { ConstellationIcon, SparkleIcon } from '../ui/icons.jsx'
import { ObjectIcon } from './Icons.jsx'



// ROW ICON

function RowIcon({ object }) {
  if (object.kind === 'shape' && SHAPES[object.name]) return <ConstellationIcon name={object.name} />

  return <ObjectIcon object={object} />
}



// UP TONIGHT CARD

function UpTonightCard({ sky, place }) {
  const { picks, total, empty } = upTonight(sky, place.timeZone)

  return (
    <Card labelledBy="up-title">
      <div className="card-head">
        <IconWell><SparkleIcon /></IconWell>
        <h2 id="up-title">Up tonight</h2>
        {picks.length > 0 && <span className="up-count">{picks.length} of {total}</span>}
      </div>

      {empty ? (
        <p className="card-note">{empty}</p>
      ) : (
        <ul className="up-list">
          {picks.map(({ key, name, object, note, gear }) => (
            <li key={key}>
              <IconWell><RowIcon object={object} /></IconWell>
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
