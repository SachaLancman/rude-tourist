import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Flag } from './Flag'
import { nope, punch, tap, thump, tick, yourTurn } from './haptics'
import { Intro } from './Intro'
import { LangSelect } from './LangSelect'
import { Logo } from './Logo'
import { Paywall } from './Paywall'
import { IS_PRO, isLocked, markPaywallSeen, paywallSeenThisOpen } from './pro'
import {
  CATEGORIES, DEFAULT_BOARD, HOME_LANGS, LANGS, MAX_BOARD, PHRASES, PHRASE_BY_ID, pronFor,
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
    choose: 'Choose a language',
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
    choose: 'Choisis une langue',
  },
  es: {
    tagline: 'Dilo como un local.',
    iSpeak: 'Hablo',
    goingTo: 'Quiero hablar',
    start: 'Abrir mi tablero',
    board: 'Mi tablero',
    library: 'Biblioteca',
    edit: 'Editar',
    done: 'Listo',
    empty: 'Tu tablero está vacío. Añade frases desde la biblioteca.',
    insult: 'Insultos',
    basic: 'Supervivencia',
    taxi: 'Taxi',
    food: 'Restaurante',
    night: 'Fiesta',
    look: 'Estilo',
    add: 'Añadir',
    remove: 'Quitar',
    full: `Tablero lleno (${MAX_BOARD} máx.)`,
    sayIt: 'Decirlo',
    slow: 'Despacio',
    practice: 'Practicar',
    listen: 'Escucha…',
    yourTurn: '¡Tu turno!',
    stop: 'Parar',
    soundsLike: 'Suena como',
    noVoice: 'No hay voz para este idioma en tu dispositivo. Enseña la pantalla.',
    change: 'Cambiar',
    choose: 'Elige un idioma',
  },
  de: {
    tagline: 'Sag es wie ein Einheimischer.',
    iSpeak: 'Ich spreche',
    goingTo: 'Ich will sprechen',
    start: 'Meine Tafel öffnen',
    board: 'Meine Tafel',
    library: 'Bibliothek',
    edit: 'Bearbeiten',
    done: 'Fertig',
    empty: 'Deine Tafel ist leer. Füge Sätze aus der Bibliothek hinzu.',
    insult: 'Beleidigungen',
    basic: 'Überleben',
    taxi: 'Taxi',
    food: 'Restaurant',
    night: 'Nachtleben',
    look: 'Stil',
    add: 'Hinzufügen',
    remove: 'Entfernen',
    full: `Tafel voll (max. ${MAX_BOARD})`,
    sayIt: 'Sagen',
    slow: 'Langsam',
    practice: 'Üben',
    listen: 'Hör zu…',
    yourTurn: 'Du bist dran!',
    stop: 'Stopp',
    soundsLike: 'Klingt wie',
    noVoice: 'Keine Stimme für diese Sprache auf deinem Gerät. Zeig einfach den Bildschirm.',
    change: 'Ändern',
    choose: 'Sprache wählen',
  },
  it: {
    tagline: 'Dillo come un locale.',
    iSpeak: 'Parlo',
    goingTo: 'Voglio parlare',
    start: 'Apri la mia bacheca',
    board: 'La mia bacheca',
    library: 'Libreria',
    edit: 'Modifica',
    done: 'Fatto',
    empty: 'La tua bacheca è vuota. Aggiungi frasi dalla libreria.',
    insult: 'Insulti',
    basic: 'Sopravvivenza',
    taxi: 'Taxi',
    food: 'Ristorante',
    night: 'Vita notturna',
    look: 'Stile',
    add: 'Aggiungi',
    remove: 'Rimuovi',
    full: `Bacheca piena (max ${MAX_BOARD})`,
    sayIt: 'Dillo',
    slow: 'Piano',
    practice: 'Esercizio',
    listen: 'Ascolta…',
    yourTurn: 'Tocca a te!',
    stop: 'Stop',
    soundsLike: 'Si pronuncia',
    noVoice: 'Nessuna voce per questa lingua sul tuo dispositivo. Mostra lo schermo.',
    change: 'Cambia',
    choose: 'Scegli una lingua',
  },
  pt: {
    tagline: 'Fale como um local.',
    iSpeak: 'Eu falo',
    goingTo: 'Quero falar',
    start: 'Abrir meu quadro',
    board: 'Meu quadro',
    library: 'Biblioteca',
    edit: 'Editar',
    done: 'Pronto',
    empty: 'Seu quadro está vazio. Adicione frases da biblioteca.',
    insult: 'Insultos',
    basic: 'Sobrevivência',
    taxi: 'Táxi',
    food: 'Restaurante',
    night: 'Balada',
    look: 'Estilo',
    add: 'Adicionar',
    remove: 'Remover',
    full: `Quadro cheio (máx. ${MAX_BOARD})`,
    sayIt: 'Falar',
    slow: 'Devagar',
    practice: 'Praticar',
    listen: 'Escute…',
    yourTurn: 'Sua vez!',
    stop: 'Parar',
    soundsLike: 'Soa como',
    noVoice: 'Sem voz para este idioma no seu aparelho. Mostre a tela.',
    change: 'Mudar',
    choose: 'Escolha um idioma',
  },
  nl: {
    tagline: 'Zeg het als een local.',
    iSpeak: 'Ik spreek',
    goingTo: 'Ik wil spreken',
    start: 'Open mijn bord',
    board: 'Mijn bord',
    library: 'Bibliotheek',
    edit: 'Bewerken',
    done: 'Klaar',
    empty: 'Je bord is leeg. Voeg zinnen toe uit de bibliotheek.',
    insult: 'Scheldwoorden',
    basic: 'Overleven',
    taxi: 'Taxi',
    food: 'Restaurant',
    night: 'Uitgaan',
    look: 'Stijl',
    add: 'Toevoegen',
    remove: 'Verwijderen',
    full: `Bord vol (max. ${MAX_BOARD})`,
    sayIt: 'Zeg het',
    slow: 'Langzaam',
    practice: 'Oefenen',
    listen: 'Luister…',
    yourTurn: 'Jouw beurt!',
    stop: 'Stop',
    soundsLike: 'Klinkt als',
    noVoice: 'Geen stem voor deze taal op je toestel. Laat het scherm zien.',
    change: 'Wijzigen',
    choose: 'Kies een taal',
  },
  pl: {
    tagline: 'Mów jak miejscowy.',
    iSpeak: 'Mój język',
    goingTo: 'Język, którym chcę mówić',
    start: 'Otwórz moją tablicę',
    board: 'Moja tablica',
    library: 'Biblioteka',
    edit: 'Edytuj',
    done: 'Gotowe',
    empty: 'Twoja tablica jest pusta. Dodaj zwroty z biblioteki.',
    insult: 'Obelgi',
    basic: 'Przetrwanie',
    taxi: 'Taksówka',
    food: 'Restauracja',
    night: 'Imprezy',
    look: 'Styl',
    add: 'Dodaj',
    remove: 'Usuń',
    full: `Tablica pełna (maks. ${MAX_BOARD})`,
    sayIt: 'Powiedz',
    slow: 'Wolno',
    practice: 'Ćwicz',
    listen: 'Słuchaj…',
    yourTurn: 'Twoja kolej!',
    stop: 'Stop',
    soundsLike: 'Wymowa',
    noVoice: 'Brak głosu dla tego języka na twoim urządzeniu. Pokaż ekran.',
    change: 'Zmień',
    choose: 'Wybierz język',
  },
  tr: {
    tagline: 'Yerel gibi söyle.',
    iSpeak: 'Konuştuğum dil',
    goingTo: 'Konuşmak istediğim dil',
    start: 'Panomu aç',
    board: 'Panom',
    library: 'Kütüphane',
    edit: 'Düzenle',
    done: 'Tamam',
    empty: 'Panon boş. Kütüphaneden ifade ekle.',
    insult: 'Hakaretler',
    basic: 'Hayatta kalma',
    taxi: 'Taksi',
    food: 'Restoran',
    night: 'Gece hayatı',
    look: 'Stil',
    add: 'Ekle',
    remove: 'Kaldır',
    full: `Pano dolu (en fazla ${MAX_BOARD})`,
    sayIt: 'Söyle',
    slow: 'Yavaş',
    practice: 'Alıştırma',
    listen: 'Dinle…',
    yourTurn: 'Sıra sende!',
    stop: 'Durdur',
    soundsLike: 'Okunuşu',
    noVoice: 'Cihazında bu dil için ses yok. Ekranı göster.',
    change: 'Değiştir',
    choose: 'Dil seç',
  },
  el: {
    tagline: 'Πες το σαν ντόπιος.',
    iSpeak: 'Μιλάω',
    goingTo: 'Θέλω να μιλήσω',
    start: 'Άνοιξε τον πίνακά μου',
    board: 'Ο πίνακάς μου',
    library: 'Βιβλιοθήκη',
    edit: 'Επεξεργασία',
    done: 'Τέλος',
    empty: 'Ο πίνακάς σου είναι άδειος. Πρόσθεσε φράσεις από τη βιβλιοθήκη.',
    insult: 'Βρισιές',
    basic: 'Επιβίωση',
    taxi: 'Ταξί',
    food: 'Εστιατόριο',
    night: 'Νυχτερινή ζωή',
    look: 'Στιλ',
    add: 'Προσθήκη',
    remove: 'Αφαίρεση',
    full: `Γεμάτος πίνακας (έως ${MAX_BOARD})`,
    sayIt: 'Πες το',
    slow: 'Αργά',
    practice: 'Εξάσκηση',
    listen: 'Άκου…',
    yourTurn: 'Σειρά σου!',
    stop: 'Στοπ',
    soundsLike: 'Προφέρεται',
    noVoice: 'Η συσκευή σου δεν έχει φωνή για αυτή τη γλώσσα. Δείξε την οθόνη.',
    change: 'Αλλαγή',
    choose: 'Διάλεξε γλώσσα',
  },
  ja: {
    tagline: '地元っ子みたいに言おう。',
    iSpeak: '話せる言語',
    goingTo: '話したい言語',
    start: 'ボードを開く',
    board: 'マイボード',
    library: 'フレーズ集',
    edit: '編集',
    done: '完了',
    empty: 'ボードが空です。フレーズ集から追加しよう。',
    insult: '悪口',
    basic: 'サバイバル',
    taxi: 'タクシー',
    food: 'レストラン',
    night: 'ナイトライフ',
    look: 'スタイル',
    add: '追加',
    remove: '削除',
    full: `ボードがいっぱい（最大${MAX_BOARD}）`,
    sayIt: '言う',
    slow: 'ゆっくり',
    practice: '練習',
    listen: '聞いて…',
    yourTurn: 'あなたの番！',
    stop: '停止',
    soundsLike: '発音',
    noVoice: 'この端末にはこの言語の音声がありません。画面を見せてください。',
    change: '変更',
    choose: '言語を選ぶ',
  },
  zh: {
    tagline: '像当地人一样说。',
    iSpeak: '我说',
    goingTo: '我想说',
    start: '打开我的面板',
    board: '我的面板',
    library: '短语库',
    edit: '编辑',
    done: '完成',
    empty: '你的面板是空的。从短语库添加短语吧。',
    insult: '骂人话',
    basic: '生存必备',
    taxi: '出租车',
    food: '餐厅',
    night: '夜生活',
    look: '风格',
    add: '添加',
    remove: '移除',
    full: `面板已满（最多${MAX_BOARD}条）`,
    sayIt: '说出来',
    slow: '慢速',
    practice: '跟读练习',
    listen: '听…',
    yourTurn: '轮到你了！',
    stop: '停止',
    soundsLike: '读音',
    noVoice: '你的设备没有这种语言的语音。直接给对方看屏幕吧。',
    change: '更改',
    choose: '选择语言',
  },
  ko: {
    tagline: '현지인처럼 말해요.',
    iSpeak: '내 언어',
    goingTo: '말하고 싶은 언어',
    start: '내 보드 열기',
    board: '내 보드',
    library: '표현 모음',
    edit: '편집',
    done: '완료',
    empty: '보드가 비어 있어요. 표현 모음에서 추가하세요.',
    insult: '욕',
    basic: '생존 표현',
    taxi: '택시',
    food: '식당',
    night: '나이트라이프',
    look: '스타일',
    add: '추가',
    remove: '삭제',
    full: `보드가 꽉 찼어요 (최대 ${MAX_BOARD}개)`,
    sayIt: '말하기',
    slow: '천천히',
    practice: '따라 하기',
    listen: '들어 보세요…',
    yourTurn: '이제 당신 차례!',
    stop: '정지',
    soundsLike: '발음',
    noVoice: '기기에 이 언어 음성이 없어요. 화면을 보여 주세요.',
    change: '변경',
    choose: '언어 선택',
  },
  th: {
    tagline: 'พูดให้เหมือนคนท้องถิ่น',
    iSpeak: 'ฉันพูด',
    goingTo: 'ฉันอยากพูด',
    start: 'เปิดบอร์ดของฉัน',
    board: 'บอร์ดของฉัน',
    library: 'คลังวลี',
    edit: 'แก้ไข',
    done: 'เสร็จ',
    empty: 'บอร์ดของคุณว่างอยู่ เพิ่มวลีจากคลังวลีได้เลย',
    insult: 'คำด่า',
    basic: 'เอาตัวรอด',
    taxi: 'แท็กซี่',
    food: 'ร้านอาหาร',
    night: 'ชีวิตกลางคืน',
    look: 'สไตล์',
    add: 'เพิ่ม',
    remove: 'ลบ',
    full: `บอร์ดเต็มแล้ว (สูงสุด ${MAX_BOARD})`,
    sayIt: 'พูด',
    slow: 'ช้าๆ',
    practice: 'ฝึกพูด',
    listen: 'ฟัง…',
    yourTurn: 'ตาคุณแล้ว!',
    stop: 'หยุด',
    soundsLike: 'อ่านว่า',
    noVoice: 'เครื่องของคุณไม่มีเสียงสำหรับภาษานี้ ให้ดูหน้าจอแทน',
    change: 'เปลี่ยน',
    choose: 'เลือกภาษา',
  },
  id: {
    tagline: 'Ngomong kayak orang lokal.',
    iSpeak: 'Saya bicara',
    goingTo: 'Saya mau bicara',
    start: 'Buka papan saya',
    board: 'Papan saya',
    library: 'Perpustakaan',
    edit: 'Ubah',
    done: 'Selesai',
    empty: 'Papanmu kosong. Tambah frasa dari perpustakaan.',
    insult: 'Makian',
    basic: 'Bertahan hidup',
    taxi: 'Taksi',
    food: 'Restoran',
    night: 'Hiburan malam',
    look: 'Gaya',
    add: 'Tambah',
    remove: 'Hapus',
    full: `Papan penuh (maks. ${MAX_BOARD})`,
    sayIt: 'Ucapkan',
    slow: 'Pelan',
    practice: 'Latihan',
    listen: 'Dengar…',
    yourTurn: 'Giliranmu!',
    stop: 'Stop',
    soundsLike: 'Dibaca',
    noVoice: 'Perangkatmu tidak punya suara untuk bahasa ini. Tunjukkan layarnya.',
    change: 'Ganti',
    choose: 'Pilih bahasa',
  },
} satisfies Record<HomeLang, Record<string, string>>

