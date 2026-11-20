import './NightStrip.css'



// DATES

function dateWords(date, timeZone, options) {
  return new Intl.DateTimeFormat('en-US', { timeZone, ...options }).format(date)
}



// ARROW

function StepArrow({ label, path, off, onClick }) {
  return (
    <button type="button" className="night-arrow" aria-label={label} aria-disabled={off} onClick={() => !off && onClick()}>
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d={path} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  )
}



// NIGHT STRIP

function NightStrip({ nights, tonight, chosen, timeZone, onPick }) {
  const day = night => dateWords(night.noon, timeZone, { weekday: 'long', month: 'long', day: 'numeric' })
  const night = nights[chosen]

  return (
    <div className="night-strip">
      <div className="night-days" role="group" aria-label="Nights">
        {nights.map((each, i) => (
          <button
            key={each.noon.getTime()}
            type="button"
            className={[i < tonight && 'past', i === tonight && 'tonight'].filter(Boolean).join(' ') || undefined}
            aria-label={`${day(each)}${i === tonight ? ', tonight' : ''}`}
            aria-current={i === chosen ? 'true' : undefined}
            onClick={() => onPick(i)}
          >
            <span aria-hidden="true">{dateWords(each.noon, timeZone, { weekday: 'narrow' })}</span>
            <b aria-hidden="true">{dateWords(each.noon, timeZone, { day: 'numeric' })}</b>
          </button>
        ))}
      </div>

      <div className="night-date">
        <StepArrow label="Night before" path="M10 3 L5 8 L10 13" off={chosen === 0} onClick={() => onPick(chosen - 1)} />
        <strong className={chosen === tonight ? 'tonight' : undefined} aria-live="polite">
          {dateWords(night.noon, timeZone, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </strong>
        <StepArrow label="Night after" path="M6 3 L11 8 L6 13" off={chosen === nights.length - 1} onClick={() => onPick(chosen + 1)} />
      </div>
    </div>
  )
}

export default NightStrip
