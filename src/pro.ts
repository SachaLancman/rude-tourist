import type { Phrase } from './phrases'

// Free tier: every survival phrase plus these insults, in all languages.
// Everything else (other insults, Taxi, Restaurant, Nightlife, future packs) is Pro.
const FREE_INSULTS = new Set(['idiot', 'shut-up', 'get-lost', 'grandma', 'goldfish', 'lake'])

export function isFree(p: Phrase) {
  return p.cat === 'basic' || FREE_INSULTS.has(p.id)
}

// No purchases exist yet (payments come with the store apps or a Stripe backend),
// so nobody is Pro. Replace with the real entitlement check when payments land.
export const IS_PRO = false

export function isLocked(p: Phrase) {
  return !IS_PRO && !isFree(p)
}

export type Plan = 'trip' | 'year' | 'life'

// Once per app open, a returning user sees the paywall (tip: paywall on every open).
const SESSION_KEY = 'rude-tourist/paywall-seen'

export function paywallSeenThisOpen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return true // storage blocked: don't nag on every render
  }
}

export function markPaywallSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // Storage blocked: nothing to remember.
  }
}
