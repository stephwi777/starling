import { Dot, Spark, TINTS, scatter, seeded } from './parts.jsx'



// REAL STARS

function Pleiades({ members }) {
  const stars = members.filter(([, , mag]) => mag < 5.6)

  return (
    <>
      {stars.slice(0, 5).map(([x, y], i) => <Dot key={`g${i}`} x={x} y={y} r={3.6} fill="var(--meteor-teal)" opacity={0.16} />)}
      {stars.map(([x, y, mag], i) => (mag < 4.4
        ? <Spark key={i} x={x} y={y} s={mag < 3.2 ? 0.4 : 0.32} fill="var(--star-teal)" />
        : <Dot key={i} x={x} y={y} r={0.85} fill="var(--star-teal)" />))}
    </>
  )
}

function Hyades({ members }) {
  const [a, theta, , gamma, delta, epsilon] = members
  const v = [a, theta, gamma, delta, epsilon].map(([x, y]) => `${x} ${y}`).join(' L')

  return (
    <>
      <path d={`M${v}`} fill="none" stroke="var(--snow)" strokeWidth="0.9" opacity="0.5" strokeLinejoin="round" />
      <RealStars members={members} />
    </>
  )
}

function RealStars({ members }) {
  return members.map(([x, y, mag, tint], i) => (mag < 4.2
    ? <Spark key={i} x={x} y={y} s={mag < 1.5 ? 0.42 : 0.32} fill={TINTS[tint] ?? 'var(--frost)'} />
    : <Dot key={i} x={x} y={y} r={Math.max(1, Math.min(1.9, 2.8 - 0.3 * mag))} fill={TINTS[tint] ?? 'var(--frost)'} />))
}



// SHAPES

const CLUSTER_COLORS = ['var(--frost)', 'var(--frost)', 'var(--star-icy)', 'var(--star-warm)']

function StarCloud({ id }) {
  const rand = seeded(id)
  const specks = Array.from({ length: 46 }, () => [(rand() - 0.5) * 20, (rand() - 0.5) * 16, 0.45 + rand() * 0.55, 0.4 + rand() * 0.6])

  return (
    <>
      <Dot r={10.5} fill="var(--snow)" opacity={0.14} />
      {specks.map(([x, y, r, opacity], i) => <Dot key={i} x={x} y={y} r={r} fill="var(--frost)" opacity={opacity} />)}
    </>
  )
}

function DoubleCluster() {
  return ['C14a', 'C14b'].flatMap((seed, side) => scatter(seed, 9, 4.3, [0.6, 1.4]).map(([x, y, r], i) => (
    <Dot key={`${seed}${i}`} x={x + (side ? 5.3 : -5.3)} y={y} r={r} fill={i % 2 ? 'var(--star-icy)' : 'var(--frost)'} />
  )))
}

const SMALL_GROUP = [[-4, -4], [3, -5], [0, 1], [2, 6]]



// CLUSTER ICON

export function ClusterIcon({ object }) {
  if (object.id === 'M45' && object.members) return <Pleiades members={object.members} />
  if (object.id === 'C41' && object.members) return <Hyades members={object.members} />
  if (object.members) return <RealStars members={object.members} />
  if (object.id === 'C14') return <DoubleCluster />
  if (object.type === 'cloud') return <StarCloud id={object.id} />
  if (object.type === 'asterism') return SMALL_GROUP.map(([x, y]) => <Dot key={`${x}${y}`} x={x} y={y} r={1.7} fill="var(--frost)" />)

  return scatter(object.id, 9, 9.6, [0.85, 2.1]).map(([x, y, r], i) => <Dot key={i} x={x} y={y} r={r} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />)
}



// GLOBULAR ICON

export function GlobularIcon({ object }) {
  const rand = seeded(object.id)
  const stars = Array.from({ length: 34 }, () => {
    const r = 2.5 + Math.pow(rand(), 1.6) * 8
    const a = rand() * Math.PI * 2

    return [r * Math.cos(a), r * Math.sin(a), 0.55 + rand() * 0.55, 1 - r / 13]
  })

  return (
    <>
      <Dot r={10.5} fill="var(--moon)" opacity={0.12} />
      <Dot r={7} fill="var(--moon)" opacity={0.2} />
      {stars.map(([x, y, r, opacity], i) => <Dot key={i} x={x} y={y} r={r} fill="var(--moon)" opacity={opacity} />)}
      <Dot r={3.4} fill="var(--moon)" />
      <Dot r={1.8} fill="var(--frost)" />
    </>
  )
}
