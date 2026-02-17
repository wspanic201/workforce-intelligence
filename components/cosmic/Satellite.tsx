'use client';

/**
 * Ground-based satellite dish (radio telescope) anchored to the bottom-left corner.
 * Points upward toward the stars at the top of the page.
 * Makes the whole page feel like a scene — an observatory looking at the cosmos.
 */
export function Satellite({ className = '' }: { className?: string }) {
  return (
    <div
      className={`fixed bottom-0 left-0 pointer-events-none z-[1] ${className}`}
      style={{ width: '40vw', maxWidth: 500, minWidth: 280 }}
    >
      {/* Signal beam shooting up and to the right */}
      <div
        className="absolute bottom-[45%] left-[55%] w-px origin-bottom"
        style={{
          height: '60vh',
          transform: 'rotate(-25deg)',
          background: 'linear-gradient(to top, rgba(124,58,237,0.25), rgba(59,130,246,0.1), transparent)',
        }}
      >
        {/* Traveling dots up the beam */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400/60"
          style={{ animation: 'dishBeam 4s ease-out infinite' }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400/50"
          style={{ animation: 'dishBeam 4s ease-out 1.3s infinite' }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400/40"
          style={{ animation: 'dishBeam 4s ease-out 2.6s infinite' }}
        />
      </div>

      {/* Expanding signal waves from the dish */}
      <div className="absolute bottom-[44%] left-[54%]">
        {[0, 1.2, 2.4].map((delay, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-500/15"
            style={{
              width: 60 + i * 40,
              height: 60 + i * 40,
              animation: `dishWave 4s ease-out ${delay}s infinite`,
              transform: `translate(-50%, -50%) rotate(-25deg)`,
            }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.15))' }}
      >
        {/* Ground / horizon line */}
        <rect x="0" y="370" width="500" height="30" fill="url(#groundFade)" />

        {/* Support base — concrete pad */}
        <rect x="145" y="350" width="100" height="25" rx="3" fill="#0c1020" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <rect x="155" y="355" width="80" height="4" rx="1" fill="rgba(255,255,255,0.03)" />

        {/* Vertical support column */}
        <rect x="183" y="200" width="24" height="155" fill="url(#columnGrad)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        {/* Column detail lines */}
        <line x1="190" y1="220" x2="190" y2="350" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <line x1="200" y1="220" x2="200" y2="350" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

        {/* Cross braces */}
        <line x1="183" y1="280" x2="207" y2="280" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="183" y1="320" x2="207" y2="320" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="160" y1="350" x2="183" y2="300" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1="230" y1="350" x2="207" y2="300" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Dish mount / pivot */}
        <circle cx="195" cy="200" r="8" fill="#111830" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="195" cy="200" r="3" fill="#7c3aed" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Dish arm (angled upward-right) */}
        <line x1="195" y1="200" x2="280" y2="95" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" />

        {/* The parabolic dish */}
        <g transform="translate(280, 95) rotate(-35)">
          {/* Dish shape — parabolic curve */}
          <path
            d="M-80,0 C-75,-65 -40,-110 0,-120 C40,-110 75,-65 80,0"
            fill="url(#dishFill)"
            stroke="url(#dishStroke)"
            strokeWidth="2"
          />
          {/* Inner dish detail rings */}
          <path
            d="M-55,0 C-50,-45 -27,-76 0,-82 C27,-76 50,-45 55,0"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.8"
          />
          <path
            d="M-30,0 C-27,-25 -14,-42 0,-46 C14,-42 27,-25 30,0"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.8"
          />

          {/* Feed horn at focal point */}
          <line x1="0" y1="0" x2="0" y2="-50" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <circle cx="0" cy="-52" r="4" fill="#1e1b4b" stroke="rgba(124,58,237,0.4)" strokeWidth="1" />
          <circle cx="0" cy="-52" r="1.5" fill="#7c3aed" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* Sub-reflector supports */}
          <line x1="-40" y1="-5" x2="0" y2="-48" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="40" y1="-5" x2="0" y2="-48" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        </g>

        {/* Status lights on base */}
        <circle cx="165" cy="360" r="2" fill="#00ff88" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="175" cy="360" r="2" fill="#3b82f6" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="185" cy="360" r="2" fill="#7c3aed" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1.4s" repeatCount="indefinite" />
        </circle>

        <defs>
          <linearGradient id="groundFade" x1="0" y1="370" x2="0" y2="400">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#050510" />
          </linearGradient>
          <linearGradient id="columnGrad" x1="183" y1="200" x2="207" y2="200">
            <stop offset="0%" stopColor="#0a0f1e" />
            <stop offset="50%" stopColor="#111830" />
            <stop offset="100%" stopColor="#0a0f1e" />
          </linearGradient>
          <linearGradient id="dishFill" x1="-80" y1="0" x2="80" y2="-120">
            <stop offset="0%" stopColor="#0c1025" />
            <stop offset="50%" stopColor="#111835" />
            <stop offset="100%" stopColor="#0c1025" />
          </linearGradient>
          <linearGradient id="dishStroke" x1="-80" y1="0" x2="80" y2="-120">
            <stop offset="0%" stopColor="rgba(124,58,237,0.2)" />
            <stop offset="50%" stopColor="rgba(59,130,246,0.3)" />
            <stop offset="100%" stopColor="rgba(20,184,166,0.2)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dishBeam {
          0% { bottom: 0; opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.3; }
          100% { bottom: 100%; opacity: 0; }
        }
        @keyframes dishWave {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
      `}} />
    </div>
  );
}
