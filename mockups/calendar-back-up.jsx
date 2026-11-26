import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import { PlaceProvider } from '../src/place/PlaceContext.jsx'
import { SettingsProvider } from '../src/settings/SettingsContext.jsx'
import App from '../src/App.jsx'



// OPTIONS

const OPTIONS = [
  { id: 'a', name: 'A · At the end of the list', note: 'One flat button after the last month. Never covers anything, but you only see it once you reach the bottom.' },
  { id: 'b', name: 'B · In the month bar', note: 'A small button on the right of the sticky month name. Stays in view the whole time you are in the list.' },
  { id: 'c', name: 'C · Teal chevron', note: 'B with just a teal up chevron. Screen readers still hear “Back to the calendar”, and hovering shows it as a tooltip.', icon: 'up-chevron', color: 'teal' },
  { id: 'd', name: 'D · Yellow arrow', note: 'B with just a yellow up arrow. Same hidden name and tooltip as C.', icon: 'up-arrow', color: 'beak' },
  { id: 'e', name: 'E · “Back”', note: 'B with a chevron and one word.', text: 'Back' },
  { id: 'f', name: 'F · “Return”', note: 'B with a chevron and one word.', text: 'Return' },
]

const search = new URLSearchParams(location.search)
const variant = search.get('v')
const auto = search.has('auto')
const option = OPTIONS.find(each => each.id === variant)
const inBar = variant && variant !== 'a'



// BACK TO THE CALENDAR

function backToCalendar() {
  const day = document.querySelector('.month [tabindex="0"]')
  const still = document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({ top: 0, behavior: still ? 'instant' : 'smooth' })
  day?.focus({ preventScroll: true })
}

function makeButton() {
  const button = document.createElement('button')

  button.type = 'button'
  button.addEventListener('click', backToCalendar)

  if (option.icon) {
    button.className = `back-icon ${option.icon}`
    button.style.color = `var(--${option.color})`
    button.ariaLabel = 'Back to the calendar'
    button.title = 'Back to the calendar'
  } else {
    button.className = 'back-up soft-button'
    button.textContent = option.text ?? 'Back to the calendar'
    if (option.text) button.ariaLabel = `${option.text} to the calendar`
  }

  return button
}

function place() {
  const list = document.querySelector('.year-list')

  if (!list) return

  if (variant === 'a') {
    const end = list.querySelector('.back-end') ?? Object.assign(document.createElement('div'), { className: 'back-end' })

    if (!end.firstChild) end.append(makeButton())
    if (list.lastElementChild !== end) list.append(end)
  }

  if (inBar) {
    const bar = list.querySelector('.back-bar') ?? Object.assign(document.createElement('div'), { className: 'back-bar' })
    const before = list.querySelector('.year-month')

    if (!bar.firstChild) bar.append(makeButton())
    if (before && bar.nextElementSibling !== before) before.before(bar)
  }
}



// SCROLL INTO PLACE

function scrollWhenReady() {
  const list = document.querySelector('.year-list')

  if (!list) return false

  list.open = true

  const months = list.querySelectorAll('.year-month')

  if (months.length < 12 || list.querySelector('[role="status"]')) return false

  if (variant === 'a') window.scrollTo({ top: list.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 120, behavior: 'instant' })
  if (inBar) window.scrollTo({ top: months[2].getBoundingClientRect().top + window.scrollY + 80, behavior: 'instant' })

  return true
}



// MOCK

function Mock() {
  useEffect(() => {
    let scrolled = !auto

    const timer = setInterval(() => {
      place()
      if (!scrolled) scrolled = scrollWhenReady()
    }, 200)

    return () => clearInterval(timer)
  }, [])

  return null
}



// SHEET

function Sheet() {
  return (
    <main className="sheet">
      <h1>Back to the calendar</h1>
      <p>Each frame is the real Calendar page at phone width, with “All events by month” opened and scrolled down. Both buttons scroll to the top and move keyboard focus to today in the month grid. With reduced motion on, they jump instead of gliding.</p>

      <div className="frames">
        {OPTIONS.map(option => (
          <div key={option.id}>
            <h2>{option.name}</h2>
            <small>{option.note}</small>
            <iframe title={option.name} src={`?v=${option.id}&auto`} />
            <a href={`?v=${option.id}&auto`} target="_blank" rel="noreferrer">Open full size</a>
          </div>
        ))}
      </div>
    </main>
  )
}



// PAGE

function Page() {
  return (
    <MemoryRouter initialEntries={['/calendar']}>
      <PlaceProvider>
        <SettingsProvider>
          <App />
          <Mock />
        </SettingsProvider>
      </PlaceProvider>
    </MemoryRouter>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(variant ? <Page /> : <Sheet />)

export default Sheet
