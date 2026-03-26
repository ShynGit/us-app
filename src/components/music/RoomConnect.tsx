'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LinkIcon, XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface Props {
  roomCode: string | null;
  onConnect: (code: string) => void;
  onDisconnect: () => void;
}

export default function RoomConnect({ roomCode, onConnect, onDisconnect }: Props) {
  const [input, setInput] = useState('');

  const handleConnect = () => {
    const code = input.trim().toUpperCase();
    if (code) { onConnect(code); setInput(''); }
  };

  if (roomCode) {
    return (
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent)',
        }}
      >
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Room&nbsp;
            <span className="font-bold tracking-widest" style={{ color: 'var(--accent)' }}>
              {roomCode}
            </span>
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· syncing ✦</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDisconnect}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
        >
          <XMarkIcon className="w-3.5 h-3.5" />
          Leave
        </motion.button>
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 p-4 rounded-xl"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <input
        value={input}
        onChange={e => setInput(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && handleConnect()}
        placeholder="Enter room code…"
        maxLength={8}
        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none tracking-widest uppercase"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--card-border)',
          color: 'var(--text)',
        }}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConnect}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        <LinkIcon className="w-4 h-4" />
        Join
      </motion.button>
    </div>
  );
}
