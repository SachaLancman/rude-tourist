import type { HomeLang } from './phrases'

// Visual looks. Colors live in App.css under :root[data-skin='<id>']; "postcard" is the default
// look and has no attribute. `swatch` is only for the picker preview: page, accent, then two tile colors.
export type Skin = 'postcard' | 'neon' | 'tabloid' | 'riviera'

export const SKINS: { id: Skin; name: Record<HomeLang, string>; swatch: string[] }[] = [
  { id: 'postcard', name: { en: 'Postcard', fr: 'Carte postale' }, swatch: ['#f6efe3', '#d9774f', '#a9bb9a', '#f1d38a'] },
  { id: 'neon', name: { en: 'Neon Night', fr: 'Nuit néon' }, swatch: ['#15102a', '#ff4fa3', '#3ee6e0', '#c6f45b'] },
  { id: 'tabloid', name: { en: 'Tabloid', fr: 'Tabloïd' }, swatch: ['#f1efe8', '#e10600', '#ffe14d', '#111111'] },
  { id: 'riviera', name: { en: 'Riviera', fr: 'Riviera' }, swatch: ['#fbfaf5', '#1f5fd1', '#9fd3f5', '#ffe36b'] },
]

const KEY = 'rude-tourist/skin'

export function loadSkin(): Skin {
  try {
    const s = localStorage.getItem(KEY) as Skin | null
    return s && SKINS.some((k) => k.id === s) ? s : 'postcard'
  } catch {
    return 'postcard'
  }
}

export function applySkin(skin: Skin) {
  const root = document.documentElement
  if (skin === 'postcard') delete root.dataset.skin
  else root.dataset.skin = skin
  try {
    localStorage.setItem(KEY, skin)
  } catch {
    // Storage blocked: the look still applies for this visit.
  }
}
