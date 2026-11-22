import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import { PlaceProvider } from '../src/place/PlaceContext.jsx'
import { SettingsProvider } from '../src/settings/SettingsContext.jsx'
import App from '../src/App.jsx'



// OPTIONS

const OPTIONS = [
  { id: 'a', name: 'A · Rise', note: 'Each card drifts up and fades in, one after another.' },
  { id: 'd', name: 'D · Over the horizon', note: 'Cards rise as you scroll, tied to your scrolling. Scroll back up and they sink again.' },
  { id: 'e', name: 'E · A and D together', note: 'Tied to your scrolling like D, but a gentler rise, and the cards follow each other like A.' },
]

const BITS = '.card-head, .card-verdict, .facts > div, .coming-list li, .home-door .well, .home-door > span'



// TAGGING

function tag() {
  document.querySelectorAll('.home-cards, .doors').forEach(group => {
    [...group.children].forEach((item, index) => {
      item.style.setProperty('--i', index)
      item.querySelectorAll(BITS).forEach((bit, count) => {
        bit.dataset.bit = ''
        bit.style.setProperty('--b', count)
      })
    })
  })
}

function watch() {
  const watcher = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      entry.target.classList.add('seen')
      watcher.unobserve(entry.target)
    })
  }, { threshold: 0.25 })

  document.querySelectorAll('.home-cards, .doors').forEach(group => watcher.observe(group))

  return watcher
}



// PICKER

function Picker() {
  const [choice, setChoice] = useState('a')
  const [round, setRound] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.reveal = choice
  }, [choice])

  useEffect(() => {
    const changes = new MutationObserver(tag)
    let watcher = null

    const start = setInterval(() => {
      if (!document.querySelector('.home-cards')) return

      clearInterval(start)
      tag()
      changes.observe(document.querySelector('.home-below'), { childList: true, subtree: true })
      watcher = watch()
    }, 100)

    return () => {
      clearInterval(start)
      changes.disconnect()
      watcher?.disconnect()
    }
  }, [round])

  function replay() {
    document.querySelectorAll('.seen').forEach(group => group.classList.remove('seen'))
    window.scrollTo({ top: 0, behavior: 'instant' })
    setRound(count => count + 1)
  }

  function pick(id) {
    setChoice(id)
    replay()
  }

  return (
    <div className="picker">
      <fieldset>
        <legend>Scroll down to see it</legend>
        {OPTIONS.map(option => (
          <label key={option.id}>
            <input type="radio" name="reveal" checked={choice === option.id} onChange={() => pick(option.id)} />
            <span>
              <strong>{option.name}</strong>
              <small>{option.note}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={replay}>Back to top and replay</button>
    </div>
  )
}



// RENDER

createRoot(document.getElementById('root')).render(
  <MemoryRouter>
    <PlaceProvider>
      <SettingsProvider>
        <App />
        <Picker />
      </SettingsProvider>
    </PlaceProvider>
  </MemoryRouter>
)

export default Picker
