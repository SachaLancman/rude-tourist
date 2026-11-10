// SVG flags (flag-icons, MIT). Emoji flags show as two letters on Windows, so the app draws its own.
import br from 'flag-icons/flags/4x3/br.svg'
import cn from 'flag-icons/flags/4x3/cn.svg'
import de from 'flag-icons/flags/4x3/de.svg'
import es from 'flag-icons/flags/4x3/es.svg'
import fr from 'flag-icons/flags/4x3/fr.svg'
import gb from 'flag-icons/flags/4x3/gb.svg'
import gr from 'flag-icons/flags/4x3/gr.svg'
import id from 'flag-icons/flags/4x3/id.svg'
import it from 'flag-icons/flags/4x3/it.svg'
import jp from 'flag-icons/flags/4x3/jp.svg'
import kr from 'flag-icons/flags/4x3/kr.svg'
import nl from 'flag-icons/flags/4x3/nl.svg'
import pl from 'flag-icons/flags/4x3/pl.svg'
import pt from 'flag-icons/flags/4x3/pt.svg'
import th from 'flag-icons/flags/4x3/th.svg'
import tr from 'flag-icons/flags/4x3/tr.svg'
import type { Lang } from './phrases'

const FLAGS: Record<Lang, string> = {
  en: gb, fr, es, it, de, pt: br, 'pt-pt': pt, nl, ja: jp, el: gr, tr, pl, zh: cn, ko: kr, th, id,
}

export function Flag({ lang, size = 22 }: { lang: Lang; size?: number }) {
  return <img className="flag" src={FLAGS[lang]} width={size} height={Math.round((size * 3) / 4)} alt="" aria-hidden="true" />
}
