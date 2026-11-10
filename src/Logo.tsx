// The Rude Tourist mark (same drawing as public/logo.svg), inline so its parts can animate:
// the bubble pops in, then swears its symbols one by one while the luggage tag swings.
// Colors come from the current look's CSS tokens (--logo-bubble, --logo-sym, --logo-tag, --hard).
export function Logo({ size = 112, plate = false, animate = false }: { size?: number; plate?: boolean; animate?: boolean }) {
  const hard = { fill: 'var(--hard)' }
  return (
    <svg
      className={`logo-mark${animate ? ' logo-anim' : ''}`}
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-hidden="true"
    >
      {plate && <rect width="512" height="512" rx="112" style={{ fill: 'var(--paper)' }} />}
      <g className="lg-bubble">
        <g transform="translate(10 12)" style={hard}>
          <rect x="56" y="104" width="400" height="272" rx="96" />
          <path d="M118 330 L88 452 L224 362 Z" />
        </g>
        <g style={{ fill: 'var(--logo-bubble)' }}>
          <rect x="56" y="104" width="400" height="272" rx="96" />
          <path d="M118 330 L88 452 L224 362 Z" />
        </g>
      </g>
      <g style={{ fill: 'var(--logo-sym)' }}>
        <path className="lg-sym lg-bolt" d="M176 160 L124 252 L160 252 L140 324 L206 222 L168 222 L192 160 Z" />
        <path
          className="lg-sym lg-star"
          d="M262 186 L274.9 220.2 L311.5 221.9 L282.9 244.8 L292.6 280.1 L262 260 L231.4 280.1 L241.1 244.8 L212.5 221.9 L249.1 220.2 Z"
        />
        <g className="lg-sym lg-bang">
          <rect x="350" y="170" width="34" height="92" rx="17" />
          <circle cx="367" cy="300" r="19" />
        </g>
      </g>
      <g transform="rotate(16 430 96)">
        <g className="lg-tag">
          <path d="M384 62 C 366 74, 356 100, 372 116" fill="none" style={{ stroke: 'var(--hard)' }} strokeWidth="7" strokeLinecap="round" />
          <path
            d="M404 58 h76 a12 12 0 0 1 12 12 v56 a12 12 0 0 1 -12 12 h-76 l-28 -40 z"
            style={{ fill: 'var(--logo-tag)', stroke: 'var(--hard)' }}
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <circle cx="398" cy="98" r="8" style={hard} />
          <rect x="420" y="84" width="54" height="8" rx="4" style={hard} opacity="0.35" />
          <rect x="420" y="104" width="36" height="8" rx="4" style={hard} opacity="0.35" />
        </g>
      </g>
    </svg>
  )
}
