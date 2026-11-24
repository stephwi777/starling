import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/reset.css'
import '../src/styles/theme.css'
import '../src/components/ui/ui.css'
import '../src/components/MotionToggle.css'
import '../src/pages/Tonight.css'
import SkyScene from '../src/components/sky/SkyScene.jsx'
import { skyLook } from '../src/sky/skyLook.js'



// CASES

const NIGHT = { sunAlt: -30, moonAlt: -10, moonLit: 0.02, moonAngle: 8, cloudCover: 5 }
const CRESCENT = { moonAlt: 25, moonLit: 0.22, moonAngle: 56 }
const HALF = { moonAlt: 30, moonLit: 0.5, moonAngle: 90 }
const BRIGHT = { moonAlt: 35, moonLit: 0.93, moonAngle: 160 }

const GROUPS = [
  {
    title: 'Clear nights',
    cases: [
      { id: 'clear', approved: true, title: 'Clear, no Moon', note: 'New Moon or the Moon is down. Every star shows.', line: 'Clear and dark from 6:45pm to 5:40am.', sky: NIGHT },
      { id: 'crescent', approved: true, title: 'Clear, crescent Moon up', note: 'The Moon is drawn in its real phase for the moment the sky shows.', line: 'Clear and dark from 9:10pm to 5:40am.', sky: { ...NIGHT, ...CRESCENT } },
      { id: 'half', approved: true, title: 'Clear, half Moon up', note: 'Still the clear sky.', line: 'Clear and dark from 12:30am to 5:40am.', sky: { ...NIGHT, ...HALF } },
      { id: 'moonlit', approved: true, title: 'Clear, bright Moon up', note: 'Changed: the sky is only a little brighter than a clear night, and only about a quarter of the stars fade.', line: 'Clear, but the Moon is up until 3:10am.', sky: { ...NIGHT, ...BRIGHT }, changed: true },
    ],
  },
  {
    title: 'Clouds',
    cases: [
      { id: 'few', approved: true, title: 'A few clouds', note: 'Changed: two clouds, one drifting near the Moon’s spot and one low on the left.', line: 'Clear and dark from 6:45pm to 5:40am.', sky: { ...NIGHT, cloudCover: 28 }, changed: true },
      { id: 'few-moon', approved: true, title: 'A few clouds, Moon up', note: 'New: the same two clouds with the Moon, so you can see how they meet.', line: 'Clear and dark from 12:30am to 5:40am.', sky: { ...NIGHT, ...HALF, cloudCover: 28 }, changed: true },
      { id: 'patchy', approved: true, title: 'Patchy clouds', note: 'Changed: four different clouds balanced around the words. On phones, three clouds gather in the top right with one long cloud low on the left.', line: 'Clear and dark between clouds, 11pm to 3am.', sky: { ...NIGHT, cloudCover: 55 }, changed: true },
      { id: 'patchy-moon', approved: true, title: 'Patchy clouds, bright Moon up', note: 'Changed: same balance, with the Moon and its glow.', line: 'Patchy clouds all night.', sky: { ...NIGHT, ...BRIGHT, cloudCover: 55 }, changed: true },
      { id: 'overcast', dropped: true, label: '9A', style: 'soft', title: 'Cloudy · softer banks', note: 'Changed: the three cloud banks with wider, gentler bumps, over a starless two-color gradient.', line: 'Cloudy all night.', sky: { ...NIGHT, cloudCover: 92 }, changed: true },
      { id: 'overcast-huge', approved: true, label: '9', style: 'huge', title: 'Cloudy', note: 'Changed: four giant clouds, partly off the edges, over a starless two-color gradient.', line: 'Cloudy all night.', sky: { ...NIGHT, cloudCover: 92 }, changed: true },
      { id: 'overcast-layered', dropped: true, label: '9C', style: 'layered', title: 'Cloudy · huge clouds, two layers', note: 'New: five giant clouds, a darker row behind a lighter row, over the same gradient.', line: 'Cloudy all night.', sky: { ...NIGHT, cloudCover: 92 }, changed: true },
      { id: 'overcast-moon', approved: true, title: 'Cloudy, Moon up', note: 'Changed: the Moon is hidden on cloudy nights.', line: 'Cloudy all night.', sky: { ...NIGHT, ...BRIGHT, cloudCover: 92 }, changed: true },
    ],
  },
  {
    title: 'Rain and snow',
    cases: [
      { id: 'rain', approved: true, title: 'Rain', note: 'Changed: drops fade out before the hills and around the words.', line: 'Rain likely until 2am, then clearing before dawn.', sky: { ...NIGHT, cloudCover: 95 }, fall: 'rain', changed: true },
      { id: 'snow', approved: true, title: 'Snow', note: 'Changed: always the six-armed flake from the snow icon, turning slowly as it drifts down, and fading out before the hills.', line: 'Snow likely all night.', sky: { ...NIGHT, cloudCover: 95 }, fall: 'snow', changed: true },
      { id: 'snow-shapes', dropped: true, title: 'Snow · flake shapes when paused', sky: NIGHT },
      { id: 'rain-moon', approved: true, title: 'Rain, Moon up', note: 'Changed: like cloudy nights, the Moon is hidden.', line: 'Rain likely until 2am, then clearing before dawn.', sky: { ...NIGHT, ...BRIGHT, cloudCover: 95 }, fall: 'rain', changed: true },
    ],
  },
  {
    title: 'Twilight',
    cases: [
      { id: 'dusk', approved: true, title: 'Evening twilight', note: 'Unchanged.', line: 'Clear and dark from 6:45pm to 5:40am.', sky: { ...NIGHT, ...CRESCENT, sunAlt: -5 } },
      { id: 'dusk-clouds', approved: true, title: 'Evening twilight with clouds', note: 'Changed: the new patchy clouds.', line: 'Clouds clear by 9pm, then dark until 5:40am.', sky: { ...NIGHT, sunAlt: -5, cloudCover: 55 }, changed: true },
      { id: 'dawn', approved: true, title: 'Morning twilight', note: 'Changed: its own colors, a touch warmer and rosier near the hills than dusk.', line: 'Clear and dark from 6:45pm to 5:40am.', sky: { ...NIGHT, sunAlt: -8 }, dawn: true, changed: true },
      { id: 'dawn-clouds', approved: true, title: 'Morning twilight with clouds', note: 'New: the warmer dawn with a few clouds.', line: 'Clouds clear by 9pm, then dark until 5:40am.', sky: { ...NIGHT, sunAlt: -8, cloudCover: 28 }, dawn: true, changed: true },
      { id: 'dusk-cloudy', title: 'Evening twilight, cloudy', note: 'New: the huge cloudy-night clouds in twilight shades over the dusk colors, with a soft glow under them near the hills. The Moon is hidden. Rain or snow at twilight uses this look too.', line: 'Cloudy all night.', sky: { ...NIGHT, ...BRIGHT, sunAlt: -5, cloudCover: 92 }, changed: true },
      { id: 'dawn-cloudy', title: 'Morning twilight, cloudy', note: 'New: the same, with the warmer dawn colors.', line: 'Cloudy all night.', sky: { ...NIGHT, sunAlt: -8, cloudCover: 92 }, dawn: true, changed: true },
      { id: 'white-night', approved: true, title: 'Never fully dark', note: 'Unchanged: far north in summer, the darkest point of the night, which is still twilight.', line: 'No full darkness tonight.', sky: { ...NIGHT, sunAlt: -9 } },
    ],
  },
  {
    title: 'Before the forecast',
    cases: [
      { id: 'loading', approved: true, title: 'Forecast loading or failed', note: 'Unchanged: a clear night with the real Moon. No guessed clouds.', line: 'Dark from 6:45pm to 5:40am.', sky: { ...NIGHT, ...HALF, cloudCover: null } },
    ],
  },
]

