'use client';

/**
 * Satellite pointing upward with signal rings + beam toward the stars.
 * Place at the bottom of the page as a visual bookend to the stars at the top.
 */
export function Satellite({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Signal beam shooting upward */}
      <div className="relative w-px h-32 md:h-48 mb-4">
        <div
          className="absolute inset-0 w-px mx-auto"
          style={{
            background:
              'linear-gradient(to top, rgba(124,58,237,0.4), rgba(59,130,246,0.2), transparent)',
          }}
        />
        {/* Pulsing dots traveling up the beam */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"
          style={{
            animation: 'satBeamDot 3s ease-out infinite',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"
          style={{
            animation: 'satBeamDot 3s ease-out 1s infinite',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-400"
          style={{
            animation: 'satBeamDot 3s ease-out 2s infinite',
          }}
        />
      </div>

      {/* Signal rings */}
      <div className="relative mb-2">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-purple-500/20"
          style={{ animation: 'satRing 4s ease-out infinite' }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-blue-500/25"
          style={{ animation: 'satRing 4s ease-out 1.3s infinite' }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-teal-500/30"
          style={{ animation: 'satRing 4s ease-out 2.6s infinite' }}
        />
      </div>

      {/* Satellite SVG */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        style={{ filter: 'drop-shadow(0 0 12px rgba(124,58,237,0.4))' }}
      >
        {/* Satellite body */}
        <rect
          x="45"
          y="42"
          width="30"
          height="22"
          rx="4"
          fill="url(#satBody)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {/* Antenna dish pointing up */}
        <path
          d="M60 42 L60 22"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse
          cx="60"
          cy="18"
          rx="8"
          ry="5"
          fill="url(#satDish)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        {/* Antenna tip glow */}
        <circle cx="60" cy="14" r="2" fill="#7c3aed" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Solar panel left */}
        <rect x="8" y="46" width="32" height="14" rx="2" fill="url(#satPanel)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <line x1="16" y1="46" x2="16" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="24" y1="46" x2="24" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="32" y1="46" x2="32" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Panel arm */}
        <line x1="40" y1="53" x2="45" y2="53" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        {/* Solar panel right */}
        <rect x="80" y="46" width="32" height="14" rx="2" fill="url(#satPanel)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <line x1="88" y1="46" x2="88" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="96" y1="46" x2="96" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="104" y1="46" x2="104" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Panel arm */}
        <line x1="75" y1="53" x2="80" y2="53" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        {/* Status lights on body */}
        <circle cx="52" cy="53" r="1.5" fill="#00ff88">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="58" cy="53" r="1.5" fill="#3b82f6">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="64" cy="53" r="1.5" fill="#7c3aed">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </circle>

        <defs>
          <linearGradient id="satBody" x1="45" y1="42" x2="75" y2="64">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="satDish" x1="52" y1="13" x2="68" y2="23">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="satPanel" x1="0" y1="46" x2="0" y2="60">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f2942" />
          </linearGradient>
        </defs>
      </svg>

      {/* Label */}
      <p className="mt-4 text-xs text-white/30 tracking-widest uppercase">
        Tuned In
      </p>

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes satRing {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes satBeamDot {
          0% { bottom: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.5; }
          100% { bottom: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
