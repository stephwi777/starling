import { Fragment, useState } from 'react'
import { GROUPS, KINDS } from '../../sky/calendar/kinds.js'
import Chevron from '../ui/Chevron.jsx'



// CHECKBOX

function Box({ checked, mixed = false, label, describedBy, disabled = false, onChange }) {
  return (
    <>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
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
          <Chevron className="kind-chevron" />
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

function FavoritesOnly({ on, count, onChange }) {
  const none = count === 0

  return (
    <div className="fav-only">
      <label className={none ? 'kind-option fav-option disabled' : 'kind-option fav-option'}>
        <Box checked={on && !none} disabled={none} describedBy={none ? 'fav-only-note' : undefined} onChange={event => onChange(event.target.checked)} />
        Only my favorites
        {!none && <small>{count === 1 ? '1 favorite' : `${count} favorites`}</small>}
      </label>

      {none && <p className="kind-note" id="fav-only-note">Star events to build your favorites.</p>}
    </div>
  )
}

function KindList({ id, kinds, groupNotes = {}, kindNotes = {}, favoritesOnly = false, favoriteCount = 0, toggleKind, setGroup, setFavoritesOnly, suggest }) {
  const total = KINDS.filter(kind => kinds.includes(kind.id)).length
  const muted = favoritesOnly && favoriteCount > 0

  return (
    <div className="kind-list" id={id}>
      {setFavoritesOnly && <FavoritesOnly on={favoritesOnly} count={favoriteCount} onChange={setFavoritesOnly} />}

      <div className={muted ? 'kind-types muted' : 'kind-types'}>
        <div className="kind-head">
          <h2>Show on calendar</h2>
          <button type="button" className="kind-reset soft-button" onClick={suggest}>Suggested</button>
        </div>

        <p className="kind-count">{muted ? 'Paused while Only my favorites is on' : `${total} of ${KINDS.length} kinds of events`}</p>

        {GROUPS.map(group => <Group key={group.id} group={group} kinds={kinds} note={groupNotes[group.id]} kindNotes={kindNotes} toggleKind={toggleKind} setGroup={setGroup} />)}
      </div>
    </div>
  )
}

export default KindList
