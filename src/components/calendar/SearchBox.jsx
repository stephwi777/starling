import { useEffect, useRef } from 'react'



// SEARCH BOX

function SearchBox({ query, setQuery }) {
  const input = useRef(null)

  useEffect(() => {
    const slash = event => {
      const typing = event.target.closest?.('input, textarea, select, [contenteditable]')

      if (event.key !== '/' || typing || event.metaKey || event.ctrlKey || event.altKey) return

      event.preventDefault()
      input.current.focus()
    }

    document.addEventListener('keydown', slash)

    return () => document.removeEventListener('keydown', slash)
  }, [])

  function keyDown(event) {
    if (event.key === 'Escape' && query) {
      event.preventDefault()
      setQuery('')
    }
  }

  return (
    <label className="calendar-search">
      <span className="visually-hidden">Search events</span>
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M13 13 L17 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>

      <input ref={input} type="search" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={keyDown} />

      {query && (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setQuery(''); input.current.focus() }}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
        </button>
      )}
    </label>
  )
}

export default SearchBox
