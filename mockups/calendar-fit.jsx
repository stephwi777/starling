import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import { PlaceProvider } from '../src/place/PlaceContext.jsx'
import { SettingsProvider } from '../src/settings/SettingsContext.jsx'
import App from '../src/App.jsx'



// OPTIONS

const OPTIONS = [
  { id: 'now', name: 'Today’s layout', note: 'For comparison.' },
  { id: 'a', name: 'A · Checklist button', note: 'Calendar sits exactly under the header. “Choose events” opens the checklist.' },
  { id: 'b', name: 'B · Checklist stays', note: 'Right edge lines up with the header. The checklist stays on the left.' },
]



// CHOOSE BUTTON

function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 4 H14 M4.5 8 H11.5 M7 12 H9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function ChooseButton() {
  const [holder, setHolder] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const controls = document.querySelector('.month-head .calendar-controls')

      if (!controls || controls.querySelector('.fit-holder')) return

      const box = document.createElement('span')

      box.className = 'fit-holder'
      box.style.display = 'contents'
      controls.prepend(box)
      setHolder(box)
    }, 200)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('choosing', open)

    if (!open) return

    const button = document.querySelector('.fit-choose').getBoundingClientRect()
    const body = document.querySelector('.calendar-body').getBoundingClientRect()

    root.style.setProperty('--panel-left', `${Math.min(button.left - body.left, body.width - 346)}px`)
    root.style.setProperty('--panel-top', `${button.bottom - body.top + 10}px`)

    function away(event) {
      if (!event.target.closest('.calendar-side, .fit-choose')) setOpen(false)
    }

    function key(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', key)

    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  if (!holder) return null

  return createPortal(
    <button type="button" className="fit-choose soft-button" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <FilterIcon />Choose events
    </button>,
    holder
  )
}



// PICKER

function Picker() {
  const [choice, setChoice] = useState('a')
  const [guides, setGuides] = useState(true)

  useEffect(() => {
    const root = document.documentElement

    if (choice === 'now') delete root.dataset.fit
    else root.dataset.fit = choice

    root.classList.remove('choosing')
  }, [choice])

  useEffect(() => {
    if (guides) document.documentElement.dataset.guides = ''
    else delete document.documentElement.dataset.guides
  }, [guides])

  return (
    <div className="picker">
      <fieldset>
        <legend>Laptop layouts (1280–1879px wide)</legend>
        {OPTIONS.map(option => (
          <label key={option.id}>
            <input type="radio" name="fit" checked={choice === option.id} onChange={() => setChoice(option.id)} />
            <span>
              <strong>{option.name}</strong>
              <small>{option.note}</small>
            </span>
          </label>
        ))}
        <label>
          <input type="checkbox" checked={guides} onChange={() => setGuides(value => !value)} />
          <span>
            <strong>Show header edges</strong>
            <small>Dashed lines where the logo and location button sit.</small>
          </span>
        </label>
      </fieldset>
      <p>Your window: {window.innerWidth}px wide.</p>
    </div>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(
  <MemoryRouter initialEntries={['/calendar']}>
    <PlaceProvider>
      <SettingsProvider>
        <App />
        <ChooseButton />
        <Picker />
      </SettingsProvider>
    </PlaceProvider>
  </MemoryRouter>
)

export default Picker
