import { useRef } from 'react'
import { DROP, FLAKE } from '../ui/icons.jsx'
import { fallPieces } from './fallPieces.js'
import { useWordsBox } from './useWordsBox.js'
import './Falling.css'



// PIECE

function Piece({ kind, size }) {
  if (kind === 'rain') {
    return (
      <svg width={size} height={size * 1.3} viewBox="-3.6 -4.6 7.2 9.4">
        <path d={DROP} fill="var(--star-blue)" opacity="0.8" />
      </svg>
    )
  }

  return (
    <svg className="flake" width={size} height={size} viewBox="-4.4 -4.4 8.8 8.8">
      <path d={FLAKE} stroke="var(--frost)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}



// FALLING

function Falling({ kind }) {
  const layer = useRef(null)

  useWordsBox(layer)

  return (
    <div className="falling" ref={layer} aria-hidden="true">
      {fallPieces(kind).map((piece, i) => (
        <span key={i} style={{ left: `${piece.left}%`, animationDuration: `${piece.duration}s`, animationDelay: `${piece.delay}s` }}>
          <Piece kind={kind} size={piece.size} />
        </span>
      ))}
    </div>
  )
}

export default Falling
