import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

// Small physical feedback. In the phone app this uses the native haptic engine (iOS and Android);
// in a browser it falls back to navigator.vibrate, which only Android Chrome supports.
const native = Capacitor.isNativePlatform()

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Not supported: silent.
  }
}

function impact(style: ImpactStyle, fallback: number | number[]) {
  if (native) Haptics.impact({ style }).catch(() => {})
  else vibrate(fallback)
}

function notify(type: NotificationType, fallback: number[]) {
  if (native) Haptics.notification({ type }).catch(() => {})
  else vibrate(fallback)
}

/** Light tap: buttons, adding a phrase. */
export const tap = () => impact(ImpactStyle.Light, 10)

/** A choice changed: plan, look, language. */
export const tick = () => {
  if (native) Haptics.selectionChanged().catch(() => {})
  else vibrate(6)
}

/** Opening a phrase. */
export const thump = () => impact(ImpactStyle.Medium, 18)

/** Opening an insult: a one-two punch. */
export const punch = () => {
  impact(ImpactStyle.Heavy, [28, 60, 40])
  if (native) window.setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}), 90)
}

/** Locked: Pro only. */
export const nope = () => notify(NotificationType.Warning, [20, 50, 20])

/** Practice mode: your turn to repeat. */
export const yourTurn = () => notify(NotificationType.Success, [12, 40, 12])
