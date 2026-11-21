// WORLD SWITCH

function WorldSwitch({ world, setWorld }) {
  return (
    <div className={`world-switch${world ? ' world' : ''}`} role="group" aria-label="Which events to show">
      <button type="button" aria-pressed={!world} onClick={() => setWorld(false)}>Visible from here</button>
      <button type="button" aria-pressed={world} onClick={() => setWorld(true)}>Worldwide</button>
    </div>
  )
}

export default WorldSwitch
