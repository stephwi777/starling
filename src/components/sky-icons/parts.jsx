import { useId } from 'react'
import { sparkPath } from './shapes.js'



// DOT

export function Dot({ x = 0, y = 0, r, fill, opacity }) {
  return <circle cx={x} cy={y} r={r} fill={fill} opacity={opacity} />
}



// SPARK

export function Spark({ x = 0, y = 0, s, fill }) {
  return <path d={sparkPath(s)} transform={`translate(${x} ${y})`} fill={fill} />
}



// CLIPPED

export function Clipped({ shape, children }) {
  const id = useId()

  return (
    <>
      <defs><clipPath id={id}>{shape}</clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  )
}
