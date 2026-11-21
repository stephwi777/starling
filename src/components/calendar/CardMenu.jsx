import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'



// CARD MENU

function CardMenu({ items }) {
  const [open, setOpen] = useState(false)
  const button = useRef(null)
  const menu = useRef(null)

  function close() {
    setOpen(false)
    button.current.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!open) return

    menu.current.querySelector('[role="menuitem"]')?.focus({ preventScroll: true })

    const outside = pointer => {
      if (!menu.current.contains(pointer.target) && !button.current.contains(pointer.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', outside)

    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  function keyDown(event) {
    const all = [...menu.current.querySelectorAll('[role="menuitem"]')]
    const index = all.indexOf(document.activeElement)
    const go = {
      ArrowDown: all[(index + 1) % all.length],
      ArrowUp: all[(index - 1 + all.length) % all.length],
      Home: all[0],
      End: all.at(-1),
    }[event.key]

    if (go) {
      event.preventDefault()
      go.focus()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.nativeEvent.stopPropagation()
      close()
    }

    if (event.key === 'Tab') setOpen(false)
  }

  function choose(item) {
    close()
    item.onSelect?.()
  }

  return (
    <div className="card-menu">
      <button
        ref={button}
        type="button"
        className="card-menu-button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(now => !now)}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <circle cx="3" cy="8" r="1.7" fill="currentColor" />
          <circle cx="8" cy="8" r="1.7" fill="currentColor" />
          <circle cx="13" cy="8" r="1.7" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div ref={menu} className="card-menu-list" role="menu" aria-label="More options" onKeyDown={keyDown}>
          {items.map(item => (item.to
            ? <Link key={item.label} role="menuitem" tabIndex={-1} to={item.to} onClick={() => setOpen(false)}>{item.label}</Link>
            : <button key={item.label} type="button" role="menuitem" tabIndex={-1} onClick={() => choose(item)}>{item.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CardMenu
