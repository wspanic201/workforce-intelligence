'use client';

export function WavelengthMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 28"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wl-grad-a" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="wl-grad-b" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Secondary trace — half amplitude, slight offset for depth */}
      <path
        d="M2,16 C5,10 9,10 12,16 C15,22 19,22 22,16 C25,10 29,10 32,16 C35,22 38,20 38,16"
        stroke="url(#wl-grad-b)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Primary wave — 2 cycles */}
      <path
        d="M2,14 C5,4 9,4 12,14 C15,24 19,24 22,14 C25,4 29,4 32,14 C35,24 38,22 38,14"
        stroke="url(#wl-grad-a)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Signal origin dot */}
      <circle cx="2" cy="14" r="2" fill="url(#wl-grad-a)" />
    </svg>
  );
}

export function WavelengthWordmark({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <WavelengthMark className="w-7 h-7" />
      <span className={`font-heading font-bold tracking-tight ${light ? 'text-slate-900' : 'text-gradient-cosmic'}`}>
        Wavelength
      </span>
    </span>
  );
}
