import { GROUPS, KINDS } from '../../sky/calendar/kinds.js'



// GROUP

function Group({ group, kinds, toggleKind, setGroup }) {
  const items = KINDS.filter(kind => kind.group === group.id)
  const shown = items.filter(kind => kinds.includes(kind.id)).length

  return (
    <details className="kind-group" data-group={group.id}>
      <summary>
        <i className="swatch" aria-hidden="true" />
        <span className="kind-name">{group.name}</span>
        <small><span aria-hidden="true">{shown}/{items.length}</span><span className="visually-hidden">, {shown} of {items.length} shown</span></small>
      </summary>

      <label className="kind-all">
        <input
          type="checkbox"
          checked={shown === items.length}
          ref={box => {
            if (box) box.indeterminate = shown > 0 && shown < items.length
          }}
          onChange={event => setGroup(group.id, event.target.checked)}
        />
        All
      </label>

      {items.map(kind => (
        <label key={kind.id}>
          <input type="checkbox" checked={kinds.includes(kind.id)} onChange={() => toggleKind(kind.id)} />
          {kind.name}
        </label>
      ))}
    </details>
  )
}



// KIND LIST

function KindList({ id, kinds, toggleKind, setGroup, suggest }) {
  const total = KINDS.filter(kind => kinds.includes(kind.id)).length

  return (
    <div className="kind-list" id={id}>
      <div className="kind-head">
        <h2>Show on calendar</h2>
        <button type="button" className="kind-reset" onClick={suggest}>Suggested</button>
      </div>

      <p className="kind-count">{total} of {KINDS.length} kinds of events</p>

      {GROUPS.map(group => <Group key={group.id} group={group} kinds={kinds} toggleKind={toggleKind} setGroup={setGroup} />)}
    </div>
  )
}

export default KindList
