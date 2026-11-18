import { useEffect, useRef, useState } from 'react'
import { visibleStars } from './starField.js'
import './Stars.css'



// STARS

const tints = ['var(--frost)', 'var(--frost)', 'var(--frost)', 'var(--star-blue)', 'var(--star-blue)', 'var(--star-warm)', 'var(--star-teal)', 'var(--star-rose)']

const stars = Array.from({ length: 640 }, (_, i) => {
  const bright = i % 16 === 0

  return {
    id: i,
    top: Math.pow(Math.random(), 1.4) * 100,
    left: Math.random() * 100,
    size: bright ? Math.random() * 0.9 + 2.9 : Math.pow(Math.random(), 2) * 2.3 + 0.9,
    opacity: bright ? 1 : Math.pow(Math.random(), 1.5) * 0.6 + 0.35,
    color: tints[Math.floor(Math.random() * tints.length)],
    bright,
    twinkle: !bright && Math.random() < 0.3,
    shimmer: Math.random() < 0.15,
    duration: Math.random() * 3 + 3,
    shimmerDuration: Math.random() * 3 + 3,
    delay: Math.random() * 8,
  }
})



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

function Stars({ amount = 1 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState([])

  useEffect(() => {
    const field = ref.current
    let active = true

    const update = () => {
      if (!active) return

      const { size, boxes } = measure(field)

      setShown(visibleStars(stars, size, boxes, amount))
    }

    const observer = new ResizeObserver(update)
    observer.observe(field.parentElement)
    document.fonts.ready.then(update)

    return () => {
      active = false
      observer.disconnect()
    }
  }, [amount])

  return (
    <div ref={ref} className="stars" aria-hidden="true">
      {shown.map(star => (
        <span
          key={star.id}
          className={`star${star.bright ? ' bright glow' : ''}${star.twinkle ? ' twinkle' : ''}${star.shimmer ? ' shimmer' : ''}`}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            color: star.color,
            '--tint': star.color,
            opacity: star.opacity,
            '--twinkle': `${star.duration}s`,
            '--shimmer': `${star.shimmerDuration}s`,
            '--delay': `${star.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default Stars
