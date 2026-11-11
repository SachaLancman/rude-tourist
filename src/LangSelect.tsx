import { useState, type ReactNode } from 'react'
import { Flag } from './Flag'
import { tap, tick } from './haptics'
import { useEscapeLayer } from './layers'
import type { Lang } from './phrases'

// A dropdown that opens as a bottom sheet: flags and names, easy to thumb through on a phone.
export function LangSelect<L extends Lang>({ label, value, options, nameOf, placeholder, onChange }: {
  label: string
  value: L | null
  options: L[]
  nameOf: (l: L) => string
  placeholder: string
  onChange: (l: L) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className={`select${value ? '' : ' unset'}`} onClick={() => { tap(); setOpen(true) }} aria-haspopup="listbox" aria-label={label}>
        {value && <Flag lang={value} size={28} />}
        <span className="select-name">{value ? nameOf(value) : placeholder}</span>
        <span className="select-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <Sheet label={label} onClose={() => setOpen(false)}>
          <ul className="sheet-list" role="listbox" aria-label={label}>
            {options.map((l) => (
              <li key={l}>
                <button
                  role="option"
                  aria-selected={l === value}
                  className={l === value ? 'on' : ''}
                  onClick={() => {
                    tick()
                    onChange(l)
                    setOpen(false)
                  }}
                >
                  <Flag lang={l} size={28} />
                  <span className="select-name">{nameOf(l)}</span>
                  {l === value && <span className="sheet-check" aria-hidden="true">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </>
  )
}

// The open list: a bottom sheet that is its own Escape layer.
function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  useEscapeLayer(onClose)
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <p className="sheet-title">{label}</p>
        {children}
      </div>
    </div>
  )
}
