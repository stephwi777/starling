import { useEffect, useRef } from 'react'
import SearchGlyph from '../ui/SearchGlyph.jsx'
import { submits } from './searchKeys.js'



// SEARCH BOX

function SearchBox({ query, setQuery, onSubmit }) {
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

    if (submits(event.nativeEvent, query)) {
      event.preventDefault()
      onSubmit?.()
    }
  }

  return (
    <label className="calendar-search">
      <span className="visually-hidden">Search events</span>
      <SearchGlyph />

      <input ref={input} type="search" placeholder="Search" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={keyDown} />

      {query && (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setQuery(''); input.current.focus() }}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
      )}
    </label>
  )
}

export default SearchBox