const CASES = GROUPS.flatMap(group => group.cases)



// LOOK

const DAWN = { top: 'var(--dawn-top)', middle: 'var(--dawn-middle)', low: 'var(--dawn-low)' }

const OVERCAST = { top: 'var(--overcast-top)', middle: 'color-mix(in srgb, var(--overcast-top), var(--overcast-low))', low: 'var(--overcast-low)' }

function lookFor(item) {
  const look = skyLook({ ...item.sky, isHome: false })
  const moonlit = look.name === 'moonlit'
  const stars = moonlit ? 1 - item.sky.moonLit * 0.25 : look.stars
  const overcast = look.name === 'overcast'
  const colors = item.dawn ? DAWN : overcast ? OVERCAST : look.colors

  return {
    ...look,
    moon: overcast || look.clouds === 3 ? null : look.moon,
    stars,
    clouds: 0,
    level: look.clouds,
    colors,
    snow: item.dawn ? 'var(--snow-dawn)' : look.snow,
  }
}



// CLOUDS

const SHAPES = {
  wide: [[38, 54, 16], [66, 42, 24], [104, 34, 30], [142, 44, 22], [170, 56, 14]],
  tall: [[44, 52, 18], [84, 32, 30], [122, 46, 22], [152, 58, 12]],
  long: [[33, 60, 10], [52, 52, 16], [84, 46, 20], [118, 50, 18], [146, 54, 16], [164, 60, 10]],
  hump: [[51, 55, 15], [80, 52, 18], [120, 38, 26], [152, 54, 16]],
  small: [[54, 56, 14], [86, 44, 22], [116, 56, 14]],
}

