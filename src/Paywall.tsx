import { useEffect, useState, type CSSProperties } from 'react'
import { Logo } from './Logo'
import { LANGS, PHRASES, type HomeLang } from './phrases'
import type { Plan } from './pro'

// One message, a checklist, two plans, one button (paywall tips #31, #15, #17, #83).
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
    best: 'Best value',
    ctaTrip: 'Get the Trip Pass',
    ctaYear: 'Start my 3-day free trial',
    fine: 'Cancel anytime.',
    soon: 'Payments open soon. Nothing is charged today.',
    thanks: "You're early! Payments open very soon.",
    close: 'Close',
  },
  fr: {
    headline: 'Jure comme un local.',
    sub: `Toutes les insultes et toutes les phrases de survie, en ${LANG_COUNT} langues, avec une vraie voix.`,
    checks: [`Les ${INSULTS} insultes, en ${LANG_COUNT} langues`, 'Packs Taxi, Restaurant et Soirée', 'Entraînement : demi-vitesse, le temps de répéter', 'Chaque nouveau pack'],
    trip: { name: 'Pass Voyage', price: '2,99 $', per: '/ semaine', note: 'Parfait pour un voyage' },
    year: { name: 'Annuel', price: '29,99 $', per: '/ an', note: 'Seulement 0,58 $/semaine · 3 jours offerts' },
    best: 'Meilleure offre',
    ctaTrip: 'Prendre le Pass Voyage',
    ctaYear: 'Commencer mes 3 jours gratuits',
    fine: 'Résiliable à tout moment.',
    soon: "Les paiements arrivent bientôt. Rien n'est débité aujourd'hui.",
    thanks: 'Tu es en avance ! Les paiements arrivent très bientôt.',
    close: 'Fermer',
  },
  es: {
    headline: 'Insulta como un local.',
    sub: `Todos los insultos y todas las frases de supervivencia, en ${LANG_COUNT} idiomas, con una voz real.`,
    checks: [`Los ${INSULTS} insultos, en ${LANG_COUNT} idiomas`, 'Packs Taxi, Restaurante y Fiesta', 'Modo práctica: a media velocidad, con tiempo para repetir', 'Cada nuevo pack'],
    trip: { name: 'Pase de viaje', price: '2,99 $', per: '/ semana', note: 'Perfecto para un viaje' },
    year: { name: 'Anual', price: '29,99 $', per: '/ año', note: 'Solo 0,58 $/semana · 3 días gratis' },
    best: 'Mejor oferta',
    ctaTrip: 'Comprar el Pase de viaje',
    ctaYear: 'Empezar mis 3 días gratis',
    fine: 'Cancela cuando quieras.',
    soon: 'Los pagos llegan pronto. Hoy no se cobra nada.',
    thanks: '¡Llegas pronto! Los pagos abren muy pronto.',
    close: 'Cerrar',
  },
  de: {
    headline: 'Fluch wie ein Einheimischer.',
    sub: `Jede Beleidigung und jeder Überlebenssatz, in ${LANG_COUNT} Sprachen, mit echter Stimme.`,
    checks: [`Alle ${INSULTS} Beleidigungen, in ${LANG_COUNT} Sprachen`, 'Pakete Taxi, Restaurant und Nachtleben', 'Übungsmodus: halbes Tempo, Zeit zum Nachsprechen', 'Jedes neue Paket'],
    trip: { name: 'Reisepass', price: '2,99 $', per: '/ Woche', note: 'Perfekt für eine Reise' },
    year: { name: 'Jährlich', price: '29,99 $', per: '/ Jahr', note: 'Nur 0,58 $/Woche · 3 Tage gratis' },
    best: 'Bester Preis',
    ctaTrip: 'Reisepass holen',
    ctaYear: 'Meine 3 Gratistage starten',
    fine: 'Jederzeit kündbar.',
    soon: 'Zahlungen kommen bald. Heute wird nichts berechnet.',
    thanks: 'Du bist früh dran! Zahlungen kommen sehr bald.',
    close: 'Schließen',
  },
  it: {
    headline: 'Impreca come un locale.',
    sub: `Ogni insulto e ogni frase di sopravvivenza, in ${LANG_COUNT} lingue, con una voce vera.`,
    checks: [`Tutti i ${INSULTS} insulti, in ${LANG_COUNT} lingue`, 'Pacchetti Taxi, Ristorante e Vita notturna', 'Modalità esercizio: metà velocità, tempo per ripetere', 'Ogni nuovo pacchetto'],
    trip: { name: 'Pass Viaggio', price: '2,99 $', per: '/ settimana', note: 'Perfetto per un viaggio' },
    year: { name: 'Annuale', price: '29,99 $', per: '/ anno', note: 'Solo 0,58 $/settimana · 3 giorni gratis' },
    best: 'Più conveniente',
    ctaTrip: 'Prendi il Pass Viaggio',
    ctaYear: 'Inizia i miei 3 giorni gratis',
    fine: 'Disdici quando vuoi.',
    soon: 'I pagamenti arrivano presto. Oggi non paghi nulla.',
    thanks: 'Sei in anticipo! I pagamenti aprono a breve.',
    close: 'Chiudi',
  },
  pt: {
    headline: 'Xingue como um local.',
    sub: `Todos os insultos e todas as frases de sobrevivência, em ${LANG_COUNT} idiomas, com voz de verdade.`,
    checks: [`Os ${INSULTS} insultos, em ${LANG_COUNT} idiomas`, 'Pacotes Táxi, Restaurante e Balada', 'Modo prática: meia velocidade, tempo para repetir', 'Cada pacote novo'],
    trip: { name: 'Passe de Viagem', price: 'US$ 2,99', per: '/ semana', note: 'Perfeito para uma viagem' },
    year: { name: 'Anual', price: 'US$ 29,99', per: '/ ano', note: 'Só US$ 0,58/semana · 3 dias grátis' },
    best: 'Melhor oferta',
    ctaTrip: 'Pegar o Passe de Viagem',
    ctaYear: 'Começar meus 3 dias grátis',
    fine: 'Cancele quando quiser.',
    soon: 'Pagamentos em breve. Nada é cobrado hoje.',
    thanks: 'Você chegou cedo! Pagamentos abrem em breve.',
    close: 'Fechar',
  },
  nl: {
    headline: 'Scheld als een local.',
    sub: `Elk scheldwoord en elke overlevingszin, in ${LANG_COUNT} talen, met een echte stem.`,
    checks: [`Alle ${INSULTS} scheldwoorden, in ${LANG_COUNT} talen`, 'Pakketten Taxi, Restaurant en Uitgaan', 'Oefenmodus: half tempo, tijd om na te zeggen', 'Elk nieuw pakket'],
    trip: { name: 'Reispas', price: '$ 2,99', per: '/ week', note: 'Perfect voor één reis' },
    year: { name: 'Jaarlijks', price: '$ 29,99', per: '/ jaar', note: 'Maar $ 0,58/week · 3 dagen gratis' },
    best: 'Beste deal',
    ctaTrip: 'Neem de Reispas',
    ctaYear: 'Start mijn 3 gratis dagen',
    fine: 'Altijd opzegbaar.',
    soon: 'Betalen kan binnenkort. Vandaag wordt niets afgeschreven.',
    thanks: 'Je bent vroeg! Betalen kan heel binnenkort.',
    close: 'Sluiten',
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
          {(['trip', 'year'] as Plan[]).map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={plan === p}
              className={`pw-plan${plan === p ? ' on' : ''}`}
              onClick={() => {
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

        <button className="primary pw-cta" onClick={() => setTapped(true)}>
          {plan === 'year' ? t.ctaYear : t.ctaTrip}
        </button>
        <p className={`pw-fine${tapped ? ' tapped' : ''}`} aria-live="polite">
          {tapped ? t.thanks : `${t.fine} ${t.soon}`}
        </p>
      </div>
    </div>
  )
}
