import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'
import { filterRows, upList } from '../../sky/upList.js'
import { nextShower } from '../../sky/meteors.js'
import { clock } from '../../sky/words.js'
import Popover from '../panel/Popover.jsx'
import UpFilters from './UpFilters.jsx'
import UpGroup, { FIRST } from './UpGroup.jsx'
import './UpTonightPanel.css'



// WORDS

const GEAR_WORDS = ['', 'your eyes', 'binoculars', 'a telescope']
const START = { now: FIRST, later: FIRST, dawn: FIRST }

function emptyWords({ query, type }, now, timeZone) {
  if (query.trim()) return `Nothing called “${query.trim()}” is up tonight.`

  if (type === 'meteor') {
    const next = nextShower(now)
    const day = new Intl.DateTimeFormat('en-US', { timeZone, month: 'long', day: 'numeric' }).format(next.peak)

    return `No strong meteor showers tonight. The ${next.name} peak on ${day}.`
  }

  return 'Nothing like that is up tonight. Try more gear.'
}



// UP TONIGHT PANEL

function UpTonightPanel() {
  const { place, now, sky, links, registerClose } = useOutletContext()
  const tz = place.timeZone
  const list = useMemo(() => upList(sky, now, tz), [sky, now, tz])
  const [filters, setFilters] = useState({ gear: 2, type: 'all', query: '' })
  const [shown, setShown] = useState(START)
  const [open, setOpen] = useState({ now: true, later: false, dawn: false })

  const change = update => {
    setFilters(current => ({ ...current, ...update }))
    setShown(START)
  }

  const rows = filterRows(list.rows, filters)
  const split = clock(list.split, tz)

  const groups = [
    { key: 'now', title: list.atDark ? 'Up at dark' : 'Up now', when: clock(list.at, tz) },
    { key: 'later', title: 'Later tonight', when: `before ${split}` },
    { key: 'dawn', title: 'Before dawn', when: `after ${split}` },
  ].map(group => ({ ...group, rows: rows.filter(row => row.group === group.key) })).filter(group => group.rows.length)

  return (
    <Popover title="Up tonight" titleId="up-panel-title" link={links.up} registerClose={registerClose}>
      <p className="up-count-line" aria-live="polite">{rows.length} things to see with {GEAR_WORDS[filters.gear]}</p>



      {/* FILTERS */}

      <UpFilters
        gear={filters.gear}
        type={filters.type}
        query={filters.query}
        onGear={gear => change({ gear })}
        onType={type => change({ type })}
        onQuery={query => change({ query })}
      />



      {/* GROUPS */}

      <div className="up-groups">
        {groups.length ? groups.map(group => (
          <UpGroup
            key={group.key}
            title={group.title}
            when={group.when}
            rows={group.rows}
            open={open[group.key]}
            shown={shown[group.key]}
            moonAngle={sky.night.moonAngle}
            onToggle={() => setOpen(current => ({ ...current, [group.key]: !current[group.key] }))}
            onShown={count => setShown(current => ({ ...current, [group.key]: count }))}
          />
        )) : <p className="up-empty">{emptyWords(filters, now, tz)}</p>}
      </div>



      {/* NOTE */}

      <div className="popover-note">
        <p><strong>How do I measure “fists”?</strong></p>
        <p>Hold your fist out at arm’s length. One fist is about 10° of sky, so “4 fists up” is a little under halfway from the horizon to overhead.</p>
      </div>
    </Popover>
  )
}

export default UpTonightPanel
