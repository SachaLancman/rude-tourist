import { useEffect, useState, type CSSProperties } from 'react'
import { tap, tick } from './haptics'
import { Logo } from './Logo'
import { LANGS, PHRASES, type HomeLang } from './phrases'
import type { Plan } from './pro'

// One message, a checklist, three plans, one button (paywall tips #31, #15, #17, #83).
// Payments are not wired yet, so the button only says so and charges nothing.
const INSULTS = PHRASES.filter((p) => p.cat === 'insult').length
const LANG_COUNT = Object.keys(LANGS).length

const COPY = {
  en: {
    headline: 'Swear like a local.',
    sub: `Every insult and every survival line, in ${LANG_COUNT} languages, spoken by a real voice.`,
    checks: [`All ${INSULTS} insults, in ${LANG_COUNT} languages`, 'Taxi, Restaurant & Nightlife packs', 'Practice mode: half speed, time to repeat', 'Every new pack we add'],
    trip: { name: 'Trip Pass', price: '$2.99', per: '/ week', note: 'Perfect for one trip' },
    year: { name: 'Yearly', price: '$29.99', per: '/ year', note: 'Only $0.58/week · 3 days free' },
    life: { name: 'Lifetime', price: '$49.99', per: 'once', note: 'Pay once, keep it forever' },
    best: 'Best value',
    ctaTrip: 'Get the Trip Pass',
    ctaYear: 'Start my 3-day free trial',
    ctaLife: 'Get lifetime access',
    fine: 'Cancel anytime.',
    soon: 'Payments open soon. Nothing is charged today.',
    thanks: "You're early! Payments open very soon.",
    close: 'Close',
  },
  fr: {
    headline: 'Jure comme un local.',
    sub: `Toutes les insultes et toutes les phrases de survie, en ${LANG_COUNT} langues, avec une vraie voix.`,
    checks: [`Les ${INSULTS} insultes, en ${LANG_COUNT} langues`, 'Packs Taxi, Restaurant et Soirée', 'Entraînement : demi-vitesse, le temps de répéter', 'Chaque nouveau pack'],
    trip: { name: 'Pass Voyage', price: '2,9 $', per: '/ semaine', note: 'Parfait pour un voyage' },
    year: { name: 'Annuel', price: '29,9 $', per: '/ an', note: 'Seulement 0,5 $/semaine · 3 jours offerts' },
    life: { name: 'À vie', price: '49,9 $', per: 'une fois', note: 'Payé une fois, à toi pour toujours' },
    best: 'Meilleure offre',
    ctaTrip: 'Prendre le Pass Voyage',
    ctaYear: 'Commencer mes 3 jours gratuits',
    ctaLife: 'Débloquer à vie',
    fine: 'Résiliable à tout moment.',
    soon: "Les paiements arrivent bientôt. Rien n'est débité aujourd'hui.",
    thanks: 'Tu es en avance ! Les paiements arrivent très bientôt.',
    close: 'Fermer',
  },
  es: {
    headline: 'Insulta como un local.',
    sub: `Todos los insultos y todas las frases de supervivencia, en ${LANG_COUNT} idiomas, con una voz real.`,
    checks: [`Los ${INSULTS} insultos, en ${LANG_COUNT} idiomas`, 'Packs Taxi, Restaurante y Fiesta', 'Modo práctica: a media velocidad, con tiempo para repetir', 'Cada nuevo pack'],
    trip: { name: 'Pase de viaje', price: '2,9 $', per: '/ semana', note: 'Perfecto para un viaje' },
    year: { name: 'Anual', price: '29,9 $', per: '/ año', note: 'Solo 0,5 $/semana · 3 días gratis' },
    life: { name: 'De por vida', price: '49,9 $', per: 'un pago', note: 'Pagas una vez, para siempre' },
    best: 'Mejor oferta',
    ctaTrip: 'Comprar el Pase de viaje',
    ctaYear: 'Empezar mis 3 días gratis',
    ctaLife: 'Comprar de por vida',
    fine: 'Cancela cuando quieras.',
    soon: 'Los pagos llegan pronto. Hoy no se cobra nada.',
    thanks: '¡Llegas pronto! Los pagos abren muy pronto.',
    close: 'Cerrar',
  },
  de: {
    headline: 'Fluch wie ein Einheimischer.',
    sub: `Jede Beleidigung und jeder Überlebenssatz, in ${LANG_COUNT} Sprachen, mit echter Stimme.`,
    checks: [`Alle ${INSULTS} Beleidigungen, in ${LANG_COUNT} Sprachen`, 'Pakete Taxi, Restaurant und Nachtleben', 'Übungsmodus: halbes Tempo, Zeit zum Nachsprechen', 'Jedes neue Paket'],
    trip: { name: 'Reisepass', price: '2,9 $', per: '/ Woche', note: 'Perfekt für eine Reise' },
    year: { name: 'Jährlich', price: '29,9 $', per: '/ Jahr', note: 'Nur 0,5 $/Woche · 3 Tage gratis' },
    life: { name: 'Lebenslang', price: '49,9 $', per: 'einmalig', note: 'Einmal zahlen, für immer behalten' },
    best: 'Bester Preis',
    ctaTrip: 'Reisepass holen',
    ctaYear: 'Meine 3 Gratistage starten',
    ctaLife: 'Lebenslang freischalten',
    fine: 'Jederzeit kündbar.',
    soon: 'Zahlungen kommen bald. Heute wird nichts berechnet.',
    thanks: 'Du bist früh dran! Zahlungen kommen sehr bald.',
    close: 'Schließen',
  },
  it: {
    headline: 'Impreca come un locale.',
    sub: `Ogni insulto e ogni frase di sopravvivenza, in ${LANG_COUNT} lingue, con una voce vera.`,
    checks: [`Tutti i ${INSULTS} insulti, in ${LANG_COUNT} lingue`, 'Pacchetti Taxi, Ristorante e Vita notturna', 'Modalità esercizio: metà velocità, tempo per ripetere', 'Ogni nuovo pacchetto'],
    trip: { name: 'Pass Viaggio', price: '2,9 $', per: '/ settimana', note: 'Perfetto per un viaggio' },
    year: { name: 'Annuale', price: '29,9 $', per: '/ anno', note: 'Solo 0,5 $/settimana · 3 giorni gratis' },
    life: { name: 'A vita', price: '49,9 $', per: 'una volta', note: 'Paghi una volta, tuo per sempre' },
    best: 'Più conveniente',
    ctaTrip: 'Prendi il Pass Viaggio',
    ctaYear: 'Inizia i miei 3 giorni gratis',
    ctaLife: 'Sblocca a vita',
    fine: 'Disdici quando vuoi.',
    soon: 'I pagamenti arrivano presto. Oggi non paghi nulla.',
    thanks: 'Sei in anticipo! I pagamenti aprono a breve.',
    close: 'Chiudi',
  },
  pt: {
    headline: 'Xingue como um local.',
    sub: `Todos os insultos e todas as frases de sobrevivência, em ${LANG_COUNT} idiomas, com voz de verdade.`,
    checks: [`Os ${INSULTS} insultos, em ${LANG_COUNT} idiomas`, 'Pacotes Táxi, Restaurante e Balada', 'Modo prática: meia velocidade, tempo para repetir', 'Cada pacote novo'],
    trip: { name: 'Passe de Viagem', price: 'US$ 2,99', per: '/ semana', note: 'Perfeito para uma viagem' },
    year: { name: 'Anual', price: 'US$ 29,99', per: '/ ano', note: 'Só US$ 0,58/semana · 3 dias grátis' },
    life: { name: 'Vitalício', price: 'US$ 49,99', per: 'uma vez', note: 'Pague uma vez, use para sempre' },
    best: 'Melhor oferta',
    ctaTrip: 'Pegar o Passe de Viagem',
    ctaYear: 'Começar meus 3 dias grátis',
    ctaLife: 'Comprar vitalício',
    fine: 'Cancele quando quiser.',
    soon: 'Pagamentos em breve. Nada é cobrado hoje.',
    thanks: 'Você chegou cedo! Pagamentos abrem em breve.',
    close: 'Fechar',
  },
  nl: {
    headline: 'Scheld als een local.',
    sub: `Elk scheldwoord en elke overlevingszin, in ${LANG_COUNT} talen, met een echte stem.`,
    checks: [`Alle ${INSULTS} scheldwoorden, in ${LANG_COUNT} talen`, 'Pakketten Taxi, Restaurant en Uitgaan', 'Oefenmodus: half tempo, tijd om na te zeggen', 'Elk nieuw pakket'],
    trip: { name: 'Reispas', price: '$ 2,99', per: '/ week', note: 'Perfect voor één reis' },
    year: { name: 'Jaarlijks', price: '$ 29,99', per: '/ jaar', note: 'Maar $ 0,58/week · 3 dagen gratis' },
    life: { name: 'Levenslang', price: '$ 49,99', per: 'eenmalig', note: 'Eén keer betalen, voor altijd' },
    best: 'Beste deal',
    ctaTrip: 'Neem de Reispas',
    ctaYear: 'Start mijn 3 gratis dagen',
    ctaLife: 'Koop levenslang',
    fine: 'Altijd opzegbaar.',
    soon: 'Betalen kan binnenkort. Vandaag wordt niets afgeschreven.',
    thanks: 'Je bent vroeg! Betalen kan heel binnenkort.',
    close: 'Sluiten',
  },
  pl: {
    headline: 'Klnij jak miejscowy.',
    sub: `Każda obelga i każdy zwrot na przetrwanie, w ${LANG_COUNT} językach, prawdziwym głosem.`,
    checks: [`Wszystkie obelgi (${INSULTS}), w ${LANG_COUNT} językach`, 'Pakiety Taksówka, Restauracja i Imprezy', 'Tryb ćwiczeń: pół prędkości, czas na powtórkę', 'Każdy nowy pakiet'],
    trip: { name: 'Karnet na wyjazd', price: '2,9 $', per: '/ tydzień', note: 'Idealny na jedną podróż' },
    year: { name: 'Roczny', price: '29,9 $', per: '/ rok', note: 'Tylko 0,5 $/tydzień · 3 dni za darmo' },
    life: { name: 'Dożywotni', price: '49,9 $', per: 'jednorazowo', note: 'Płacisz raz, masz na zawsze' },
    best: 'Najlepsza oferta',
    ctaTrip: 'Kup karnet na wyjazd',
    ctaYear: 'Zacznij 3 darmowe dni',
    ctaLife: 'Kup dostęp dożywotni',
    fine: 'Anuluj w każdej chwili.',
    soon: 'Płatności już wkrótce. Dziś nic nie pobieramy.',
    thanks: 'Jesteś wcześnie! Płatności ruszają już wkrótce.',
    close: 'Zamknij',
  },
  tr: {
    headline: 'Yerel gibi küfret.',
    sub: `Tüm hakaretler ve hayatta kalma ifadeleri, ${LANG_COUNT} dilde, gerçek sesle.`,
    checks: [`${INSULTS} hakaretin hepsi, ${LANG_COUNT} dilde`, 'Taksi, Restoran ve Gece hayatı paketleri', 'Alıştırma modu: yarım hız, tekrar etmeye zaman', 'Her yeni paket'],
    trip: { name: 'Seyahat Pası', price: '2,9 $', per: '/ hafta', note: 'Tek bir seyahat için ideal' },
    year: { name: 'Yıllık', price: '29,9 $', per: '/ yıl', note: 'Haftada sadece 0,5 $ · 3 gün ücretsiz' },
    life: { name: 'Ömür boyu', price: '49,9 $', per: 'tek sefer', note: 'Bir kez öde, sonsuza dek senin' },
    best: 'En avantajlı',
    ctaTrip: 'Seyahat Pası al',
    ctaYear: '3 günlük ücretsiz denemeyi başlat',
    ctaLife: 'Ömür boyu erişim al',
    fine: 'İstediğin zaman iptal et.',
    soon: 'Ödemeler yakında açılıyor. Bugün hiçbir ücret alınmaz.',
    thanks: 'Erkencisin! Ödemeler çok yakında açılıyor.',
    close: 'Kapat',
  },
  el: {
    headline: 'Βρίσε σαν ντόπιος.',
    sub: `Κάθε βρισιά και κάθε φράση επιβίωσης, σε ${LANG_COUNT} γλώσσες, με αληθινή φωνή.`,
    checks: [`Και οι ${INSULTS} βρισιές, σε ${LANG_COUNT} γλώσσες`, 'Πακέτα Ταξί, Εστιατόριο και Νυχτερινή ζωή', 'Εξάσκηση: μισή ταχύτητα, χρόνος για επανάληψη', 'Κάθε νέο πακέτο'],
    trip: { name: 'Πάσο Ταξιδιού', price: '2,9 $', per: '/ εβδομάδα', note: 'Ιδανικό για ένα ταξίδι' },
    year: { name: 'Ετήσιο', price: '29,9 $', per: '/ χρόνο', note: 'Μόνο 0,5 $/εβδομάδα · 3 μέρες δωρεάν' },
    life: { name: "Εφ' όρου ζωής", price: '49,9 $', per: 'μία φορά', note: 'Πληρώνεις μία φορά, για πάντα' },
    best: 'Καλύτερη τιμή',
    ctaTrip: 'Πάρε το Πάσο Ταξιδιού',
    ctaYear: 'Ξεκίνα 3 δωρεάν μέρες',
    ctaLife: "Πάρε το εφ' όρου ζωής",
    fine: 'Ακύρωση οποιαδήποτε στιγμή.',
    soon: 'Οι πληρωμές έρχονται σύντομα. Δεν χρεώνεσαι τίποτα σήμερα.',
    thanks: 'Ήρθες νωρίς! Οι πληρωμές ανοίγουν πολύ σύντομα.',
    close: 'Κλείσιμο',
  },
  ja: {
    headline: '地元っ子みたいに悪態をつこう。',
    sub: `全部の悪口とサバイバルフレーズを${LANG_COUNT}言語で、本物の声で。`,
    checks: [`悪口${INSULTS}個すべて、${LANG_COUNT}言語`, 'タクシー・レストラン・ナイトライフパック', '練習モード：半分の速さで、くり返す時間つき', '今後の新パックすべて'],
    trip: { name: 'トリップパス', price: '$2.99', per: '/ 週', note: '1回の旅行にぴったり' },
    year: { name: '年額', price: '$29.99', per: '/ 年', note: '週あたりわずか$0.58 · 3日間無料' },
    life: { name: '買い切り', price: '$49.99', per: '1回のみ', note: '一度払えばずっと使える' },
    best: 'いちばんお得',
    ctaTrip: 'トリップパスを買う',
    ctaYear: '3日間の無料体験を始める',
    ctaLife: '買い切りで購入',
    fine: 'いつでも解約できます。',
    soon: '支払いはまもなく開始。今日は請求されません。',
    thanks: 'お早いですね！支払いはもうすぐ始まります。',
    close: '閉じる',
  },
  zh: {
    headline: '像当地人一样骂人。',
    sub: `所有骂人话和生存短语，${LANG_COUNT}种语言，真人语音。`,
    checks: [`全部${INSULTS}句骂人话，${LANG_COUNT}种语言`, '出租车、餐厅和夜生活短语包', '跟读模式：半速播放，留时间跟读', '以后的每个新短语包'],
    trip: { name: '旅行通行证', price: '$2.99', per: '/ 周', note: '一次旅行刚刚好' },
    year: { name: '年度', price: '$29.99', per: '/ 年', note: '每周仅$0.58 · 免费试用3天' },
    life: { name: '终身', price: '$49.99', per: '一次性', note: '一次付费，永久使用' },
    best: '最划算',
    ctaTrip: '购买旅行通行证',
    ctaYear: '开始3天免费试用',
    ctaLife: '购买终身版',
    fine: '随时可取消。',
    soon: '支付功能即将开放。今天不会扣费。',
    thanks: '你来早了！支付功能马上开放。',
    close: '关闭',
  },
  ko: {
    headline: '현지인처럼 욕해요.',
    sub: `모든 욕과 생존 표현을 ${LANG_COUNT}개 언어로, 진짜 목소리로.`,
    checks: [`욕 ${INSULTS}개 전부, ${LANG_COUNT}개 언어`, '택시·식당·나이트라이프 팩', '따라 하기 모드: 절반 속도, 따라 할 시간', '앞으로 나올 모든 새 팩'],
    trip: { name: '여행 패스', price: '$2.99', per: '/ 주', note: '여행 한 번에 딱' },
    year: { name: '연간', price: '$29.99', per: '/ 년', note: '주당 $0.58 · 3일 무료' },
    life: { name: '평생', price: '$49.99', per: '1회 결제', note: '한 번 결제로 평생 사용' },
    best: '가장 저렴',
    ctaTrip: '여행 패스 받기',
    ctaYear: '3일 무료 체험 시작',
    ctaLife: '평생 이용권 구매',
    fine: '언제든 해지할 수 있어요.',
    soon: '결제는 곧 열려요. 오늘은 청구되지 않아요.',
    thanks: '일찍 오셨네요! 결제가 곧 열려요.',
    close: '닫기',
  },
  th: {
    headline: 'ด่าให้เหมือนคนท้องถิ่น',
    sub: `คำด่าและวลีเอาตัวรอดทั้งหมด ${LANG_COUNT} ภาษา ด้วยเสียงจริง`,
    checks: [`คำด่าครบ ${INSULTS} คำ ใน ${LANG_COUNT} ภาษา`, 'แพ็กแท็กซี่ ร้านอาหาร และชีวิตกลางคืน', 'โหมดฝึกพูด: ความเร็วครึ่งเดียว มีเวลาพูดตาม', 'ทุกแพ็กใหม่ในอนาคต'],
    trip: { name: 'พาสทริป', price: '$2.99', per: '/ สัปดาห์', note: 'เหมาะกับหนึ่งทริป' },
    year: { name: 'รายปี', price: '$29.99', per: '/ ปี', note: 'แค่ $0.58/สัปดาห์ · ฟรี 3 วัน' },
    life: { name: 'ตลอดชีพ', price: '$49.99', per: 'ครั้งเดียว', note: 'จ่ายครั้งเดียว ใช้ได้ตลอดไป' },
    best: 'คุ้มที่สุด',
    ctaTrip: 'ซื้อพาสทริป',
    ctaYear: 'เริ่มทดลองฟรี 3 วัน',
    ctaLife: 'ซื้อแบบตลอดชีพ',
    fine: 'ยกเลิกได้ทุกเมื่อ',
    soon: 'ระบบชำระเงินจะเปิดเร็วๆ นี้ วันนี้ยังไม่มีการเรียกเก็บเงิน',
    thanks: 'คุณมาเร็ว! ระบบชำระเงินจะเปิดเร็วๆ นี้',
    close: 'ปิด',
  },
  id: {
    headline: 'Maki kayak orang lokal.',
    sub: `Semua makian dan frasa bertahan hidup, dalam ${LANG_COUNT} bahasa, dengan suara asli.`,
    checks: [`Semua ${INSULTS} makian, dalam ${LANG_COUNT} bahasa`, 'Paket Taksi, Restoran, dan Hiburan malam', 'Mode latihan: setengah kecepatan, ada waktu mengulang', 'Setiap paket baru'],
    trip: { name: 'Pas Perjalanan', price: 'US$2,99', per: '/ minggu', note: 'Pas untuk satu perjalanan' },
    year: { name: 'Tahunan', price: 'US$29,99', per: '/ tahun', note: 'Cuma US$0,58/minggu · gratis 3 hari' },
    life: { name: 'Seumur hidup', price: 'US$49,99', per: 'sekali bayar', note: 'Bayar sekali, punya selamanya' },
    best: 'Paling hemat',
    ctaTrip: 'Ambil Pas Perjalanan',
    ctaYear: 'Mulai 3 hari gratis',
    ctaLife: 'Beli seumur hidup',
    fine: 'Bisa batal kapan saja.',
    soon: 'Pembayaran segera dibuka. Hari ini tidak ada tagihan.',
    thanks: 'Kamu datang lebih awal! Pembayaran segera dibuka.',
    close: 'Tutup',
  },
} satisfies Record<HomeLang, unknown>

