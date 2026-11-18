// METEOR KIND

export function meteorKind(roll) {
  if (roll < 0.8) return 'streak'
  if (roll < 0.9) return 'fireball'

  return 'fireball burst'
}