const SHADES = ['var(--cloud-1)', 'var(--cloud-2)', 'var(--cloud-3)', 'var(--cloud-4)', 'var(--cloud-front)', 'var(--cloud-deep)', 'var(--cloud-low)']

const LAYOUTS = {
  1: [
    { shape: 'wide', moon: { right: 10, top: 112 }, w: 22, phone: { right: 46, top: 2, w: 40, shade: 6 }, shade: 1 },
    { shape: 'hump', x: 10, y: 47, w: 17, phone: { x: 4, y: 20, w: 36, shade: 5 }, shade: 2, flip: true },
  ],
  2: [
    { shape: 'hump', x: 5, y: 3, w: 36, phone: { x: -10, y: 6, w: 62 }, shade: 0 },
    { shape: 'wide', moon: { right: -64, top: 80 }, w: 34, phone: { right: 22, top: 4, w: 50, shade: 6 }, shade: 1 },
    { shape: 'long', x: -1, y: 31, w: 35, phone: { x: -12, y: 62, w: 64 }, shade: 2, flip: true },
    { shape: 'small', x: 78, y: 42, w: 25, phone: { x: 44, y: 14, w: 44, shade: 1 }, shade: 3 },
  ],
}

const BANKS = [
  { top: 26, shade: 0, seed: 3, min: 260, max: 440 },
  { top: 42, shade: 2, seed: 5, min: 220, max: 380, front: true },
  { top: 57, shade: 4, seed: 9, min: 180, max: 320, front: true },
]

const HUGE = {
  huge: [
    { shape: 'tall', x: -12, y: 11, w: 64, shade: 1 },
    { shape: 'wide', x: 42, y: 6, w: 70, shade: 1, flip: true },
    { shape: 'long', x: -6, y: 25, w: 66, shade: 2, flip: true },
    { shape: 'hump', x: 52, y: 24, w: 58, shade: 2 },
  ],
  layered: [
    { shape: 'hump', x: -16, y: 6, w: 70, shade: 0, flip: true },
    { shape: 'tall', x: 28, y: 2, w: 66, shade: 0 },
    { shape: 'wide', x: 66, y: 8, w: 62, shade: 0, flip: true },
    { shape: 'long', x: -8, y: 30, w: 60, shade: 3 },
    { shape: 'wide', x: 46, y: 28, w: 62, shade: 3 },
  ],
}

