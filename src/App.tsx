import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Intro } from './Intro'
import { Logo } from './Logo'
import { Paywall } from './Paywall'
import { IS_PRO, isLocked, markPaywallSeen, paywallSeenThisOpen } from './pro'
import {
  CATEGORIES, DEFAULT_BOARD, HOME_LANGS, LANGS, MAX_BOARD, PHRASES, PHRASE_BY_ID,
  type Category, type HomeLang, type Lang, type Phrase,
} from './phrases'
import { SKINS, applySkin, loadSkin, type Skin } from './skins'
import { playPhrase, stopSpeaking } from './speech'
import './App.css'

// Small tilts so board tiles sit like stickers slapped on a suitcase, not a spreadsheet.
const TILTS = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.9, 1.5, -1.9]

const BURST: Record<Category, string[]> = {
  insult: ['⚡', '★', '!', '#', '@', '$', '%', '✱'],
  basic: ['✓', '✈', '☀', '♥', '★', '✓', '☺', '✱'],
  taxi: ['$', '!', '⚡', '€', '?', '!', '$', '✱'],
  food: ['♨', '★', '!', '♥', '✱', '★', '♨', '!'],
  night: ['♪', '★', '♥', '✱', '♫', '★', '♪', '!'],
}

// Small mark in each tile's corner, and on the library chips.
const CAT_MARK: Record<Category, string> = { insult: '#@!', basic: '✓', taxi: '🚕', food: '🍝', night: '🍸' }

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// A short tap on phones that support it (Android). iOS Safari ignores it.
function buzz() {
  try {
    navigator.vibrate?.(10)
  } catch {
    // Not supported: silent.
  }
}

const style = (vars: Record<string, string | number>) => vars as CSSProperties

interface Settings {
  home: HomeLang
  target: Lang
  board: string[]
}

const STORAGE_KEY = 'phrase-board/v1'

function loadSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Settings
    if (!HOME_LANGS.includes(s.home) || !(s.target in LANGS)) return null
    return { ...s, board: s.board.filter((id) => PHRASE_BY_ID.has(id)).slice(0, MAX_BOARD) }
  } catch {
    return null
  }
}

function saveSettings(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // Private mode or blocked storage: the app still works for this visit.
  }
}

const UI = {
  en: {
    tagline: 'Say it like a local.',
    iSpeak: 'I speak',
    goingTo: "I'm going to speak",
    start: 'Open my board',
    board: 'My board',
    library: 'Phrase library',
    edit: 'Edit',
    done: 'Done',
    empty: 'Your board is empty. Add phrases from the library.',
    insult: 'Insults',
    basic: 'Survival',
    taxi: 'Taxi',
    food: 'Restaurant',
    night: 'Nightlife',
    look: 'Look',
    add: 'Add',
    remove: 'Remove',
    full: `Board full (${MAX_BOARD} max)`,
    sayIt: 'Say it',
    slow: 'Slowly',
    practice: 'Practice',
    listen: 'Listen…',
    yourTurn: 'Your turn!',
    stop: 'Stop',
    soundsLike: 'Sounds like',
    noVoice: 'No voice for this language on your device. Show the screen instead.',
    change: 'Change',
  },
  fr: {
    tagline: 'Parle comme un local.',
    iSpeak: 'Je parle',
    goingTo: 'Je veux parler',
    start: 'Ouvrir mon tableau',
    board: 'Mon tableau',
    library: 'Bibliothèque',
    edit: 'Modifier',
    done: 'Terminé',
    empty: 'Ton tableau est vide. Ajoute des phrases depuis la bibliothèque.',
    insult: 'Insultes',
    basic: 'Survie',
    taxi: 'Taxi',
    food: 'Restaurant',
    night: 'Soirée',
    look: 'Style',
    add: 'Ajouter',
    remove: 'Retirer',
    full: `Tableau plein (${MAX_BOARD} max)`,
    sayIt: 'Le dire',
    slow: 'Lentement',
    practice: 'Entraînement',
    listen: 'Écoute…',
    yourTurn: 'À toi !',
    stop: 'Stop',
    soundsLike: 'Se prononce',
    noVoice: "Pas de voix pour cette langue sur ton appareil. Montre l'écran à la place.",
    change: 'Changer',
  },
} satisfies Record<HomeLang, Record<string, string>>

