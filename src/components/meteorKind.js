// METEOR KIND

export function meteorKind(roll) {
  if (roll < 0.48) return 'meteor'
  if (roll < 0.8) return 'meteor burst'
  if (roll < 0.9) return 'fireball'

  return 'fireball burst'
}
