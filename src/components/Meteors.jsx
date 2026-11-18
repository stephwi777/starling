import { useEffect, useState } from 'react'
import { meteorKind } from './meteorKind.js'
import './Meteors.css'



// COLORS

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
  return {
    id,
    kind: meteorKind(Math.random()),
    top: Math.random() * 45,
    left: 25 + Math.random() * 70,
    ...tints[Math.floor(Math.random() * tints.length)],
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
          className={`meteor ${meteor.kind}`}
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            '--head': meteor.head,
            '--tail': meteor.tail,
          }}
        >
          <span className="flight">
            <span className="tail"></span>
            {meteor.kind === 'streak' ? <span className="head"></span> : <span className="flare"></span>}
          </span>

          {meteor.kind === 'fireball burst' && sparks.map((spark, i) => (
            <span key={i} className="spark" style={{ '--x': `${spark.x}px`, '--y': `${spark.y}px` }}></span>
          ))}
        </span>
      )}
    </div>
  )
}

export default Meteors
