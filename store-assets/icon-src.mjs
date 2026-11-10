// Writes the icon and splash SVGs from the logo artwork (public/logo.svg).
// Run: node store-assets/icon-src.mjs, then render each SVG to PNG (see README).
// Store icons are full-bleed squares: the stores round the corners themselves.
// assets/ holds the Android/iOS sources that `npx @capacitor/assets generate` turns into app icons.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const appAssets = join(here, '..', 'assets')
mkdirSync(appAssets, { recursive: true })

const COLORS = {
  cream: { bg: '#f6efe3', bubble: '#d9774f', sym: '#fff8f0' },
  terracotta: { bg: '#d9774f', bubble: '#fff8f0', sym: '#d9774f' },
}

// The logo drawing in its own 512-unit space; `transform` places it.
const art = (c, transform) => `  <g transform="${transform}">
    <g transform="translate(10 12)" fill="#2b2420">
      <rect x="56" y="104" width="400" height="272" rx="96"/>
      <path d="M118 330 L88 452 L224 362 Z"/>
    </g>
    <g fill="${c.bubble}">
      <rect x="56" y="104" width="400" height="272" rx="96"/>
      <path d="M118 330 L88 452 L224 362 Z"/>
    </g>
    <g fill="${c.sym}">
      <path d="M176 160 L124 252 L160 252 L140 324 L206 222 L168 222 L192 160 Z"/>
      <path d="M262 186 L274.9 220.2 L311.5 221.9 L282.9 244.8 L292.6 280.1 L262 260 L231.4 280.1 L241.1 244.8 L212.5 221.9 L249.1 220.2 Z"/>
      <rect x="350" y="170" width="34" height="92" rx="17"/>
      <circle cx="367" cy="300" r="19"/>
    </g>
    <g transform="rotate(16 430 96)">
      <path d="M384 62 C 366 74, 356 100, 372 116" fill="none" stroke="#2b2420" stroke-width="7" stroke-linecap="round"/>
      <path d="M404 58 h76 a12 12 0 0 1 12 12 v56 a12 12 0 0 1 -12 12 h-76 l-28 -40 z" fill="#f1d38a" stroke="#2b2420" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="398" cy="98" r="8" fill="#2b2420"/>
      <rect x="420" y="84" width="54" height="8" rx="4" fill="#2b2420" opacity="0.35"/>
      <rect x="420" y="104" width="36" height="8" rx="4" fill="#2b2420" opacity="0.35"/>
    </g>
  </g>`

// The drawing spans about x 56-495, y 40-464; this centres it at (cx, cy) at `width` pixels wide.
const place = (cx, cy, width) => {
  const k = width / 440
  return `translate(${(cx - 275 * k).toFixed(1)} ${(cy - 252 * k).toFixed(1)}) scale(${k.toFixed(4)})`
}
const svg = (size, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
${bg ? `  <rect width="${size}" height="${size}" fill="${bg}"/>\n` : ''}${body}
</svg>
`

for (const [name, c] of Object.entries(COLORS)) {
  writeFileSync(join(here, `icon-${name}.svg`), svg(1024, art(c, place(512, 512, 682)), c.bg))
}

// Android adaptive icon: the drawing stays inside the 66% safe zone, on a flat terracotta layer.
const t = COLORS.terracotta
writeFileSync(join(appAssets, 'icon-only.svg'), svg(1024, art(t, place(512, 512, 682)), t.bg))
writeFileSync(join(appAssets, 'icon-foreground.svg'), svg(1024, art(t, place(512, 512, 560))))
writeFileSync(join(appAssets, 'icon-background.svg'), svg(1024, '', t.bg))
// Splash: the cream logo on the app's paper colour, light and dark.
writeFileSync(join(appAssets, 'splash.svg'), svg(2732, art(COLORS.cream, place(1366, 1366, 900)), '#f6efe3'))
writeFileSync(join(appAssets, 'splash-dark.svg'), svg(2732, art(COLORS.cream, place(1366, 1366, 900)), '#221d1a'))
console.log('ok')
