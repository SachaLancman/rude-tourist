import { useEffect, useState } from 'react'
import { Flag } from './Flag'
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

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button className={`select${value ? '' : ' unset'}`} onClick={() => setOpen(true)} aria-haspopup="listbox" aria-label={label}>
        {value && <Flag lang={value} size={28} />}
        <span className="select-name">{value ? nameOf(value) : placeholder}</span>
        <span className="select-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
            <p className="sheet-title">{label}</p>
            <ul className="sheet-list" role="listbox" aria-label={label}>
              {options.map((l) => (
                <li key={l}>
                  <button
                    role="option"
                    aria-selected={l === value}
                    className={l === value ? 'on' : ''}
                    onClick={() => {
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
          </div>
        </div>
      )}
    </>
  )
}
