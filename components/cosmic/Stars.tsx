'use client';

import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkle: boolean;
  delay: number;
}

export function Stars({ count = 200 }: { count?: number }) {
  const stars = useMemo<Star[]>(() => {
    const seed: Star[] = [];
    for (let i = 0; i < count; i++) {
      seed.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.3 ? 2 : Math.random() < 0.6 ? 1.5 : 1,
        opacity: 0.3 + Math.random() * 0.7,
        twinkle: Math.random() < 0.2,
        delay: Math.random() * 5,
      });
    }
    return seed;
  }, [count]);

  return (
    <div
      className="stars-container"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className={star.twinkle ? 'star-twinkle' : undefined}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            opacity: star.opacity,
            animationDelay: star.twinkle ? `${star.delay}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
