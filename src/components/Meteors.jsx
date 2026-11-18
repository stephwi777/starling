import { useEffect, useState } from 'react'
import { meteorKind } from './meteorKind.js'
import './Meteors.css'



// COLORS

const palettes = [
  { head: 'var(--teal)', tail: '#8f86d6' },
  { head: 'var(--beak)', tail: 'var(--bronze)' },
  { head: 'var(--snow)', tail: 'var(--teal)' },
  { head: 'var(--moon)', tail: 'var(--snow)' },
]

const tints = [
  { head: 'var(--frost)', tail: 'var(--meteor-teal)' },
  { head: 'var(--frost)', tail: 'var(--meteor-rose)' },
  { head: 'var(--frost)', tail: 'var(--meteor-lilac)' },
  { head: 'var(--moon)', tail: 'var(--meteor-gold)' },
]

const sparks = [
  { x: 22, y: -14 },
  { x: 28, y: 7 },
  { x: 11, y: 21 },
  { x: -3, y: -21 },
  { x: 34, y: -4 },
]



// METEOR

function makeMeteor(id) {
  const kind = meteorKind(Math.random())
  const colors = kind.startsWith('fireball') ? tints : palettes

  return {
    id,
    fireball: kind.startsWith('fireball'),
    burst: kind.endsWith('burst'),
    top: Math.random() * 45,
    left: 25 + Math.random() * 70,
    ...colors[Math.floor(Math.random() * colors.length)],
  }
}



// METEORS

function Meteors() {
  const [meteor, setMeteor] = useState(null)

  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    let count = 0
    let timer

    const schedule = () => {
      const wait = count === 0 ? 6000 + Math.random() * 6000 : 20000 + Math.random() * 20000

      timer = setTimeout(() => {
        const paused = document.documentElement.classList.contains('still')

        if (!calm.matches && !paused && !document.hidden) {
          count += 1
          setMeteor(makeMeteor(count))
        }
        schedule()
      }, wait)
    }

    schedule()

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="meteors" aria-hidden="true">
      {meteor && (
        <span
          key={meteor.id}
          className={meteor.fireball ? 'meteor fireball' : 'meteor'}
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            '--head': meteor.head,
            '--tail': meteor.tail,
          }}
        >
          <span className="flight">
            <span className="tail"></span>
            {meteor.fireball ? <span className="flare"></span> : <span className="head"></span>}
          </span>

          {meteor.burst && sparks.map((spark, i) => (
            <span key={i} className="spark" style={{ '--x': `${spark.x}px`, '--y': `${spark.y}px` }}></span>
          ))}
        </span>
      )}
    </div>
  )
}

export default Meteors
