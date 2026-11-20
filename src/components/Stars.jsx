import { useEffect, useRef, useState } from 'react'
import { moonDimming, visibleStars } from './starField.js'
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
    twinkle: !bright && Math.random() < 0.12,
    glow: bright && Math.random() < 0.5,
    shimmer: Math.random() < 0.15,
    duration: Math.random() * 4 + 4,
    shimmerDuration: Math.random() * 3 + 3,
    delay: Math.random() * 8,
  }
})



// FLARES

const FLARE = 1500
const GAP = [1500, 3000]
const PAIR = 0.3
const PAIR_GAP = [500, 900]

const between = ([low, high]) => low + Math.random() * (high - low)

function useFlares(ref, shown) {
  useEffect(() => {
    const field = ref.current
    const calm = matchMedia('(prefers-reduced-motion: reduce)')
    const pool = shown.flatMap((star, i) => (star.size > 1.5 ? [i] : []))
    const timers = new Set()

    if (!pool.length) return

    const later = (wait, task) => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        task()
      }, wait)

      timers.add(timer)
    }

    const flare = () => {
      const star = field.children[pool[Math.floor(Math.random() * pool.length)]]

      star.classList.add('bloom')
      later(FLARE, () => star.classList.remove('bloom'))
    }

    const schedule = () => later(between(GAP), () => {
      const paused = document.documentElement.classList.contains('still')

      if (!calm.matches && !paused && !document.hidden) {
        flare()
        if (Math.random() < PAIR) later(between(PAIR_GAP), flare)
      }

      schedule()
    })

    schedule()

    return () => {
      timers.forEach(clearTimeout)
      field.querySelectorAll('.bloom').forEach(star => star.classList.remove('bloom'))
    }
  }, [ref, shown])
}



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

  const moon = field.parentElement.querySelector('.moon')?.getBoundingClientRect()

  return {
    size: { width: origin.width, height: origin.height },
    boxes,
    moon: moon && {
      x: moon.left + moon.width / 2 - origin.left,
      y: moon.top + moon.height / 2 - origin.top,
      radius: moon.width / 2,
    },
  }
}



// FIELD

function Stars({ amount = 1 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState([])

  useFlares(ref, shown)

  useEffect(() => {
    const field = ref.current
    let active = true

    const update = () => {
      if (!active) return

      const { size, boxes, moon } = measure(field)

      setShown(visibleStars(stars, size, boxes, amount).map(star => ({
        ...star,
        opacity: star.opacity * moonDimming((star.left / 100) * size.width, (star.top / 100) * size.height, moon),
      })))
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
          className={`star${star.bright ? ' bright' : ''}${star.glow ? ' glow' : ''}${star.twinkle ? ' twinkle' : ''}${star.shimmer ? ' shimmer' : ''}`}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            color: star.color,
            '--tint': star.color,
            opacity: star.opacity,
            '--base': star.opacity,
            '--size': `${star.size}px`,
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
