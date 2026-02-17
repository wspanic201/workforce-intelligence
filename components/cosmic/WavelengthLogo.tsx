'use client';

export function WavelengthMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wl-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Sine wave path */}
      <path
        d="M2,16 C6,6 10,6 14,16 C18,26 22,26 26,16 C28,11 30,10 30,12"
        stroke="url(#wl-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function WavelengthWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <WavelengthMark className="w-7 h-7" />
      <span className="text-gradient-cosmic font-heading font-bold tracking-tight">
        Wavelength
      </span>
    </span>
  );
}
