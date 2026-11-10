import { useEffect, useState } from 'react'
import {
  DEFAULT_BOARD, HOME_LANGS, LANGS, MAX_BOARD, PHRASES, PHRASE_BY_ID,
  type Category, type HomeLang, type Lang, type Phrase,
} from './phrases'
import { playPhrase, stopSpeaking } from './speech'
import './App.css'

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
    add: 'Add',
    remove: 'Remove',
    full: `Board full (${MAX_BOARD} max)`,
    sayIt: 'Say it',
    slow: 'Slowly',
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
    add: 'Ajouter',
    remove: 'Retirer',
    full: `Tableau plein (${MAX_BOARD} max)`,
    sayIt: 'Le dire',
    slow: 'Lentement',
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

  useEffect(() => {
    if (settings) saveSettings(settings)
  }, [settings])

  if (!settings || screen === 'setup') {
    return (
      <Setup
        initial={settings}
        onDone={(home, target) => {
          setSettings({ home, target, board: settings?.board ?? DEFAULT_BOARD })
          setScreen('board')
        }}
      />
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
        <button className="lang-chip" onClick={() => setScreen('setup')} aria-label={t.change}>
          <span>{LANGS[settings.home].flag}</span>
          <span className="arrow">→</span>
          <span>{LANGS[settings.target].flag}</span>
          <span className="lang-chip-name">{LANGS[settings.target].name[settings.home]}</span>
        </button>
        <nav className="tabs">
          <button className={screen === 'board' ? 'on' : ''} onClick={() => setScreen('board')}>{t.board}</button>
          <button className={screen === 'library' ? 'on' : ''} onClick={() => setScreen('library')}>{t.library}</button>
        </nav>
      </header>

      {screen === 'board' ? (
        <Board settings={settings} onOpen={setOpen} onLibrary={() => setScreen('library')} />
      ) : (
        <Library settings={settings} onToggle={toggle} />
      )}

      {open && <PhraseCard phrase={open} settings={settings} onClose={() => { stopSpeaking(); setOpen(null) }} />}
    </div>
  )
}

function Setup({ initial, onDone }: { initial: Settings | null; onDone: (home: HomeLang, target: Lang) => void }) {
  const [home, setHome] = useState<HomeLang>(initial?.home ?? (navigator.language.startsWith('fr') ? 'fr' : 'en'))
  const [target, setTarget] = useState<Lang | null>(initial?.target ?? null)
  const t = UI[home]
  const targets = (Object.keys(LANGS) as Lang[]).filter((l) => l !== home)

  return (
    <div className="app setup">
      <div className="masthead">
        <img className="logo" src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width="112" height="112" />
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

      <button className="primary" disabled={!target} onClick={() => target && onDone(home, target)}>
        {t.start}
      </button>
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
          onClick={() => onOpen(p)}
        >
          <span className="tile-text">{p.text[settings.home]}</span>
        </button>
      ))}
    </main>
  )
}

function Library({ settings, onToggle }: { settings: Settings; onToggle: (id: string) => void }) {
  const t = UI[settings.home]
  const [cat, setCat] = useState<Category>('insult')
  const full = settings.board.length >= MAX_BOARD

  return (
    <main className="library">
      <div className="seg">
        {(['insult', 'basic'] as Category[]).map((c) => (
          <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{t[c]}</button>
        ))}
      </div>
      <p className="count">{settings.board.length} / {MAX_BOARD}{full ? ` · ${t.full}` : ''}</p>
      <ul>
        {PHRASES.filter((p) => p.cat === cat).map((p) => {
          const on = settings.board.includes(p.id)
          return (
            <li key={p.id}>
              <div className="lib-text">
                <span>{p.text[settings.home]}</span>
                <span className="lib-target">{p.text[settings.target]}</span>
              </div>
              <button
                className={`lib-btn ${on ? 'on' : ''}`}
                disabled={!on && full}
                onClick={() => onToggle(p.id)}
                aria-label={on ? t.remove : t.add}
              >
                {on ? '✓' : '+'}
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

function PhraseCard({ phrase, settings, onClose }: { phrase: Phrase; settings: Settings; onClose: () => void }) {
  const t = UI[settings.home]
  const target = settings.target
  const [silent, setSilent] = useState(false)
  const pron = phrase.pron[target][settings.home]
  const play = (rate = 1) => playPhrase(phrase, target, rate).then((ok) => setSilent(!ok))

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
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <p className="card-home">{LANGS[settings.home].flag} {phrase.text[settings.home]}</p>
        <p className="card-target" lang={LANGS[target].locale}>{phrase.text[target]}</p>
        {pron && (
          <div className="card-pron">
            <span className="label">{t.soundsLike}</span>
            <span className="pron">{pron}</span>
          </div>
        )}
        {silent && <p className="warn">{t.noVoice}</p>}
        <div className="card-actions">
          <button className="primary" onClick={() => play()}>🔊 {t.sayIt}</button>
          <button className="secondary" onClick={() => play(0.7)}>🐢 {t.slow}</button>
        </div>
      </div>
    </div>
  )
}