function bankPath({ seed, min, max }) {
  const random = seeded(seed)
  let x = -random() * min
  let path = `M${x.toFixed(1)} 100`

  while (x < 1000) {
    const width = min + random() * (max - min)
    const radius = (width / 2) * (1.8 + random() * 1.6)

    x += width
    path += ` A${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 1 ${x.toFixed(1)} 100`
  }

  return `${path} Z`
}

function Deck() {
  return (
    <div className="deck" aria-hidden="true">
      {BANKS.map(bank => (
        <div key={bank.seed} className={bank.front ? 'bank front' : 'bank'} style={{ top: `${bank.top}%`, background: SHADES[bank.shade] }}>
          <svg viewBox="0 0 1000 100" preserveAspectRatio="xMidYMax meet">
            <path d={bankPath(bank)} fill={SHADES[bank.shade]} />
          </svg>
        </div>
      ))}
    </div>
  )
}

const BOTTOM = 70

function outline(bumps) {
  const [first, last] = [bumps[0], bumps.at(-1)]
  const start = first[0] - first[2]
  const end = last[0] + last[2]
  const steps = Math.ceil((end - start) / 0.5)
  const xs = Array.from({ length: steps + 1 }, (_, i) => Math.min(start + i * 0.5, end))
  const top = x => Math.min(...bumps.map(([cx, cy, r]) => (Math.abs(x - cx) <= r ? cy - Math.sqrt(r * r - (x - cx) ** 2) : Infinity)))
  const end_ = ([cx, cy, r], x) => Math.min(BOTTOM, cy + Math.sqrt(Math.max(r * r - (x - cx) ** 2, 0)))
  const bottom = x => (x < first[0] ? end_(first, x) : x > last[0] ? end_(last, x) : BOTTOM)
  const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`

  return `M${xs.map(x => point(x, top(x))).join(' L')} L${xs.toReversed().map(x => point(x, bottom(x))).join(' L')} Z`
}

const OUTLINES = Object.fromEntries(Object.entries(SHAPES).map(([name, bumps]) => [name, outline(bumps)]))

function Cloud({ shape, shade, flip }) {
  return (
    <svg viewBox="0 0 200 72" aria-hidden="true" style={flip ? { scale: '-1 1' } : undefined}>
      <path d={OUTLINES[shape]} style={{ fill: `var(--fill, ${SHADES[shade]})` }} />
    </svg>
  )
}

const PHONE_PATCHY = [
  { shape: 'wide', x: 34, y: 2, w: 70, shade: 0 },
  { shape: 'hump', x: 54, y: 15, w: 50, shade: 1 },
  { shape: 'small', x: 22, y: 20, w: 30, shade: 1 },
  { shape: 'long', x: -16, y: 62, w: 58, shade: 2, flip: true },
]

function PhoneOnly({ clouds }) {
  return clouds.map((cloud, i) => cloud.moon
    ? (
      <div key={`p${i}`} className="moon-anchor phone-only">
        <div style={{ '--dx': `${cloud.moon.right}px`, '--dy': `${cloud.moon.top}px`, '--w': `${cloud.w}cqw`, '--pdx': `${cloud.moon.right}px`, '--pdy': `${cloud.moon.top}px`, '--pw': `${cloud.w}cqw`, '--pfill': SHADES[cloud.shade] }}>
          <Cloud {...cloud} />
        </div>
      </div>
    )
    : (
      <div key={`p${i}`} className="placed phone-only" style={{ '--x': `${cloud.x}%`, '--y': `${cloud.y}%`, '--w': `${cloud.w}%`, '--px': `${cloud.x}%`, '--py': `${cloud.y}%`, '--pw': `${cloud.w}%`, '--pfill': SHADES[cloud.shade] }}>
        <Cloud {...cloud} />
      </div>
    ))
}

function SheetClouds({ level, style }) {
  if (!level) return null
  if (level === 3 && style === 'soft') return <Deck />

  if (level === 3) {
    return (
      <div className="sheet-clouds level-3" aria-hidden="true">
        <div className="canvas">
          {HUGE[style].map((cloud, i) => (
            <div key={i} style={{ left: `${cloud.x}%`, top: `${cloud.y}%`, width: `${cloud.w}%` }}>
              <Cloud {...cloud} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`sheet-clouds level-${level}${level === 2 ? ' variant' : ''}`} aria-hidden="true">
      {level === 2 && <PhoneOnly clouds={PHONE_PATCHY} />}
      {LAYOUTS[level].map((cloud, i) => cloud.moon
        ? (
          <div key={i} className="moon-anchor desk-only">
            <div style={{ '--dx': `${cloud.moon.right}px`, '--dy': `${cloud.moon.top - 96}px`, '--w': `${cloud.w}cqw`, '--pdx': `${cloud.phone.right}px`, '--pdy': `${cloud.phone.top}px`, '--pw': `${cloud.phone.w}cqw`, '--pfill': SHADES[cloud.phone.shade ?? cloud.shade] }}>
              <Cloud {...cloud} />
            </div>
          </div>
        )
        : (
          <div key={i} className="placed desk-only" style={{ '--x': `${cloud.x}%`, '--y': `${cloud.y}%`, '--w': `${cloud.w}%`, '--px': `${cloud.phone.x}%`, '--py': `${cloud.phone.y}%`, '--pw': `${cloud.phone.w}%`, '--pfill': SHADES[cloud.phone.shade ?? cloud.shade] }}>
            <Cloud {...cloud} />
          </div>
        ))}
    </div>
  )
}



// FALLING

const DROP = 'M0 -4.2 Q3.2 0 3.2 1.6 A3.2 3.2 0 0 1 -3.2 1.6 Q-3.2 0 0 -4.2 Z'
const FLAKE = 'M0 -3.6 V3.6 M-3.1 -1.8 L3.1 1.8 M-3.1 1.8 L3.1 -1.8'

function seeded(seed) {
  let value = seed

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function Piece({ kind, size }) {
  if (kind === 'rain') {
    return (
      <svg width={size} height={size * 1.3} viewBox="-3.6 -4.6 7.2 9.4">
        <path d={DROP} fill="var(--star-blue)" opacity="0.8" />
      </svg>
    )
  }

  return (
    <svg className="flake" width={size + 5} height={size + 5} viewBox="-4.4 -4.4 8.8 8.8">
      <path d={FLAKE} stroke="var(--frost)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function Falling({ kind }) {
  const random = seeded(kind === 'rain' ? 7 : 11)
  const count = kind === 'rain' ? 52 : 42

  return (
    <div className="falling" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const time = kind === 'rain' ? 1.2 + random() * 0.6 : 9 + random() * 5

        return (
          <span key={i} className="piece" style={{ left: `${random() * 100}%`, animationDuration: `${time}s`, animationDelay: `${-random() * time}s` }}>
            <span className="sway">
              <Piece kind={kind} size={5 + random() * 4} />
            </span>
          </span>
        )
      })}
    </div>
  )
}



// SKY

function useTextSpot(frame) {
  useLayoutEffect(() => {
    const place = () => {
      const scene = frame.current?.querySelector('.sky-scene')
      const text = frame.current?.querySelector('.band-text')

      if (!scene || !text) return

      const box = scene.getBoundingClientRect()

      frame.current.style.setProperty('--scene-h', `${box.height}px`)
      const words = [...text.querySelectorAll('h1 > span, .band-line')].map(node => {
        const range = document.createRange()

        range.selectNodeContents(node)
        return range.getBoundingClientRect()
      })
      const left = Math.min(...words.map(rect => rect.left))
      const right = Math.max(...words.map(rect => rect.right))
      const top = Math.min(...words.map(rect => rect.top))
      const bottom = Math.max(...words.map(rect => rect.bottom))

      frame.current.style.setProperty('--text-x', `${(left + right) / 2 - box.left}px`)
      frame.current.style.setProperty('--text-y', `${(top + bottom) / 2 - box.top}px`)
      frame.current.style.setProperty('--text-w', `${(right - left) / 2 + 40}px`)
      frame.current.style.setProperty('--text-h', `${(bottom - top) / 2 + 34}px`)
    }

    place()
    document.fonts?.ready.then(place)

    const watcher = new ResizeObserver(place)

    watcher.observe(frame.current)
    return () => watcher.disconnect()
  }, [frame])
}

function Sky({ item, cloudy }) {
  const frame = useRef(null)
  const look = lookFor(item)

  useTextSpot(frame)

  return (
    <div className={`frame look-${look.name}`} ref={frame}>
      <SkyScene look={look} size="band" decor={<><SheetClouds level={look.level} style={item.style ?? cloudy} />{item.fall && <Falling kind={item.fall} />}</>}>
        <div className="band-text">
          <h1>
            <span className="band-title">Kansas City</span>
            <span>Monday, November 23</span>
          </h1>
          <p className="band-line">{item.line}</p>
        </div>
      </SkyScene>
    </div>
  )
}



// SWITCHES

const params = new URLSearchParams(location.search)

function useRootState(light, still) {
  useEffect(() => {
    document.documentElement.dataset.light = light ? 'red' : 'normal'
    document.documentElement.classList.toggle('still', still)
  }, [light, still])
}

function Switch({ on, set, children }) {
  return <button type="button" aria-pressed={on} onClick={() => set(!on)}>{children}</button>
}

const ORDER = ['clear', 'crescent', 'half', 'moonlit', 'few', 'few-moon', 'patchy', 'patchy-moon', 'overcast', 'overcast-moon', 'rain', 'snow', 'snow-shapes', 'rain-moon', 'dusk', 'dusk-clouds', 'dawn', 'dawn-clouds', 'white-night', 'loading', 'dusk-cloudy', 'dawn-cloudy']

const number = item => item.label ?? ORDER.indexOf(item.id) + 1



// SHEET

function Sheet() {
  const [phone, setPhone] = useState(false)
  const [light, setLight] = useState(false)
  const [still, setStill] = useState(false)
  const cloudy = 'huge'
  const query = `${light ? '&light=red' : ''}${still ? '&still=1' : ''}`

  useRootState(light, still)

  return (
    <main className={`sheet${phone ? ' phone-mode' : ''}`}>
      <h1>Tonight sky looks</h1>
      <p>All 19 looks are approved for desktop. Next: check each one with Phone size and Red light. Numbers stay the same as in the earlier rounds. The sentence under the place name is sample text.</p>

      <div className="switches">
        <Switch on={phone} set={setPhone}>Phone size</Switch>
        <Switch on={light} set={setLight}>Red light</Switch>
        <Switch on={still} set={setStill}>Pause animations</Switch>
      </div>

      {GROUPS.filter(group => group.cases.some(item => !item.dropped)).map(group => (
        <section key={group.title} className="group">
          <h2>{group.title}</h2>
          <div className="looks">
            {group.cases.filter(item => !item.dropped).map((item, i) => (
              <div key={item.id} className="look">
                <h3>
                  {number(item)} · {item.title}
                  {!item.approved && item.changed && <em>{item.note.startsWith('New') ? 'New' : 'Changed'}</em>}
                </h3>
                <p>{item.note.replace(/^(Changed|New): (.)/, (_, label, first) => first.toUpperCase())}</p>
                {phone
                  ? <iframe className="phone-frame" title={item.title} src={`?case=${item.id}${query}`} loading={i < 2 ? 'eager' : 'lazy'} />
                  : <Sky item={item} cloudy={cloudy} />}
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}

function Bare({ item }) {
  useRootState(params.get('light') === 'red', params.has('still'))

  return <div className="bare"><Sky item={item} cloudy="huge" /></div>
}

const single = CASES.find(item => item.id === params.get('case'))

createRoot(document.getElementById('root')).render(single ? <Bare item={single} /> : <Sheet />)
