import { useEffect, useRef } from 'react'



// SETTINGS

const GAP = 12
const BAR = 44



// HELPERS

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value))
}

function stickLine() {
  const header = document.querySelector('.header')
  const fixed = header && getComputedStyle(header).position === 'fixed'

  return (fixed ? header.getBoundingClientRect().bottom : 0) + GAP
}

function update(container) {
  const line = stickLine()
  let stuck = false

  container.style.setProperty('--stick', `${line}px`)

  container.querySelectorAll('.card, .tile').forEach(section => {
    const head = section.querySelector(':scope > .card-head, :scope > h2')

    section.style.translate = 'none'
    head.style.translate = 'none'

    const box = section.getBoundingClientRect()
    const natural = head.getBoundingClientRect().top
    const pad = parseFloat(getComputedStyle(section).paddingTop)
    const below = parseFloat(getComputedStyle(head).paddingBottom)
    const tall = head.offsetHeight
    const full = 2 * pad + tall
    const showing = box.bottom - line
    const hold = clamp(BAR - showing, 0, BAR)
    const cut = clamp(line - box.top - hold, 0, box.height)
    const leave = 1 - hold / BAR
    const shrink = clamp((full - showing) / (full - BAR), 0, 1)
    const parked = line + (BAR - (tall - below)) / 2
    const lower = shrink > 0 ? line + pad + (parked - line - pad) * shrink - natural - hold : 0
    let appear = 1

    if (head.hasAttribute('data-appear')) {
      const summary = head.nextElementSibling
      const reach = Math.max(1, summary.nextElementSibling.offsetTop - summary.offsetTop - tall)
      const swap = reach * 0.6

      summary.style.opacity = 1 - clamp(cut / swap, 0, 1)
      appear = clamp((cut - swap) / (reach - swap), 0, 1)
    }

    section.style.setProperty('--cut', `${cut}px`)
    section.style.setProperty('--pad', `${pad}px`)
    section.style.setProperty('--half', `${Math.min(showing + hold, box.height) / 2}px`)
    section.style.setProperty('--side', getComputedStyle(section).paddingLeft)
    section.style.opacity = leave
    section.style.translate = `0 ${hold}px`
    head.style.opacity = appear
    head.style.translate = `0 ${lower}px`
    if (cut > 0) stuck = true
  })

  container.querySelector('.veil').style.opacity = stuck ? 1 : 0
}



// STICKY HEADS

function useStickyHeads() {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    let frame = 0

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => update(container))
    }

    update(container)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return ref
}

export default useStickyHeads
