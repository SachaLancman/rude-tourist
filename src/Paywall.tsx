import { useEffect, useState, type CSSProperties } from 'react'
import { Logo } from './Logo'
import type { HomeLang } from './phrases'
import type { Plan } from './pro'

// One message, a checklist, two plans, one button (paywall tips #31, #15, #17, #83).
// Payments are not wired yet, so the button only says so and charges nothing.
const COPY = {
  en: {
    headline: 'Swear like a local.',
    sub: 'Every insult and every survival line, in 11 languages, spoken by a real voice.',
    checks: ['All 16 insults, in 11 languages', 'Taxi, Restaurant & Nightlife packs', 'Every new pack we add', 'Real voices and pronunciation'],
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
    sub: 'Toutes les insultes et toutes les phrases de survie, en 11 langues, avec une vraie voix.',
    checks: ['Les 16 insultes, en 11 langues', 'Packs Taxi, Restaurant et Soirée', 'Chaque nouveau pack', 'Vraies voix et prononciation'],
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
