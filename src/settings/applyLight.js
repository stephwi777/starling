// APPLY LIGHT

export function applyLight(root, light) {
  if (root.dataset.light === light) return

  root.classList.add('switching')
  root.dataset.light = light
  root.getBoundingClientRect()
  root.classList.remove('switching')
}
