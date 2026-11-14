import { useId, useState } from 'react'
import { Link } from 'react-router'
import { filterObjects, sortEasiest } from '../../sky/listing.js'
import OptionSwitch from './OptionSwitch.jsx'
import ObjectRow from './ObjectRow.jsx'
import SunTimes from './SunTimes.jsx'
import './ObjectList.css'



// OPTIONS

const SHOW = [
  { value: 'now', label: 'Up now' },
  { value: 'tonight', label: 'Tonight' },
  { value: 'all', label: 'Everything' },
]

const GEAR = [
  { value: 3, label: 'Anything' },
  { value: 1, label: 'Eyes' },
  { value: 2, label: 'Binoculars' },
]



// CATEGORY

function Category({ title, note, list, filters, empty, rowProps }) {
  const id = useId()
  const shown = sortEasiest(filterObjects(list, filters))
  const hidden = filters.show === 'all' ? [] : list.filter(object => !object.visible)
  const count = list.filter(object => object.visible).length

  return (
    <section className="category" aria-labelledby={id}>
      <header>
        <h2 id={id}>{title}</h2>
        <p>{note ?? `${count} of ${list.length} visible tonight`}</p>
      </header>

      {shown.length > 0 && (
        <ul className="rows">
          <li className="columns" aria-hidden="true">
            <span></span>
            <span>Object</span>
            <span>Right now</span>
            <span>Tonight</span>
            <span>Gear</span>
            <span className="num adv">Alt</span>
            <span className="num adv">Az</span>
            <span className="num adv">Mag</span>
            <span className="num adv">Rise, set</span>
          </li>
          {shown.map(object => <ObjectRow key={object.name} object={object} {...rowProps} />)}
        </ul>
      )}

      {shown.length === 0 && list.length === 0 && empty}

      {shown.length === 0 && list.length > 0 && <p className="missing">Nothing matches right now. Try <strong>Everything</strong> or another time.</p>}

      {shown.length > 0 && hidden.length > 0 && (
        <p className="missing">
          <strong>Not visible tonight:</strong> {hidden.map(object => `${object.name} (${object.reason})`).join(', ')}.
        </p>
      )}
    </section>
  )
}



// OBJECT LIST

function ObjectList({ sky, at, gear, setGear, picked, onPick, timeZone }) {
  const [query, setQuery] = useState('')
  const [show, setShow] = useState('tonight')
  const searchId = useId()
  const filters = { query, show, gear, at, sun: sky.night.sun }
  const rowProps = { sky, at, picked, onPick, timeZone }
  const shared = { filters, rowProps }

  return (
    <section className="list box" aria-label="Everything in the sky">
      <div className="toolbar">
        <div className="search">
          <label htmlFor={searchId}>Find an object</label>
          <input id={searchId} type="search" placeholder="Saturn, M31, Orion…" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} />
        </div>
        <OptionSwitch label="Show" options={SHOW} value={show} onChange={setShow} />
        <OptionSwitch label="I'm using" options={GEAR} value={gear} onChange={setGear} />
      </div>

      <SunTimes night={sky.night} timeZone={timeZone} />

      <Category title="Moon" note={`${Math.round(sky.night.moonLit * 100)}% lit`} list={[sky.moon]} {...shared} />
      <Category title="Planets" list={sky.planets} {...shared} />
      <Category
        title="Meteor showers"
        note={sky.showers.length ? `${sky.showers.length} active` : 'None active'}
        list={sky.showers}
        empty={<p className="missing">No meteor showers are active tonight. <Link to="/calendar">See upcoming showers in the Calendar</Link>.</p>}
        {...shared}
      />
      <Category
        title="Comets"
        note="None bright enough tonight"
        list={[]}
        empty={<p className="missing">No comets are bright enough to see tonight. <Link to="/calendar">See upcoming comets in the Calendar</Link>.</p>}
        {...shared}
      />
      <Category title="Bright stars" list={sky.stars} {...shared} />
      <Category title="Constellations" list={sky.shapes} {...shared} />
      <Category title="Deep sky" list={sky.deep} {...shared} />
    </section>
  )
}

export default ObjectList
