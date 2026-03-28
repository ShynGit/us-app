'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import {  SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { HeartIcon, HomeIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';

const links = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/heart', label: 'Heart', icon: HeartIcon },
  { href: '/music', label: 'Music', icon: MusicalNoteIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Center nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-2 rounded-full"
        style={{
          background: 'var(--nav-bg)',
          border: '1px solid var(--card-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--bg)' : 'var(--text-muted)' }}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 w-4 h-4" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </motion.nav>

      {/* Right-side theme toggle */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
        className="fixed top-5 right-6 z-50"
      >
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{
            background: 'var(--nav-bg)',
            border: '1px solid var(--card-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'var(--text)',
          }}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Pastel' : 'Switch to Dark'}
        >
          {theme === 'dark'
            ? <SunIcon className="w-4 h-4" />
            : <MoonIcon className="w-4 h-4" />
          }
        </motion.button>
      </motion.div>
    </>
  );
}
