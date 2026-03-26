'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;       // depth — controls size & speed
  opacity: number;
  twinkleOffset: number;
}

export default function StarField({ count = 120 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);

    // Init stars
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: 0.2 + Math.random() * 0.8,       // 0.2 (far) → 1.0 (near)
      opacity: 0.2 + Math.random() * 0.7,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let raf: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      for (const s of stars) {
        // Drift upward, faster the closer (higher z)
        s.y -= s.z * 0.35;
        // Slight horizontal sway
        s.x += Math.sin(t + s.twinkleOffset) * 0.12 * s.z;

        // Wrap around
        if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
        if (s.x < -4)  s.x = W + 4;
        if (s.x > W + 4) s.x = -4;

        const outer = 1.2 + s.z * 4;
        const inner = outer * 0.12; // very tight waist → sharp spikes
        const twinkle = 0.6 + 0.4 * Math.sin(t * 2.2 + s.twinkleOffset);
        const alpha = s.opacity * twinkle;

        // 4-pointed star path (8 vertices alternating outer/inner)
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 - Math.PI / 2; // start at top
          const rad = i % 2 === 0 ? outer : inner;
          const px = s.x + Math.cos(angle) * rad;
          const py = s.y + Math.sin(angle) * rad;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 220, 235, ${alpha})`;
        ctx.fill();

        // Soft glow for closer stars
        if (s.z > 0.6) {
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4 - Math.PI / 2;
            const rad = i % 2 === 0 ? outer * 1.8 : inner * 1.8;
            const px = s.x + Math.cos(angle) * rad;
            const py = s.y + Math.sin(angle) * rad;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 150, 180, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
