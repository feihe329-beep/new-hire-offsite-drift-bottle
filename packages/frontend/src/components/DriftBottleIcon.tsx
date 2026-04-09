interface DriftBottleIconProps {
  size?: number
  className?: string
  tilt?: boolean
}

export function DriftBottleIcon({ size = 120, className = '', tilt = false }: DriftBottleIconProps) {
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 80 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={tilt ? { transform: 'rotate(25deg)' } : undefined}
    >
      {/* Cork */}
      <rect x="30" y="2" width="20" height="12" rx="3" fill="#c4a46b" />
      <rect x="32" y="2" width="16" height="4" rx="2" fill="#d4b47b" />

      {/* Bottle neck */}
      <path d="M28 14 L26 30 L54 30 L52 14 Z" fill="#a8d8f0" fillOpacity="0.55" />
      <path d="M28 14 L26 30" stroke="#7ec8e3" strokeWidth="1" strokeOpacity="0.7" />
      <path d="M52 14 L54 30" stroke="#b8e0f5" strokeWidth="1" strokeOpacity="0.5" />

      {/* Bottle body */}
      <path
        d="M26 30 Q18 40 18 55 L18 90 Q18 108 40 108 Q62 108 62 90 L62 55 Q62 40 54 30 Z"
        fill="#a8d8f0"
        fillOpacity="0.45"
      />
      {/* Glass highlight left */}
      <path
        d="M23 38 Q20 50 20 60 L20 85 Q20 98 26 104"
        stroke="#e0f4ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      {/* Glass highlight right (smaller) */}
      <path
        d="M30 33 Q28 40 28 46"
        stroke="#e0f4ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      {/* Bottle outline */}
      <path
        d="M26 30 Q18 40 18 55 L18 90 Q18 108 40 108 Q62 108 62 90 L62 55 Q62 40 54 30 Z"
        stroke="#7ec8e3"
        strokeWidth="1.5"
        fill="none"
        strokeOpacity="0.8"
      />

      {/* Water inside bottle */}
      <path
        d="M18 72 Q30 68 40 72 Q50 76 62 72 L62 90 Q62 108 40 108 Q18 108 18 90 Z"
        fill="#38bdf8"
        fillOpacity="0.3"
      />
      <path
        d="M18 72 Q30 68 40 72 Q50 76 62 72"
        stroke="#38bdf8"
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* Rolled paper / message inside */}
      <rect x="31" y="42" width="18" height="22" rx="2" fill="#fef9c3" fillOpacity="0.9" transform="rotate(-5 40 53)" />
      <line x1="34" y1="48" x2="46" y2="47" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.7" transform="rotate(-5 40 53)" />
      <line x1="34" y1="52" x2="46" y2="51" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.7" transform="rotate(-5 40 53)" />
      <line x1="34" y1="56" x2="42" y2="55" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.7" transform="rotate(-5 40 53)" />

      {/* Neck outline */}
      <path d="M28 14 L26 30 L54 30 L52 14 Z" stroke="#7ec8e3" strokeWidth="1.5" fill="none" strokeOpacity="0.8" />

      {/* Small bubbles */}
      <circle cx="25" cy="85" r="2" fill="#e0f4ff" fillOpacity="0.4" />
      <circle cx="35" cy="92" r="1.5" fill="#e0f4ff" fillOpacity="0.35" />
      <circle cx="55" cy="88" r="1.5" fill="#e0f4ff" fillOpacity="0.35" />
    </svg>
  )
}
