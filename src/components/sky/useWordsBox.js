import { useLayoutEffect } from 'react'



// MEASURE

function measure(layer) {
  const scene = layer.closest('.sky-scene')
  const lines = scene?.querySelectorAll('.sky-content h1 > span:not(.visually-hidden), .sky-content p')

  if (!lines?.length) return

  const box = scene.getBoundingClientRect()
  const rects = [...lines].map(line => {
    const range = document.createRange()

    range.selectNodeContents(line)
    return range.getBoundingClientRect()
  })
  const left = Math.min(...rects.map(rect => rect.left))
  const right = Math.max(...rects.map(rect => rect.right))
  const top = Math.min(...rects.map(rect => rect.top))
  const bottom = Math.max(...rects.map(rect => rect.bottom))

  layer.style.setProperty('--words-x', `${(left + right) / 2 - box.left}px`)
  layer.style.setProperty('--words-y', `${(top + bottom) / 2 - box.top}px`)
  layer.style.setProperty('--words-w', `${(right - left) / 2 + 40}px`)
  layer.style.setProperty('--words-h', `${(bottom - top) / 2 + 34}px`)
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
