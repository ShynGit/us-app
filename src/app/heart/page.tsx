'use client';

import SpinningHeart from '@/components/heart/SpinningHeart';
import OrbitingPhotos from '@/components/heart/OrbitingPhotos';
import StarField from '@/components/heart/StarField';
import { motion } from 'framer-motion';

export default function HeartPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <StarField count={120} />

      {/* Background glow blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 780,
          height: 780,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
        aria-hidden="true"
      />

      {/* Title + orbit as one centered group */}
      <div className="relative flex flex-col items-center" style={{ gap: 0 }}>
        {/* Title sits at the top of the glow */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center"
          style={{ paddingTop: 32 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            Our Memories
          </h1>
          <p className="mt-2 text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            Every moment, spinning around us
          </p>
        </motion.div>

        {/* Orbiting scene */}
        <div className="relative flex items-center justify-center mb-20" style={{ width: 700, height: 500 }}>
          <OrbitingPhotos radius={280} />
          <SpinningHeart />
        </div>
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 text-xs tracking-widest uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        Click a photo to zoom in ✦
      </motion.p>

    </main>
  );
}
