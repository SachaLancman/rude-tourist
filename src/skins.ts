import type { HomeLang } from './phrases'

// Visual looks. Colors live in App.css under :root[data-skin='<id>']; "postcard" is the default
// look and has no attribute. `swatch` is only for the picker preview: page, accent, then two tile colors.
export type Skin = 'postcard' | 'neon' | 'tabloid' | 'riviera'

export const SKINS: { id: Skin; name: Record<HomeLang, string>; swatch: string[] }[] = [
  { id: 'postcard', name: { en: 'Postcard', fr: 'Carte postale', es: 'Postal', de: 'Postkarte', it: 'Cartolina', pt: 'Cartão-postal', nl: 'Ansichtkaart', pl: 'Pocztówka', tr: 'Kartpostal', el: 'Καρτ ποστάλ', ja: 'ポストカード', zh: '明信片', ko: '엽서', th: 'โปสการ์ด', id: 'Kartu Pos' }, swatch: ['#f6efe3', '#d9774f', '#a9bb9a', '#f1d38a'] },
  { id: 'neon', name: { en: 'Neon Night', fr: 'Nuit néon', es: 'Noche neón', de: 'Neonnacht', it: 'Notte al neon', pt: 'Noite neon', nl: 'Neonnacht', pl: 'Neonowa noc', tr: 'Neon Gece', el: 'Νύχτα νέον', ja: 'ネオンナイト', zh: '霓虹之夜', ko: '네온 나이트', th: 'ค่ำคืนนีออน', id: 'Malam Neon' }, swatch: ['#15102a', '#ff4fa3', '#3ee6e0', '#c6f45b'] },
  { id: 'tabloid', name: { en: 'Tabloid', fr: 'Tabloïd', es: 'Tabloide', de: 'Boulevard', it: 'Tabloid', pt: 'Tabloide', nl: 'Roddelblad', pl: 'Tabloid', tr: 'Magazin', el: 'Ταμπλόιντ', ja: 'タブロイド', zh: '小报', ko: '타블로이드', th: 'แท็บลอยด์', id: 'Tabloid' }, swatch: ['#f1efe8', '#e10600', '#ffe14d', '#111111'] },
  { id: 'riviera', name: { en: 'Riviera', fr: 'Riviera', es: 'Riviera', de: 'Riviera', it: 'Riviera', pt: 'Riviera', nl: 'Riviera', pl: 'Riwiera', tr: 'Riviera', el: 'Ριβιέρα', ja: 'リビエラ', zh: '里维埃拉', ko: '리비에라', th: 'ริเวียร่า', id: 'Riviera' }, swatch: ['#fbfaf5', '#1f5fd1', '#9fd3f5', '#ffe36b'] },
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
