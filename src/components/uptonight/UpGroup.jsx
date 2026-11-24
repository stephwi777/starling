import { useEffect, useId, useRef } from 'react'
import SkyIcon from '../sky-icons/SkyIcon.jsx'
import GearGlyph from '../sky-icons/GearGlyph.jsx'
import Chevron from '../ui/Chevron.jsx'



// SETTINGS

const FIRST = 6
const STEP = 10
const GEAR_NAMES = ['', 'your eyes', 'binoculars', 'a telescope']



// ROW

function Row({ row, moonAngle, rowRef }) {
  return (
    <li ref={rowRef} tabIndex={-1}>
      <span className="well" aria-hidden="true"><SkyIcon object={row.object} moonAngle={moonAngle} /></span>
      <span className="up-text">
        <strong>{row.name}</strong>
        <small>{row.note}</small>
      </span>
      <span className="up-need">
        <GearGlyph gear={row.gear} />
        <span className="visually-hidden">, with {GEAR_NAMES[row.gear]}</span>
      </span>
    </li>
  )
}



// UP GROUP

function UpGroup({ title, when, rows, open, shown, moonAngle, onToggle, onShown }) {
  const body = useId()
  const items = useRef([])
  const focusAt = useRef(null)
  const count = Math.min(shown, rows.length)
  const left = rows.length - count

  useEffect(() => {
    if (focusAt.current === null) return

    items.current[focusAt.current]?.focus()
    focusAt.current = null
  }, [count])

  function more() {
    focusAt.current = count
    onShown(count + STEP)
  }

  return (
    <div className={`up-group${open ? ' open' : ''}`}>
      <button type="button" className="up-group-head" aria-expanded={open} aria-controls={body} onClick={onToggle}>
        <Chevron className="up-chevron" />
        <strong>{title}</strong>
        <span>{rows.length} · {when}</span>
      </button>

      <div className="up-group-body" id={body} inert={!open}>
        <div className="up-group-inner">
          <ul>
            {rows.slice(0, count).map((row, i) => (
              <Row key={row.key} row={row} moonAngle={moonAngle} rowRef={element => { items.current[i] = element }} />
            ))}
          </ul>

          {(left > 0 || count > FIRST) && (
            <div className="up-more">
              {left > 0 && <button type="button" onClick={more}>Show {Math.min(STEP, left)} more <span>· {left} left</span></button>}
              {count > FIRST && <button type="button" className="quiet" onClick={() => onShown(FIRST)}>Show fewer</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { FIRST }
export default UpGroup
