'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { motion } from 'framer-motion';

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

export default function HomePage() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (headingRef.current) {
        const text = headingRef.current.textContent || '';
        headingRef.current.innerHTML = text
          .split('')
          .map(c =>
            c === ' '
              ? '<span style="display:inline-block">&nbsp;</span>'
              : `<span class="char" style="display:inline-block">${c}</span>`
          )
          .join('');

        tl.fromTo(
          headingRef.current.querySelectorAll('.char'),
          { y: 80, opacity: 0, rotateX: -40 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.04 }
        );
      }

      tl.fromTo(
        subRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      );

      if (cardsRef.current) {
        tl.fromTo(
          Array.from(cardsRef.current.children),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
          '-=0.2'
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {PARTICLES.map(p => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: 'var(--accent)',
              opacity: 0.25,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, var(--accent-glow) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <p
          ref={subRef}
          className="text-sm tracking-[0.35em] uppercase font-medium"
          style={{ color: 'var(--text-muted)', opacity: 0 }}
        >
          A little corner of the internet
        </p>

        <h1
          ref={headingRef}
          className="text-6xl md:text-8xl font-bold leading-none tracking-tight"
          style={{
            color: 'var(--text)',
            perspective: '800px',
          }}
        >
          Just Us Two
        </h1>

        <div ref={cardsRef} className="flex flex-col sm:flex-row gap-5 mt-6">
          <NavCard
            href="/heart"
            emoji="♥"
            title="Our Memories"
            desc="Moments we'll never forget"
          />
          <NavCard
            href="/music"
            emoji="♫"
            title="Our Music"
            desc="Listen together, anywhere"
          />
        </div>
      </div>
    </main>
  );
}

function NavCard({
  href,
  emoji,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ opacity: 0 }}
    >
      <Link
        href={href}
        className="block w-64 rounded-2xl p-8 text-left"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'box-shadow 0.3s ease',
        }}
        onMouseEnter={e =>
          ((e.currentTarget as HTMLElement).style.boxShadow =
            '0 0 40px var(--accent-glow)')
        }
        onMouseLeave={e =>
          ((e.currentTarget as HTMLElement).style.boxShadow = 'none')
        }
      >
        <span className="text-4xl block mb-4">{emoji}</span>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {desc}
        </p>
        <span
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--accent)' }}
        >
          Enter →
        </span>
      </Link>
    </motion.div>
  );
}