export function Paywall({ home, onClose }: { home: HomeLang; onClose: () => void }) {
  const t = COPY[home]
  const [plan, setPlan] = useState<Plan>('year')
  const [tapped, setTapped] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="paywall" role="dialog" aria-modal="true" aria-label={t.headline}>
      <button className="close" onClick={onClose} aria-label={t.close}>×</button>
      <div className="pw-inner">
        <div className="pw-logo"><Logo size={84} /></div>
        <h1 className="pw-title">{t.headline}</h1>
        <p className="pw-sub">{t.sub}</p>

        <ul className="pw-checks">
          {t.checks.map((c, i) => (
            <li key={c} style={{ '--i': i } as CSSProperties}>
              <span className="pw-tick" aria-hidden="true">✓</span>
              {c}
            </li>
          ))}
        </ul>

        <div className="pw-plans" role="radiogroup">
          {(['trip', 'year', 'life'] as Plan[]).map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={plan === p}
              className={`pw-plan${plan === p ? ' on' : ''}`}
              onClick={() => {
                tick()
                setPlan(p)
                setTapped(false)
              }}
            >
              {p === 'year' && <span className="pw-badge">{t.best}</span>}
              <span className="pw-plan-name">{t[p].name}</span>
              <span className="pw-price">
                <b>{t[p].price}</b> {t[p].per}
              </span>
              <span className="pw-note">{t[p].note}</span>
            </button>
          ))}
        </div>

        <button className="primary pw-cta" onClick={() => { tap(); setTapped(true) }}>
          {{ trip: t.ctaTrip, year: t.ctaYear, life: t.ctaLife }[plan]}
        </button>
        <p className={`pw-fine${tapped ? ' tapped' : ''}`} aria-live="polite">
          {tapped ? t.thanks : `${t.fine} ${t.soon}`}
        </p>
      </div>
    </div>
  )
}
