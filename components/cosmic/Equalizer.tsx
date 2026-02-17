'use client';

/**
 * Audio Equalizer Bars — CSS-only
 * Vertical bars pulse at different heights with staggered timing.
 * Gradient fill from purple → blue → teal.
 *
 * Usage:
 *   <Equalizer />                          — default 7 bars
 *   <Equalizer bars={5} size="sm" />       — small, 5 bars
 *   <Equalizer bars={12} size="lg" />      — large, 12 bars
 *   <Equalizer muted />                    — subtle/background mode
 */

export function Equalizer({
  bars = 7,
  size = 'md',
  muted = false,
  className = '',
}: {
  bars?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  muted?: boolean;
  className?: string;
}) {
  const sizeMap = {
    sm: { height: 24, width: 3, gap: 2 },
    md: { height: 40, width: 4, gap: 3 },
    lg: { height: 64, width: 6, gap: 4 },
    xl: { height: 96, width: 8, gap: 5 },
  };

  const s = sizeMap[size];

  // Each bar gets a unique animation with different timing
  const barConfigs = Array.from({ length: bars }, (_, i) => {
    // Distribute delays and durations for organic feel
    const delay = (i * 0.15) % 1.2;
    // Use golden ratio-ish offsets so bars don't sync up
    const duration = 0.8 + (((i * 7) % 5) / 5) * 0.8;
    // Each bar has different min/max heights for variety
    const minScale = 0.15 + ((i * 3) % 5) / 20;
    const maxScale = 0.5 + ((i * 7) % 10) / 15;

    return { delay, duration, minScale, maxScale };
  });

  return (
    <div
      className={`inline-flex items-end ${className}`}
      style={{ height: s.height, gap: s.gap }}
      role="img"
      aria-label="Audio equalizer animation"
    >
      {barConfigs.map((config, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: s.width,
            height: '100%',
            background: muted
              ? 'linear-gradient(to top, rgba(124,58,237,0.3), rgba(59,130,246,0.2), rgba(20,184,166,0.15))'
              : 'linear-gradient(to top, #7c3aed, #3b82f6, #14b8a6)',
            opacity: muted ? 0.5 : 0.85,
            transformOrigin: 'bottom',
            animation: `eq-pulse-${i} ${config.duration}s ease-in-out ${config.delay}s infinite alternate`,
          }}
        />
      ))}

      <style jsx>{`
        ${barConfigs
          .map(
            (config, i) => `
          @keyframes eq-pulse-${i} {
            0% { transform: scaleY(${config.minScale}); }
            100% { transform: scaleY(${config.maxScale}); }
          }
        `
          )
          .join('\n')}
      `}</style>
    </div>
  );
}

/**
 * Wide equalizer bar — spans full width, great for section dividers or hero accents
 */
export function EqualizerWide({
  bars = 48,
  height = 48,
  muted = false,
  className = '',
}: {
  bars?: number;
  height?: number;
  muted?: boolean;
  className?: string;
}) {
  const barConfigs = Array.from({ length: bars }, (_, i) => {
    const delay = (i * 0.08) % 2;
    const duration = 0.6 + (((i * 13) % 7) / 7) * 1.0;
    // Bell curve distribution — taller in middle
    const center = bars / 2;
    const distFromCenter = Math.abs(i - center) / center;
    const baseMax = 0.9 - distFromCenter * 0.5;
    const minScale = 0.08 + Math.random() * 0.08;
    const maxScale = Math.max(0.2, baseMax + (Math.random() - 0.5) * 0.2);

    return { delay, duration, minScale, maxScale };
  });

  return (
    <div
      className={`flex items-end justify-center w-full ${className}`}
      style={{ height, gap: 2 }}
      role="img"
      aria-label="Wavelength equalizer"
    >
      {barConfigs.map((config, i) => (
        <div
          key={i}
          className="rounded-full flex-1"
          style={{
            maxWidth: 4,
            height: '100%',
            background: muted
              ? 'linear-gradient(to top, rgba(124,58,237,0.2), rgba(59,130,246,0.15), rgba(20,184,166,0.1))'
              : 'linear-gradient(to top, rgba(124,58,237,0.7), rgba(59,130,246,0.6), rgba(20,184,166,0.5))',
            transformOrigin: 'bottom',
            animation: `eq-wide-${i} ${config.duration}s ease-in-out ${config.delay}s infinite alternate`,
          }}
        />
      ))}

      <style jsx>{`
        ${barConfigs
          .map(
            (config, i) => `
          @keyframes eq-wide-${i} {
            0% { transform: scaleY(${config.minScale}); }
            100% { transform: scaleY(${config.maxScale}); }
          }
        `
          )
          .join('\n')}
      `}</style>
    </div>
  );
}
