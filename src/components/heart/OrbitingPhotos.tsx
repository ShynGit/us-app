"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";

const PHOTOS = [
  "/photos/photo1.jpg",
  "/photos/photo2.jpeg",
  "/photos/photo3.jpg",
  "/photos/photo4.jpeg",
  "/photos/photo5.jpeg",
  "/photos/photo6.png",
  "/photos/photo7.jpeg",
  "/photos/photo8.jpeg",
  // '/photos/photo9.jpeg',
  "/photos/photo10.jpeg",
  "/photos/photo11.jpeg",
  "/photos/photo12.jpg",
  "/photos/photo13.jpg",
];

interface PhotoOrbitProps {
  src: string;
  index: number;
  total: number;
  radius: number;
  pausedRef: { current: boolean };
  isSelected: boolean;
  isAnySelected: boolean;
  onClick: () => void;
}

// Seeded pseudo-random so params are stable per photo
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function PhotoOrbit({
  src,
  index,
  total,
  radius,
  pausedRef,
  isSelected,
  isAnySelected,
  onClick,
}: PhotoOrbitProps) {
  const entranceRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef((index / total) * Math.PI * 2);
  const lastTsRef = useRef<number | null>(null);
  // Per-photo orbital personality — stable across renders
  const orbitParams = useRef({
    speed: 0.0004,
    radiusMod: 0.88 + seededRand(index * 3 + 1) * 0.28, // 0.88–1.16× radius
    yRatio: 0.45 + seededRand(index * 3 + 2) * 0.25, // 0.45–0.70 (ellipse squeeze)
    direction: 1,
  });

  const { speed, radiusMod, yRatio, direction } = orbitParams.current;
  const r = radius * radiusMod;

  const x = useMotionValue(Math.cos(angleRef.current) * r);
  const y = useMotionValue(Math.sin(angleRef.current) * r * yRatio);
  const scaleZ = useMotionValue(1);
  const opacityZ = useMotionValue(1);
  const orbitRef = useRef<HTMLDivElement>(null);
  const lerpReturnRef = useRef(false);
  const selectAnimRef = useRef<{ stop: () => void }[]>([]);

  // RAF orbit loop
  useEffect(() => {
    const tick = (timestamp: number) => {
      const zNorm = (Math.sin(angleRef.current) + 1) / 2;
      scaleZ.set(0.6 + zNorm * 0.8);
      opacityZ.set(0.3 + zNorm * 0.7);
      if (orbitRef.current)
        orbitRef.current.style.zIndex = String(Math.round(zNorm * 20) + 1);

      if (pausedRef.current) {
        // Photo is selected — freeze angle tracking
        lastTsRef.current = null;
      } else {
        // Always advance angle (even during lerp return)
        if (lastTsRef.current !== null) {
          angleRef.current +=
            (timestamp - lastTsRef.current) * speed * direction;
        }
        lastTsRef.current = timestamp;

        const tx = Math.cos(angleRef.current) * r;
        const ty = Math.sin(angleRef.current) * r * yRatio;

        if (lerpReturnRef.current) {
          // Chase the live orbit target each frame — no jump at the end
          const cx = x.get(),
            cy = y.get();
          const dx = tx - cx,
            dy = ty - cy;
          if (Math.sqrt(dx * dx + dy * dy) < 2) {
            lerpReturnRef.current = false;
            x.set(tx);
            y.set(ty);
          } else {
            x.set(cx + dx * 0.1);
            y.set(cy + dy * 0.1);
          }
        } else {
          x.set(tx);
          y.set(ty);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pausedRef, x, y, scaleZ, opacityZ, speed, direction, r, yRatio]);

  // Spring to center on select; lerp back to live orbit on deselect
  const prevSelectedRef = useRef(false);
  useEffect(() => {
    if (isSelected) {
      prevSelectedRef.current = true;
      lerpReturnRef.current = false;
      selectAnimRef.current = [
        animate(x, 0, { type: "spring", stiffness: 200, damping: 26 }),
        animate(y, 0, { type: "spring", stiffness: 200, damping: 26 }),
      ];
    } else if (prevSelectedRef.current) {
      prevSelectedRef.current = false;
      // Stop the "go to center" spring and hand off to RAF lerp
      selectAnimRef.current.forEach((a) => a.stop());
      lerpReturnRef.current = true;
    }
  }, [isSelected, x, y]);

  // Entrance: GSAP on its own wrapper so it never touches motion values
  useEffect(() => {
    if (!entranceRef.current) return;
    gsap.fromTo(
      entranceRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        delay: 0.6 + index * 0.1,
        ease: "back.out(1.5)",
      },
    );
  }, [index]);

  return (
    <motion.div
      ref={orbitRef}
      className="absolute"
      style={{
        x,
        y,
        scale: scaleZ,
        opacity: opacityZ,
        marginLeft: -36,
        marginTop: -36,
      }}
    >
      <div ref={entranceRef} style={{ opacity: 0 }}>
        <motion.div
          animate={{
            scale: isAnySelected && !isSelected ? 0.75 : 1,
            opacity: isAnySelected && !isSelected ? 0.2 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          onClick={onClick}
          style={{ position: "relative" }}
        >
          <div
            className="rounded-full overflow-hidden cursor-pointer"
            style={{
              width: 72,
              height: 72,
              border: "2px solid var(--accent)",
              boxShadow: "0 0 16px var(--accent-glow)",
            }}
          >
            <Image
              src={src}
              alt={`Memory ${index + 1}`}
              width={72}
              height={72}
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function OrbitingPhotos({ radius = 220 }: { radius?: number }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = selectedIndex !== null;
  }, [selectedIndex]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Backdrop + lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <>
            {/* Dark backdrop */}
            <motion.div
              className="fixed inset-0 pointer-events-auto cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: "rgba(0,0,0,0.85)", zIndex: 40 }}
              onClick={() => setSelectedIndex(null)}
            />
            {/* Full-quality image — no cropping, natural aspect ratio */}
            <motion.div
              key={selectedIndex}
              className="fixed pointer-events-auto"
              style={{
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
                zIndex: 50,
                maxWidth: "80vw",
                maxHeight: "80vh",
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={() => setSelectedIndex(null)}
            >
              <img
                src={PHOTOS[selectedIndex]}
                alt={`Memory ${selectedIndex + 1}`}
                style={{
                  maxWidth: "80vw",
                  maxHeight: "80vh",
                  width: "auto",
                  height: "auto",
                  borderRadius: 16,
                  boxShadow: "0 0 60px rgba(0,0,0,0.8)",
                  display: "block",
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative" style={{ width: 0, height: 0, zIndex: 2 }}>
        {PHOTOS.map((src, i) => (
          <div key={src} className="pointer-events-auto">
            <PhotoOrbit
              src={src}
              index={i}
              total={PHOTOS.length}
              radius={radius}
              pausedRef={pausedRef}
              isSelected={selectedIndex === i}
              isAnySelected={selectedIndex !== null}
              onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
