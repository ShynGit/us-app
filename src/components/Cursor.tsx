'use client';

import { useEffect } from 'react';

export default function Cursor() {
  useEffect(() => {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (!cursor || !ring) return;

    let ringX = 0, ringY = 0;
    let curX = 0, curY = 0;

    const moveCursor = (e: MouseEvent) => {
      curX = e.clientX;
      curY = e.clientY;
      cursor.style.left = curX + 'px';
      cursor.style.top = curY + 'px';
    };

    const animate = () => {
      ringX += (curX - ringX) * 0.12;
      ringY += (curY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animate);
    };

    const onEnter = () => {
      cursor.style.width = '6px';
      cursor.style.height = '6px';
      ring.style.width = '52px';
      ring.style.height = '52px';
    };

    const onLeave = () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      ring.style.width = '36px';
      ring.style.height = '36px';
    };

    window.addEventListener('mousemove', moveCursor);
    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    const raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="cursor" />
      <div id="cursor-ring" />
    </>
  );
}
