import { useEffect, useRef } from 'react'

// Escape closes only the topmost layer (phrase card, look picker, paywall, language sheet).
// Each open layer registers itself here; the most recently opened one is on top.
const stack: (() => void)[] = []

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && stack.length) stack[stack.length - 1]()
  })
}

export function useEscapeLayer(onEscape: () => void) {
  const latest = useRef(onEscape)
  latest.current = onEscape
  useEffect(() => {
    const entry = () => latest.current()
    stack.push(entry)
    return () => {
      stack.splice(stack.indexOf(entry), 1)
    }
  }, [])
}
