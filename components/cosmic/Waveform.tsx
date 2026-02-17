'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated audio waveform visualization.
 * Multiple sine waves at different frequencies create a rich
 * "listening to the cosmos" effect behind the hero.
 */
export function Waveform({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const waves = [
      { amplitude: 30, frequency: 0.008, speed: 0.015, color: 'rgba(124, 58, 237, 0.3)', width: 2 },
      { amplitude: 20, frequency: 0.012, speed: 0.02, color: 'rgba(59, 130, 246, 0.25)', width: 1.5 },
      { amplitude: 25, frequency: 0.006, speed: 0.01, color: 'rgba(20, 184, 166, 0.2)', width: 2 },
      { amplitude: 15, frequency: 0.015, speed: 0.025, color: 'rgba(124, 58, 237, 0.15)', width: 1 },
      { amplitude: 35, frequency: 0.004, speed: 0.008, color: 'rgba(59, 130, 246, 0.12)', width: 2.5 },
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const centerY = h / 2;

      ctx.clearRect(0, 0, w, h);

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.width;

        for (let x = 0; x <= w; x += 2) {
          const y = centerY +
            wave.amplitude * Math.sin(x * wave.frequency + time * wave.speed) *
            Math.sin(x * wave.frequency * 0.3 + time * wave.speed * 0.5) *
            // Fade edges
            Math.sin((x / w) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      time++;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Equalizer bars — animated vertical bars that settle into position.
 * Used for stat displays to give them an audio-visual feel.
 */
export function EqualizerBars({ 
  bars = 5, 
  className = '' 
}: { 
  bars?: number; 
  className?: string;
}) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const height = 40 + Math.sin(i * 1.2) * 30 + Math.random() * 20;
        const delay = i * 0.1;
        return (
          <div
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-purple-500 via-blue-500 to-teal-400 animate-eq-bar"
            style={{
              height: `${height}%`,
              animationDelay: `${delay}s`,
              opacity: 0.4 + (i / bars) * 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Signal pulse — concentric circles that radiate outward.
 * Think: radio telescope detecting a signal.
 */
export function SignalPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-purple-500/20 animate-signal-pulse"
          style={{ animationDelay: `${i * 1.5}s` }}
        />
      ))}
    </div>
  );
}
