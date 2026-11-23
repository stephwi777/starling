import { Fragment, useState } from 'react'
import { GROUPS, KINDS } from '../../sky/calendar/kinds.js'



// CHECKBOX

function Box({ checked, mixed = false, label, describedBy, onChange }) {
  return (
    <>
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        aria-describedby={describedBy}
        ref={box => {
          if (box) box.indeterminate = mixed
        }}
        onChange={onChange}
      />
      <span className="kind-box" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path className="kind-tick" d="M3.5 8.5 L6.6 11.4 L12.5 4.6" />
          <path className="kind-dash" d="M4 8 H12" />
        </svg>
      </span>
    </>
  )
}



// GROUP

function Group({ group, kinds, note, kindNotes, toggleKind, setGroup }) {
  const [open, setOpen] = useState(false)
  const items = KINDS.filter(kind => kind.group === group.id)
  const shown = items.filter(kind => kinds.includes(kind.id)).length
  const listId = `kinds-${group.id}`

  return (
    <div className={`kind-group${open ? ' open' : ''}`} data-group={group.id}>
      <div className="kind-group-head">
        <label className="kind-option group-box">
          <Box
            checked={shown === items.length}
            mixed={shown > 0 && shown < items.length}
            label={`Show all ${group.name.toLowerCase()}`}
            onChange={event => setGroup(group.id, event.target.checked)}
          />
        </label>

        <button type="button" className="kind-toggle" aria-expanded={open} aria-controls={listId} onClick={() => setOpen(now => !now)}>
          <span className="kind-name">{group.name}</span>
          <small><span aria-hidden="true">{shown}/{items.length}</span><span className="visually-hidden">, {shown} of {items.length} shown</span></small>
          <span className="kind-chevron" aria-hidden="true">›</span>
        </button>
      </div>

      {note && <p className="kind-note">{note}</p>}

      {open && (
        <div className="kind-items" id={listId}>
          {items.map(kind => (
            <Fragment key={kind.id}>
              <label className="kind-option">
                <Box checked={kinds.includes(kind.id)} describedBy={kindNotes[kind.id] ? `note-${kind.id}` : undefined} onChange={() => toggleKind(kind.id)} />
                {kind.name}
              </label>

              {kindNotes[kind.id] && <p className="kind-note" id={`note-${kind.id}`}>{kindNotes[kind.id]}</p>}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}



// KIND LIST

function KindList({ id, kinds, groupNotes = {}, kindNotes = {}, toggleKind, setGroup, suggest }) {
  const total = KINDS.filter(kind => kinds.includes(kind.id)).length

  return (
    <div className="kind-list" id={id}>
      <div className="kind-head">
        <h2>Show on calendar</h2>
        <button type="button" className="kind-reset soft-button" onClick={suggest}>Suggested</button>
      </div>

      <p className="kind-count">{total} of {KINDS.length} kinds of events</p>

      {GROUPS.map(group => <Group key={group.id} group={group} kinds={kinds} note={groupNotes[group.id]} kindNotes={kindNotes} toggleKind={toggleKind} setGroup={setGroup} />)}
    </div>
  )
}

export default KindList