type Screen = 'setup' | 'board' | 'library'

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(loadSettings)
  const [screen, setScreen] = useState<Screen>(settings ? 'board' : 'setup')
  const [open, setOpen] = useState<Phrase | null>(null)
  const [intro, setIntro] = useState(() => !prefersReducedMotion())
  const [skin, setSkin] = useState<Skin>(loadSkin)
  const [picking, setPicking] = useState(false)
  // Returning users see the paywall once per app open; new users see it right after setup.
  const [paywall, setPaywall] = useState(() => !!settings && !IS_PRO && !paywallSeenThisOpen())

  useEffect(() => {
    if (settings) saveSettings(settings)
  }, [settings])

  useEffect(() => applySkin(skin), [skin])

  useEffect(() => {
    if (paywall) markPaywallSeen()
  }, [paywall])

  const introHome: HomeLang = settings?.home ?? (navigator.language.startsWith('fr') ? 'fr' : 'en')
  const introLayer = intro && <Intro tagline={UI[introHome].tagline} onDone={() => setIntro(false)} />
  const showPaywall = () => !IS_PRO && setPaywall(true)

  if (!settings || screen === 'setup') {
    return (
      <>
        <Setup
          initial={settings}
          skin={skin}
          onSkin={setSkin}
          onDone={(home, target) => {
            setSettings({ home, target, board: settings?.board ?? DEFAULT_BOARD })
            setScreen('board')
            if (!settings) showPaywall() // first setup = end of onboarding
          }}
        />
        {introLayer}
      </>
    )
  }

  const t = UI[settings.home]
  const toggle = (id: string) =>
    setSettings((s) => {
      if (!s) return s
      if (s.board.includes(id)) return { ...s, board: s.board.filter((b) => b !== id) }
      if (s.board.length >= MAX_BOARD) return s
      return { ...s, board: [...s.board, id] }
    })

  return (
    <div className="app">
      <header className="top">
        <div className="top-row">
          <button className="lang-chip" onClick={() => setScreen('setup')} aria-label={t.change}>
            <span>{LANGS[settings.home].flag}</span>
            <span className="arrow">→</span>
            <span>{LANGS[settings.target].flag}</span>
            <span className="lang-chip-name">{LANGS[settings.target].name[settings.home]}</span>
          </button>
          <button className="look-btn" onClick={() => setPicking(true)} aria-label={t.look}>
            <SwatchDots colors={SKINS.find((s) => s.id === skin)!.swatch} />
            {t.look}
          </button>
        </div>
        <nav className="tabs">
          <button className={screen === 'board' ? 'on' : ''} onClick={() => setScreen('board')}>{t.board}</button>
          <button className={screen === 'library' ? 'on' : ''} onClick={() => setScreen('library')}>{t.library}</button>
        </nav>
        <Ticker target={settings.target} />
      </header>

      {screen === 'board' ? (
        <Board
          key="board"
          settings={settings}
          onOpen={(p) => (isLocked(p) ? showPaywall() : setOpen(p))}
          onLibrary={() => setScreen('library')}
        />
      ) : (
        <Library key="library" settings={settings} onToggle={toggle} onLocked={showPaywall} />
      )}

      {open && <PhraseCard phrase={open} settings={settings} onLocked={showPaywall} onClose={() => { stopSpeaking(); setOpen(null) }} />}
      {picking && (
        <div className="overlay" onClick={() => setPicking(false)}>
          <div className="card" role="dialog" aria-modal="true" aria-label={t.look} onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPicking(false)} aria-label="Close">×</button>
            <h2>{t.look}</h2>
            <SkinPicker home={settings.home} skin={skin} onSkin={setSkin} />
          </div>
        </div>
      )}
      {paywall && <Paywall home={settings.home} onClose={() => setPaywall(false)} />}
      {introLayer}
    </div>
  )
}

function SwatchDots({ colors }: { colors: string[] }) {
  return (
    <span className="swatch-dots" aria-hidden="true">
      {colors.map((c, i) => <i key={i} style={{ background: c }} />)}
    </span>
  )
}

// Each look shown as a tiny postcard of its own colors.
function SkinPicker({ home, skin, onSkin }: { home: HomeLang; skin: Skin; onSkin: (s: Skin) => void }) {
  return (
    <div className="skins">
      {SKINS.map((s) => (
        <button
          key={s.id}
          className={`skin${skin === s.id ? ' on' : ''}`}
          aria-pressed={skin === s.id}
          onClick={() => {
            buzz()
            onSkin(s.id)
          }}
        >
          <span className="skin-card" style={{ background: s.swatch[0] }} aria-hidden="true">
            <i style={{ background: s.swatch[1] }} />
            <i style={{ background: s.swatch[2] }} />
            <i style={{ background: s.swatch[3] }} />
          </span>
          {s.name[home]}
        </button>
      ))}
    </div>
  )
}

