'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook (shared)                                */
/* ------------------------------------------------------------------ */
function useInView(
  options: IntersectionObserverInit = { threshold: 0.15 },
) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el); // animate once
        }
      },
      options,
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  <AnimateOnScroll>  — generic reveal wrapper                        */
/* ------------------------------------------------------------------ */
type AnimationVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade'
  | 'scale'
  | 'blur';

const VARIANT_STYLES: Record<AnimationVariant, { from: CSSProperties; to: CSSProperties }> = {
  'fade-up': {
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  'fade-down': {
    from: { opacity: 0, transform: 'translateY(-40px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  'fade-left': {
    from: { opacity: 0, transform: 'translateX(-40px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  'fade-right': {
    from: { opacity: 0, transform: 'translateX(40px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  scale: {
    from: { opacity: 0, transform: 'scale(0.92)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  blur: {
    from: { opacity: 0, filter: 'blur(8px)' },
    to: { opacity: 1, filter: 'blur(0px)' },
  },
};

export function AnimateOnScroll({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'span';
}) {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const { from, to } = VARIANT_STYLES[variant];

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...(inView ? to : from),
        transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'opacity, transform, filter',
      }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  <StaggerChildren> — staggers direct children reveals               */
/* ------------------------------------------------------------------ */
export function StaggerChildren({
  children,
  stagger = 120,
  variant = 'fade-up',
  duration = 600,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  stagger?: number;
  variant?: AnimationVariant;
  duration?: number;
  className?: string;
  as?: 'div' | 'section';
}) {
  const { ref, inView } = useInView({ threshold: 0.08 });
  const { from, to } = VARIANT_STYLES[variant];

  // We apply CSS custom properties for stagger; children use nth-child
  return (
    <Tag
      ref={ref}
      className={className}
      style={
        {
          '--stagger-delay': `${stagger}ms`,
          '--stagger-duration': `${duration}ms`,
        } as CSSProperties
      }
      data-in-view={inView ? 'true' : 'false'}
    >
      {/* We wrap each child to apply stagger via CSS */}
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                ...(inView ? to : from),
                transition: `all ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * stagger}ms`,
                willChange: 'opacity, transform',
              }}
            >
              {child}
            </div>
          ))
        : children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  <CountUp> — animate a number counting up                           */
/* ------------------------------------------------------------------ */
export function CountUp({
  end,
  prefix = '',
  suffix = '',
  duration = 2000,
  className = '',
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.3 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const start = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  <AnimatedText> — word-by-word or char-by-char reveal               */
/* ------------------------------------------------------------------ */
export function AnimatedText({
  text,
  className = '',
  stagger = 40,
  by = 'word',
}: {
  text: string;
  className?: string;
  stagger?: number;
  by?: 'word' | 'char';
}) {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const parts = by === 'word' ? text.split(' ') : text.split('');

  return (
    <span ref={ref} className={className} aria-label={text}>
      {parts.map((part, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(12px)',
            transition: `all 500ms cubic-bezier(0.22, 1, 0.36, 1) ${i * stagger}ms`,
            willChange: 'opacity, transform',
          }}
        >
          {part}
          {by === 'word' && i < parts.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  <Parallax> — simple CSS parallax or scroll-driven                  */
/* ------------------------------------------------------------------ */
export function Parallax({
  children,
  speed = 0.3,
  className = '',
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) {
          ticking = false;
          return;
        }
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        // How far the element center is from viewport center (-1 to 1)
        const centerY = rect.top + rect.height / 2;
        const ratio = (centerY - viewH / 2) / viewH;
        setOffset(ratio * speed * 100);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  <GlowOrb> — decorative floating orb                               */
/* ------------------------------------------------------------------ */
export function GlowOrb({
  color = 'var(--navy-500)',
  size = 400,
  top,
  left,
  right,
  bottom,
  opacity = 0.15,
  blur = 120,
  className = '',
}: {
  color?: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity?: number;
  blur?: number;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      aria-hidden="true"
      style={{
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        filter: `blur(${blur}px)`,
        animation: 'orbFloat 8s ease-in-out infinite alternate',
      }}
    />
  );
}
