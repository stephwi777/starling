import { useEffect, useRef, useState } from 'react'
import { visibleStars } from './starField.js'
import './Stars.css'



// STARS

const tints = ['var(--frost)', 'var(--frost)', 'var(--frost)', 'var(--snow)', 'var(--bronze)', 'var(--teal)']

const stars = Array.from({ length: 300 }, (_, i) => ({
  id: i,
  top: Math.pow(Math.random(), 1.5) * 100,
  left: Math.random() * 100,
  size: Math.random() * 2 + 1,
  color: tints[Math.floor(Math.random() * tints.length)],
  duration: Math.random() * 4 + 4,
  delay: Math.random() * 6,
}))

const sparkles = [
  { id: 0, left: 8, top: 22 },
  { id: 1, left: 46, top: 6 },
  { id: 2, left: 62, top: 38 },
  { id: 3, left: 90, top: 14 },
]



// TEXT BOXES

const WORDS = 'h1, h2, h3, h4, p, li, dt, dd, label, time, figcaption, blockquote'
const CONTROLS = 'a, button, input, textarea, select'

function measure(field) {
  const origin = field.getBoundingClientRect()
  const areas = [field.parentElement, document.querySelector('.header')].filter(Boolean)
  const range = document.createRange()
  const boxes = []

  const add = rect => boxes.push({
    left: rect.left - origin.left,
    right: rect.right - origin.left,
    top: rect.top - origin.top,
    bottom: rect.bottom - origin.top,
  })

  areas.forEach(area => {
    area.querySelectorAll(WORDS).forEach(element => {
      range.selectNodeContents(element)
      Array.from(range.getClientRects()).forEach(add)
    })

    area.querySelectorAll(CONTROLS).forEach(element => add(element.getBoundingClientRect()))
  })

  return { size: { width: origin.width, height: origin.height }, boxes }
}



// FIELD

function Stars() {
  const ref = useRef(null)
  const [shown, setShown] = useState({ stars: [], sparkles: [] })

  useEffect(() => {
    const field = ref.current
    let active = true

    const update = () => {
      if (!active) return

      const { size, boxes } = measure(field)

      setShown({ stars: visibleStars(stars, size, boxes), sparkles: visibleStars(sparkles, size, boxes) })
    }

    const observer = new ResizeObserver(update)
    observer.observe(field.parentElement)
    document.fonts.ready.then(update)

    return () => {
      active = false
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className="stars" aria-hidden="true">
      {shown.stars.map(star => (
        <span
          key={star.id}
          className="star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {shown.sparkles.map(sparkle => (
        <svg
          key={sparkle.id}
          className="sparkle"
          viewBox="0 0 14 14"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.id * 1.7}s`,
          }}
        >
          <path d="M7 0 Q8 6 14 7 Q8 8 7 14 Q6 8 0 7 Q6 6 7 0 Z" fill="var(--moon)" />
        </svg>
      ))}
    </div>
  )
}

export default Stars
