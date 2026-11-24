import { useLayoutEffect } from 'react'
import { wordsHole } from './wordsHole.js'



// MEASURE

function measure(layer) {
  const scene = layer.closest('.sky-scene')
  const lines = scene?.querySelectorAll('.sky-content h1 > span:not(.visually-hidden), .sky-content p')

  if (!lines?.length) return

  const rects = [...lines].map(line => {
    const range = document.createRange()

    range.selectNodeContents(line)
    return range.getBoundingClientRect()
  })
  const hole = wordsHole(rects, scene.getBoundingClientRect())

  for (const edge of ['left', 'right', 'top', 'bottom']) layer.style.setProperty(`--words-${edge}`, `${hole[edge]}px`)
}



// HOOK

export function useWordsBox(layerRef) {
  useLayoutEffect(() => {
    const layer = layerRef.current
    const scene = layer?.closest('.sky-scene')

    if (!scene) return

    const place = () => measure(layer)
    const watcher = new ResizeObserver(place)

    place()
    document.fonts?.ready.then(place)
    watcher.observe(scene)

    return () => watcher.disconnect()
  }, [layerRef])

  useLayoutEffect(() => {
    if (layerRef.current?.closest('.sky-scene')) measure(layerRef.current)
  })
}
