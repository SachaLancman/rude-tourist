import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Logo } from './Logo'
import { PHRASE_BY_ID, type Lang } from './phrases'

// Insults in every language slap onto the screen like luggage stickers around the logo.
const STICKERS: { lang: Lang; id: string; top: number; left: number; tilt: number }[] = [
  { lang: 'es', id: 'shut-up', top: 7, left: 4, tilt: -8 },
  { lang: 'ja', id: 'shut-up', top: 12, left: 60, tilt: 6 },
  { lang: 'it', id: 'lake', top: 24, left: -6, tilt: 5 },
  { lang: 'fr', id: 'clown', top: 27, left: 64, tilt: -6 },
  { lang: 'de', id: 'jerk', top: 70, left: 2, tilt: 6 },
  { lang: 'el', id: 'get-lost', top: 74, left: 58, tilt: -7 },
  { lang: 'pt', id: 'jerk', top: 85, left: 16, tilt: 3 },
  { lang: 'tr', id: 'clown', top: 88, left: 62, tilt: 9 },
  { lang: 'nl', id: 'get-lost', top: 2, left: 34, tilt: 3 },
  { lang: 'pl', id: 'lake', top: 94, left: 36, tilt: -4 },
]

const HOLD_MS = 2450

export function Intro({ tagline, onDone }: { tagline: string; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onDone()
  }

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), HOLD_MS)
    return () => clearTimeout(timer)
  }, [])

  // The slide-out normally ends with animationend; this timer closes the intro anyway
  // when the browser throttles or skips animations (background tab, battery saver).
  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(finish, 650)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving])

  return (
    <div
      className={`intro${leaving ? ' leaving' : ''}`}
      onClick={() => setLeaving(true)}
      onAnimationEnd={(e) => e.target === e.currentTarget && leaving && finish()}
      role="presentation"
    >
      {STICKERS.map((s, i) => (
        <span
          key={i}
          className={`sticker tone-${i % 4}`}
          style={{ top: `${s.top}%`, left: `${s.left}%`, '--tilt': `${s.tilt}deg`, '--i': i } as CSSProperties}
          aria-hidden="true"
        >
          {PHRASE_BY_ID.get(s.id)?.text[s.lang]}
        </span>
      ))}
      <div className="intro-center">
        <Logo size={164} animate />
        <h1 className="intro-title">
          <span className="w1">Rude</span> <em className="w2">tourist.</em>
        </h1>
        <p className="intro-tagline">{tagline}</p>
      </div>
    </div>
  )
}
