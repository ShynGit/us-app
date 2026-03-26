'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function SpinningHeart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heartRef.current || !glowRef.current) return;

    // Continuous rotation
    gsap.to(heartRef.current, {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%',
    });

    // Pulsing scale
    gsap.to(heartRef.current, {
      scale: 1.08,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });

    // Glow pulse
    gsap.to(glowRef.current, {
      opacity: 0.8,
      scale: 1.2,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });

    // Entrance
    gsap.fromTo(
      containerRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
    );
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center" style={{ width: 200, height: 200, opacity: 0 }}>
      {/* Glow behind */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          transform: 'scale(1.5)',
          opacity: 0.5,
        }}
      />

      {/* Heart SVG */}
      <svg
        ref={heartRef}
        viewBox="0 0 100 90"
        width={160}
        height={160}
        style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 16px var(--accent))' }}
      >
        <defs>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--highlight)" />
          </linearGradient>
        </defs>
        <path
          d="M50 85 C50 85 5 55 5 28 C5 14 16 5 28 5 C36 5 44 10 50 18 C56 10 64 5 72 5 C84 5 95 14 95 28 C95 55 50 85 50 85 Z"
          fill="url(#heartGrad)"
        />
      </svg>
    </div>
  );
}
