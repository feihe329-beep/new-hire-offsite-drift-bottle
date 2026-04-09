import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function starPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const radius = i % 2 === 0 ? r : r * 0.4
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`
  })
  return `M${pts.join('L')}Z`
}

export function Landing() {
  const [revealed, setRevealed] = useState(false)
  const navigate = useNavigate()

  const floatingStars = [
    { x: 180, y: 560, r: 14, delay: '0s', dur: '3s' },
    { x: 320, y: 620, r: 10, delay: '0.8s', dur: '4s' },
    { x: 1100, y: 570, r: 16, delay: '0.4s', dur: '3.5s' },
    { x: 1240, y: 640, r: 10, delay: '1.2s', dur: '4.2s' },
    { x: 90, y: 680, r: 8, delay: '1.6s', dur: '3.8s' },
    { x: 440, y: 700, r: 7, delay: '2s', dur: '5s' },
    { x: 980, y: 710, r: 9, delay: '0.6s', dur: '4.5s' },
    { x: 820, y: 660, r: 6, delay: '1.4s', dur: '3.2s' },
  ]

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 100% 55% at 50% 20%, rgba(90,40,180,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 70% 40% at 20% 45%, rgba(30,15,120,0.45) 0%, transparent 65%),
            radial-gradient(ellipse 60% 35% at 80% 35%, rgba(15,50,200,0.35) 0%, transparent 65%),
            radial-gradient(ellipse 50% 30% at 55% 60%, rgba(10,80,160,0.3) 0%, transparent 60%),
            linear-gradient(180deg, #04001a 0%, #080230 22%, #0e0650 42%, #091060 52%, #060c48 68%, #020820 100%)
          `,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 140% 25% at 50% 48%, rgba(120,80,255,0.18) 0%, transparent 100%),
            radial-gradient(ellipse 80% 15% at 50% 48%, rgba(180,140,255,0.12) 0%, transparent 100%)
          `,
        }}
      />

      <svg
        viewBox="0 0 1440 810"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="moon-rg" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fffde8" />
            <stop offset="60%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="glass-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a8d8f0" stopOpacity="0.16" />
            <stop offset="28%" stopColor="#f1fbff" stopOpacity="0.56" />
            <stop offset="72%" stopColor="#cfeeff" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#90c8e8" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="glass-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d3f0ff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3090c8" stopOpacity="0.14" />
          </linearGradient>
          <radialGradient id="inner-glow" cx="45%" cy="42%" r="54%">
            <stop offset="0%" stopColor="#fff6bf" stopOpacity="0.5" />
            <stop offset="72%" stopColor="#8fd4ff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#60a8d0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="water-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1a6a" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#080e4a" />
            <stop offset="100%" stopColor="#030820" />
          </linearGradient>
          <radialGradient id="horizon-glow" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#6644cc" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6644cc" stopOpacity="0" />
          </radialGradient>
          <filter id="star-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="moon-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bottle-glow" x="-30%" y="-20%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sparkle" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {[
          [80, 35, 1.5, 0.9], [200, 18, 1, 0.7], [340, 50, 1.6, 0.85], [480, 28, 1.1, 0.75],
          [580, 62, 1, 0.6], [660, 38, 1.4, 0.88], [740, 22, 1.2, 0.8], [880, 55, 1, 0.65],
          [1000, 30, 1.5, 0.9], [1110, 48, 1.1, 0.7], [1220, 22, 1.3, 0.85], [1380, 40, 1, 0.7],
          [130, 90, 0.9, 0.5], [270, 105, 1.2, 0.65], [430, 82, 1, 0.55], [550, 115, 1.1, 0.7],
          [700, 95, 0.9, 0.5], [860, 108, 1.2, 0.65], [1020, 85, 1, 0.6], [1180, 102, 0.8, 0.5],
          [50, 145, 0.8, 0.4], [390, 158, 1, 0.5], [680, 140, 0.9, 0.45], [950, 155, 1.1, 0.5],
          [1280, 148, 0.8, 0.4], [1430, 68, 1.2, 0.75], [30, 200, 0.7, 0.35], [300, 195, 0.9, 0.4],
          [580, 210, 0.8, 0.38], [820, 202, 1, 0.45], [1100, 195, 0.7, 0.35], [1400, 200, 0.9, 0.4],
        ].map(([cx, cy, r, op], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="white"
            opacity={op}
            style={{ animation: `twinkle ${2 + (i % 4) * 0.6}s ease-in-out ${(i * 0.28) % 3}s infinite alternate` }}
          />
        ))}

        <circle cx="280" cy="155" r="90" fill="url(#moon-rg)" filter="url(#moon-glow)" opacity="0.95" />
        <ellipse cx="255" cy="138" rx="35" ry="12" fill="white" opacity="0.12" />
        <ellipse cx="295" cy="165" rx="28" ry="10" fill="white" opacity="0.1" />
        <ellipse cx="268" cy="182" rx="22" ry="8" fill="white" opacity="0.08" />

        <ellipse cx="720" cy="460" rx="900" ry="80" fill="url(#horizon-glow)" />
        <line x1="0" y1="460" x2="1440" y2="460" stroke="rgba(100,80,220,0.35)" strokeWidth="1" />

        <rect x="0" y="458" width="1440" height="352" fill="url(#water-g)" />

        {[480, 505, 530, 560, 595, 635, 680, 730, 785].map((y, i) => (
          <path
            key={i}
            d={`M0,${y} Q360,${y + (i % 2 ? -6 : 6)} 720,${y} Q1080,${y + (i % 2 ? 6 : -6)} 1440,${y}`}
            stroke={`rgba(${80 + i * 10},${100 + i * 8},${220 - i * 5},${0.08 + i * 0.01})`}
            strokeWidth={1 + i * 0.1}
            fill="none"
            style={{ animation: `wave-drift ${6 + i * 1.2}s linear ${i * 0.8}s infinite` }}
          />
        ))}

        <ellipse cx="720" cy="560" rx="500" ry="60" fill="rgba(80,40,180,0.12)" filter="url(#sparkle)" />
        <ellipse cx="400" cy="640" rx="280" ry="40" fill="rgba(40,20,140,0.1)" filter="url(#sparkle)" />
        <ellipse cx="1050" cy="620" rx="320" ry="45" fill="rgba(20,40,180,0.1)" filter="url(#sparkle)" />

        <ellipse
          cx="282"
          cy="540"
          rx="28"
          ry="110"
          fill="rgba(254,243,193,0.14)"
          filter="url(#sparkle)"
          style={{ animation: 'refl-shimmer 4s ease-in-out infinite' }}
        />
        {[230, 260, 282, 305, 335].map((x, i) => (
          <ellipse key={i} cx={x} cy={500 + i * 14} rx="55" ry="3" fill="rgba(254,243,193,0.06)" />
        ))}

        {floatingStars.map((s, i) => (
          <g key={i}>
            <path
              d={starPath(s.x, s.y, s.r)}
              fill="#ffd700"
              filter="url(#star-glow)"
              opacity="0.9"
              style={{ animation: `star-bob ${s.dur} ease-in-out ${s.delay} infinite alternate` }}
            />
            <ellipse
              cx={s.x}
              cy={s.y + s.r + 6}
              rx={s.r * 1.2}
              ry={s.r * 0.3}
              fill="#ffd700"
              opacity="0.2"
              filter="url(#sparkle)"
            />
          </g>
        ))}

        {[150, 380, 600, 860, 1050, 1300, 520, 750, 1180].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={520 + i * 22}
            r={1.5}
            fill="white"
            opacity="0.5"
            style={{ animation: `twinkle ${2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite alternate` }}
          />
        ))}

        <g onClick={() => setRevealed(true)} style={{ cursor: 'pointer' }}>
          <g style={{ animation: 'bottle-float 4.5s ease-in-out infinite' }}>
            <g transform="translate(720 416) rotate(-12)">

              {/* Outer glow */}
              <g filter="url(#bottle-glow)" opacity="0.52">
                <path
                  d="M-24,-140 L-24,-78 C-24,-38 -82,0 -82,64 C-82,130 -62,160 0,166 C62,160 82,130 82,64 C82,0 24,-38 24,-78 L24,-140 Z"
                  fill="#5ab8f0"
                />
              </g>

              {/* Water shadow */}
              <ellipse cx="0" cy="192" rx="100" ry="14" fill="rgba(60,110,200,0.16)" />

              {/* Bottle body + shoulder + neck (one continuous path) */}
              <path
                d="M-24,-140 L-24,-78 C-24,-38 -82,0 -82,64 C-82,130 -62,160 0,166 C62,160 82,130 82,64 C82,0 24,-38 24,-78 L24,-140 Z"
                fill="url(#glass-fill)"
                stroke="rgba(173,227,255,0.65)"
                strokeWidth="2.5"
              />

              {/* Inner glass glow */}
              <path
                d="M-18,-134 L-18,-80 C-18,-46 -72,-4 -72,62 C-72,124 -54,152 0,158 C54,152 72,124 72,62 C72,-4 18,-46 18,-80 L18,-134 Z"
                fill="url(#inner-glow)"
              />

              {/* Left glass highlight */}
              <path
                d="M-70,8 C-78,48 -78,90 -70,122"
                stroke="rgba(245,251,255,0.38)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M-58,-42 C-48,-72 -36,-94 -24,-102"
                stroke="rgba(245,251,255,0.44)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />

              {/* Right secondary reflection */}
              <path
                d="M44,-58 C52,-28 56,22 52,72"
                stroke="rgba(255,255,255,0.13)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />

              {/* Letter inside the bottle */}
              <g transform="translate(-20 8) rotate(4)">
                <rect width="52" height="80" rx="5" fill="rgba(252,242,200,0.92)" />
                <line x1="9" y1="16" x2="43" y2="16" stroke="#94a3b8" strokeWidth="2" opacity="0.55" />
                <line x1="9" y1="28" x2="43" y2="28" stroke="#94a3b8" strokeWidth="2" opacity="0.55" />
                <line x1="9" y1="40" x2="38" y2="40" stroke="#94a3b8" strokeWidth="2" opacity="0.55" />
                <line x1="9" y1="52" x2="41" y2="52" stroke="#94a3b8" strokeWidth="1.5" opacity="0.42" />
                <line x1="9" y1="62" x2="34" y2="62" stroke="#94a3b8" strokeWidth="1.5" opacity="0.35" />
              </g>

              {/* Stars inside */}
              <path d={starPath(34, -48, 9)} fill="#ffd700" opacity="0.58" filter="url(#star-glow)" />
              <path d={starPath(-24, 104, 6)} fill="#ffd700" opacity="0.42" filter="url(#star-glow)" />

              {/* Neck collar ring */}
              <ellipse cx="0" cy="-140" rx="24" ry="5.5" fill="rgba(173,227,255,0.2)" stroke="rgba(173,227,255,0.52)" strokeWidth="1.5" />

              {/* Cork body */}
              <path
                d="M-23,-140 L-25,-174 Q-25,-182 0,-182 Q25,-182 25,-174 L23,-140 Z"
                fill="rgba(185,138,65,0.97)"
                stroke="rgba(208,168,90,0.6)"
                strokeWidth="1.5"
              />
              {/* Cork grooves */}
              <line x1="-24" y1="-163" x2="24" y2="-163" stroke="rgba(140,96,34,0.35)" strokeWidth="1.5" />
              <line x1="-24" y1="-153" x2="24" y2="-153" stroke="rgba(140,96,34,0.25)" strokeWidth="1" />
              {/* Cork top cap */}
              <ellipse cx="0" cy="-182" rx="18" ry="5" fill="rgba(202,166,86,0.97)" />
              <ellipse cx="-4" cy="-182" rx="8" ry="2.5" fill="rgba(232,204,132,0.55)" />

              {/* Bottle mouth rim */}
              <line x1="-23" y1="-140" x2="23" y2="-140" stroke="rgba(141,215,255,0.9)" strokeWidth="3.5" strokeLinecap="round" />

              {/* Ripple rings */}
              <ellipse
                cx="0"
                cy="182"
                rx="92"
                ry="13"
                fill="none"
                stroke="rgba(100,180,255,0.28)"
                strokeWidth="2"
                style={{ animation: 'ripple-out 3s ease-out infinite' }}
              />
              <ellipse
                cx="0"
                cy="182"
                rx="146"
                ry="21"
                fill="none"
                stroke="rgba(100,180,255,0.14)"
                strokeWidth="1.5"
                style={{ animation: 'ripple-out 3s ease-out 0.8s infinite' }}
              />

              {/* Glass scratch */}
              <path d="M-36,-126 L-54,10" stroke="white" strokeWidth="1" opacity="0.11" strokeLinecap="round" />
            </g>
          </g>

          {!revealed && (
            <text
              x="720"
              y="640"
              textAnchor="middle"
              fontSize="16"
              fill="#93c5fd"
              opacity="0.75"
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              letterSpacing="0.05em"
              style={{ animation: 'hint-pulse 2.2s ease-in-out infinite alternate' }}
            >
              tap the bottle
            </text>
          )}
        </g>
      </svg>

      <style>{`
        @keyframes twinkle { from{opacity:0.25} to{opacity:1} }
        @keyframes wave-drift { from{transform:translateX(0)} to{transform:translateX(-35px)} }
        @keyframes refl-shimmer { 0%,100%{opacity:0.7;transform:scaleX(1)} 50%{opacity:1;transform:scaleX(1.8)} }
        @keyframes ripple-out { 0%{transform:scale(0.6);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes hint-pulse { from{opacity:0.3} to{opacity:0.85} }
        @keyframes star-bob { from{transform:translateY(0)} to{transform:translateY(-10px)} }
        @keyframes bottle-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
      `}</style>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center pointer-events-none"
            style={{ paddingTop: '8vh' }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 18%, rgba(2,4,20,0.75) 0%, transparent 100%)' }}
            />

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="relative text-4xl md:text-6xl font-bold text-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #e8f4ff 0%, #93c5fd 45%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                textShadow: 'none',
              }}
            >
              Send a message to the future
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="relative text-indigo-200/60 text-center text-sm md:text-base mb-10 max-w-xs"
            >
              Lock a message + ETH for someone special.
              <br />
              Unclaimed bottles drift into the pond.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="relative flex gap-4 pointer-events-auto"
            >
              <button
                onClick={() => navigate('/write')}
                className="px-8 py-3 rounded-xl font-semibold text-sm text-white transition"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)',
                  boxShadow: '0 0 40px rgba(99,102,241,0.5)',
                }}
              >
                Write a Message
              </button>
              <button
                onClick={() => navigate('/pond')}
                className="px-8 py-3 rounded-xl font-semibold text-sm text-indigo-200 border border-indigo-400/25 hover:border-indigo-400/50 transition"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}
              >
                Explore the Pond
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
