'use client';

import { useId } from 'react';

/**
 * Audio Equalizer Bars
 * Vertical bars pulse at different heights with staggered timing.
 * Gradient fill from purple → blue → teal.
 */

function makeBarConfigs(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const delay = (i * 0.15) % 1.2;
    const duration = 0.8 + (((i * 7) % 5) / 5) * 0.8;
    const minScale = 0.15 + ((i * 3) % 5) / 20;
    const maxScale = 0.5 + ((i * 7) % 10) / 15;
    return { delay, duration, minScale, maxScale };
  });
}

function makeWideBarConfigs(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const delay = (i * 0.08) % 2;
    const duration = 0.6 + (((i * 13) % 7) / 7) * 1.0;
    const center = count / 2;
    const distFromCenter = Math.abs(i - center) / center;
    const baseMax = 0.9 - distFromCenter * 0.5;
    const minScale = 0.08 + (((i * 3) % 7) / 70);
    const maxScale = Math.max(0.2, baseMax + (((i * 11) % 9) / 9 - 0.5) * 0.2);
    return { delay, duration, minScale, maxScale };
  });
}

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
  const uid = useId().replace(/:/g, '');

  const sizeMap = {
    sm: { height: 24, width: 3, gap: 2 },
    md: { height: 40, width: 4, gap: 3 },
    lg: { height: 64, width: 6, gap: 4 },
    xl: { height: 96, width: 8, gap: 5 },
  };

  const s = sizeMap[size];
  const configs = makeBarConfigs(bars);

  const keyframes = configs
    .map(
      (c, i) =>
        `@keyframes eq${uid}${i}{0%{transform:scaleY(${c.minScale})}100%{transform:scaleY(${c.maxScale})}}`
    )
    .join('');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        className={`inline-flex items-end ${className}`}
        style={{ height: s.height, gap: s.gap }}
        role="img"
        aria-label="Audio equalizer animation"
      >
        {configs.map((config, i) => (
          <div
            key={i}
            style={{
              width: s.width,
              height: '100%',
              background: muted
                ? 'linear-gradient(to top, rgba(124,58,237,0.3), rgba(59,130,246,0.2), rgba(20,184,166,0.15))'
                : 'linear-gradient(to top, #7c3aed, #3b82f6, #14b8a6)',
              opacity: muted ? 0.5 : 0.85,
              borderRadius: 9999,
              transformOrigin: 'bottom',
              animation: `eq${uid}${i} ${config.duration}s ease-in-out ${config.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </>
  );
}

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
  const uid = useId().replace(/:/g, '');
  const configs = makeWideBarConfigs(bars);

  const keyframes = configs
    .map(
      (c, i) =>
        `@keyframes eqw${uid}${i}{0%{transform:scaleY(${c.minScale})}100%{transform:scaleY(${c.maxScale})}}`
    )
    .join('');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div
        className={`flex items-end justify-center w-full ${className}`}
        style={{ height, gap: 2 }}
        role="img"
        aria-label="Wavelength equalizer"
      >
        {configs.map((config, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              maxWidth: 4,
              height: '100%',
              background: muted
                ? 'linear-gradient(to top, rgba(124,58,237,0.2), rgba(59,130,246,0.15), rgba(20,184,166,0.1))'
                : 'linear-gradient(to top, rgba(124,58,237,0.7), rgba(59,130,246,0.6), rgba(20,184,166,0.5))',
              borderRadius: 9999,
              transformOrigin: 'bottom',
              animation: `eqw${uid}${i} ${config.duration}s ease-in-out ${config.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </>
  );
}