// What the locals might be shouting at you, scrolling past like a departures board.
function Ticker({ target }: { target: Lang }) {
  const lines = PHRASES.filter((p) => p.cat === 'insult').map((p) => p.text[target])
  const run = lines.map((line, i) => (
    <span key={i}>
      {line}
      <b>✱</b>
    </span>
  ))
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" lang={LANGS[target].locale}>
        {run}
        {run}
      </div>
    </div>
  )
}

function Setup({ initial, skin, onSkin, onDone }: {
  initial: Settings | null
  skin: Skin
  onSkin: (s: Skin) => void
  onDone: (home: HomeLang, target: Lang) => void
}) {
  const [home, setHome] = useState<HomeLang>(initial?.home ?? (navigator.language.startsWith('fr') ? 'fr' : 'en'))
  const [target, setTarget] = useState<Lang | null>(initial?.target ?? null)
  const t = UI[home]
  const targets = (Object.keys(LANGS) as Lang[]).filter((l) => l !== home)

  return (
    <div className="app setup">
      <div className="masthead">
        <div className="logo">
          <Logo size={112} plate />
        </div>
        <p className="eyebrow">Phrasebook · Nº 1</p>
        <h1>Rude <em>tourist.</em></h1>
        <p className="tagline">{t.tagline}</p>
      </div>

      <section>
        <h2>{t.iSpeak}</h2>
        <div className="pick-row">
          {HOME_LANGS.map((l) => (
            <button
              key={l}
              className={`pick ${home === l ? 'on' : ''}`}
              onClick={() => {
                setHome(l)
                if (target === l) setTarget(null)
              }}
            >
              <span className="flag">{LANGS[l].flag}</span>{LANGS[l].name[l]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>{t.goingTo}</h2>
        <div className="pick-grid">
          {targets.map((l) => (
            <button key={l} className={`pick ${target === l ? 'on' : ''}`} onClick={() => setTarget(l)}>
              <span className="flag">{LANGS[l].flag}</span>{LANGS[l].name[home]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>{t.look}</h2>
        <SkinPicker home={home} skin={skin} onSkin={onSkin} />
      </section>

      <button className="primary" disabled={!target} onClick={() => target && onDone(home, target)}>
        {t.start}
      </button>

      {/* Required while the clips come from the ElevenLabs free plan. */}
      <p className="credit">
        Voices by <a href="https://elevenlabs.io" target="_blank" rel="noreferrer">ElevenLabs</a>
      </p>
    </div>
  )
}

function Board({ settings, onOpen, onLibrary }: { settings: Settings; onOpen: (p: Phrase) => void; onLibrary: () => void }) {
  const t = UI[settings.home]
  const phrases = settings.board.map((id) => PHRASE_BY_ID.get(id)!).filter(Boolean)

  if (phrases.length === 0) {
    return (
      <div className="empty">
        <p>{t.empty}</p>
        <button className="primary" onClick={onLibrary}>{t.library}</button>
      </div>
    )
  }

  return (
    <main className="board">
      {phrases.map((p, i) => (
        <button
          key={p.id}
          className={`tile tile-${p.cat} tone-${i % 4}`}
          style={style({ '--i': i, '--tilt': `${TILTS[i % TILTS.length]}deg` })}
          onClick={() => {
            buzz()
            onOpen(p)
          }}
        >
          <span className="tile-mark" aria-hidden="true">{isLocked(p) ? '🔒' : CAT_MARK[p.cat]}</span>
          <span className="tile-text">{p.text[settings.home]}</span>
          <span className="tile-target" lang={LANGS[settings.target].locale}>{p.text[settings.target]}</span>
        </button>
      ))}
    </main>
  )
}

function Library({ settings, onToggle, onLocked }: { settings: Settings; onToggle: (id: string) => void; onLocked: () => void }) {
  const t = UI[settings.home]
  const [cat, setCat] = useState<Category>('insult')
  const full = settings.board.length >= MAX_BOARD

  return (
    <main className="library">
      <div className="chips" role="tablist">
        {CATEGORIES.map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>
            <span aria-hidden="true">{CAT_MARK[c]}</span>
            {t[c]}
          </button>
        ))}
      </div>
      <p className="count">{settings.board.length} / {MAX_BOARD}{full ? ` · ${t.full}` : ''}</p>
      <ul>
        {PHRASES.filter((p) => p.cat === cat).map((p, i) => {
          const on = settings.board.includes(p.id)
          // A Pro phrase already on an older board can still be removed.
          const locked = isLocked(p) && !on
          return (
            <li key={`${cat}-${p.id}`} className={locked ? 'locked' : ''} style={style({ '--i': i })}>
              <div className="lib-text">
                <span>
                  {p.text[settings.home]}
                  {locked && <span className="pro-chip">Pro</span>}
                </span>
                <span className="lib-target">{p.text[settings.target]}</span>
              </div>
              <button
                className={`lib-btn ${on ? 'on' : ''}${locked ? ' lock' : ''}`}
                disabled={!on && !locked && full}
                onClick={() => {
                  buzz()
                  if (locked) onLocked()
                  else onToggle(p.id)
                }}
                aria-label={locked ? 'Pro' : on ? t.remove : t.add}
              >
                {locked ? '🔒' : on ? '✓' : '+'}
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

// Practice mode (Pro): the phrase at half speed, then a silent gap to repeat it, three times.
const PRACTICE_RATE = 0.5
const PRACTICE_ROUNDS = 3

type Drill = { round: number; phase: 'listen' | 'you' }

function PhraseCard({ phrase, settings, onLocked, onClose }: {
  phrase: Phrase
  settings: Settings
  onLocked: () => void
  onClose: () => void
}) {
  const t = UI[settings.home]
  const target = settings.target
  const [silent, setSilent] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [drill, setDrill] = useState<Drill | null>(null)
  const gap = useRef<number | undefined>(undefined)
  const pron = phrase.pron[target][settings.home]

  const stopDrill = () => {
    window.clearTimeout(gap.current)
    setDrill(null)
  }

  const drillRound = (round: number) => {
    setDrill({ round, phase: 'listen' })
    setSpeaking(true)
    const started = performance.now()
    playPhrase(phrase, target, PRACTICE_RATE, () => {
      setSpeaking(false)
      setDrill({ round, phase: 'you' })
      // Give the learner as long as the slow clip took, plus a breath.
      const wait = Math.max(1500, performance.now() - started + 600)
      gap.current = window.setTimeout(() => {
        if (round < PRACTICE_ROUNDS) drillRound(round + 1)
        else setDrill(null)
      }, wait)
    }).then((ok) => {
      if (ok) return
      setSilent(true)
      setSpeaking(false)
      setDrill(null)
    })
  }

  const practice = () => {
    if (!IS_PRO) return onLocked()
    window.clearTimeout(gap.current)
    if (drill) {
      stopSpeaking()
      setSpeaking(false)
      setDrill(null)
      return
    }
    drillRound(1)
  }

  useEffect(() => () => window.clearTimeout(gap.current), [])

  const play = (rate = 1) => {
    stopDrill()
    setSpeaking(true)
    playPhrase(phrase, target, rate, () => setSpeaking(false)).then((ok) => {
      setSilent(!ok)
      if (!ok) setSpeaking(false)
    })
  }
  const words = phrase.text[target].split(' ')

  // Speak as soon as the card opens.
  useEffect(() => {
    play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase.id, target])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="burst" aria-hidden="true">
          {BURST[phrase.cat].map((sym, i) => (
            <span key={i} style={style({ '--a': `${(360 / BURST[phrase.cat].length) * i - 90}deg`, '--i': i })}>
              {sym}
            </span>
          ))}
        </div>
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <p className="card-home">{LANGS[settings.home].flag} {phrase.text[settings.home]}</p>
        <p className="card-target" lang={LANGS[target].locale} aria-label={phrase.text[target]}>
          {words.map((w, i) => (
            <span key={i} className="word" style={style({ '--i': i })} aria-hidden="true">
              {w}{i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
        {pron && (
          <div className="card-pron">
            <span className="label">{t.soundsLike}</span>
            <span className="pron">{pron}</span>
          </div>
        )}
        {silent && <p className="warn">{t.noVoice}</p>}
        <div className="card-actions">
          <button className={`primary say${speaking ? ' speaking' : ''}`} onClick={() => play()}>
            <span className="bars" aria-hidden="true"><i /><i /><i /><i /></span>
            {t.sayIt}
          </button>
          <button className="secondary" onClick={() => play(0.7)}>🐢 {t.slow}</button>
        </div>
        <button className={`practice${drill ? ' on' : ''}`} onClick={practice} aria-live="polite">
          {drill ? (
            <>
              <span className="practice-dots" aria-hidden="true">
                {Array.from({ length: PRACTICE_ROUNDS }, (_, i) => (
                  <i key={i} className={i < drill.round ? 'done' : ''} />
                ))}
              </span>
              {drill.phase === 'listen' ? t.listen : t.yourTurn}
              <span className="practice-stop">{t.stop}</span>
            </>
          ) : (
            <>
              🔁 {t.practice} <span className="practice-rate">×{PRACTICE_RATE}</span>
              {!IS_PRO && <span className="pro-chip">Pro</span>}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