type Screen = 'setup' | 'board' | 'library'

// The device language when the app speaks it, else English.
function deviceHome(): HomeLang {
  const code = navigator.language.slice(0, 2) as HomeLang
  return HOME_LANGS.includes(code) ? code : 'en'
}

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(loadSettings)
  // Every open: intro, then the paywall, then the language picker (pre-filled for returning users).
  const [screen, setScreen] = useState<Screen>('setup')
  const [open, setOpen] = useState<Phrase | null>(null)
  const [intro, setIntro] = useState(() => !prefersReducedMotion())
  const [skin, setSkin] = useState<Skin>(loadSkin)
  const [picking, setPicking] = useState(false)
  const [paywall, setPaywall] = useState(() => !IS_PRO && !paywallSeenThisOpen())

  useEffect(() => {
    if (settings) saveSettings(settings)
  }, [settings])

  useEffect(() => applySkin(skin), [skin])

  useEffect(() => {
    if (paywall) markPaywallSeen()
  }, [paywall])

  const uiHome: HomeLang = settings?.home ?? deviceHome()
  const introLayer = intro && <Intro tagline={UI[uiHome].tagline} onDone={() => setIntro(false)} />
  const showPaywall = () => !IS_PRO && setPaywall(true)
  const paywallLayer = paywall && <Paywall home={uiHome} onClose={() => setPaywall(false)} />

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
          }}
        />
        {paywallLayer}
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
            <Flag lang={settings.home} size={20} />
            <span className="arrow">→</span>
            <Flag lang={settings.target} size={20} />
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
      {paywallLayer}
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
            tick()
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
  const [home, setHome] = useState<HomeLang>(initial?.home ?? deviceHome())
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
        <LangSelect
          label={t.iSpeak}
          value={home}
          options={HOME_LANGS}
          nameOf={(l) => LANGS[l].name[l]}
          placeholder={t.choose}
          onChange={(l) => {
            setHome(l)
            if (target === l) setTarget(null)
          }}
        />
      </section>

      <section>
        <h2>{t.goingTo}</h2>
        <LangSelect
          label={t.goingTo}
          value={target}
          options={targets}
          nameOf={(l) => LANGS[l].name[home]}
          placeholder={t.choose}
          onChange={setTarget}
        />
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
            if (isLocked(p)) nope()
            else if (p.cat === 'insult') punch()
            else thump()
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
                  if (locked) nope()
                  else tap()
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
  const pron = pronFor(phrase, target, settings.home)

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
      yourTurn()
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
    if (!IS_PRO) {
      nope()
      return onLocked()
    }
    tap()
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
        <p className="card-home"><Flag lang={settings.home} size={18} /> {phrase.text[settings.home]}</p>
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
          <button className={`primary say${speaking ? ' speaking' : ''}`} onClick={() => { tap(); play() }}>
            <span className="bars" aria-hidden="true"><i /><i /><i /><i /></span>
            {t.sayIt}
          </button>
          <button className="secondary" onClick={() => { tap(); play(0.7) }}>🐢 {t.slow}</button>
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
