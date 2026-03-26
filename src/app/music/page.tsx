'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useYoutubeStore } from '@/store/youtubeStore';
import { usePusherSync } from '@/components/music/usePusherSync';
import RoomConnect from '@/components/music/RoomConnect';
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  PlusIcon,
  XMarkIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function extractVideoId(input: string): string | null {
  const match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

async function fetchYoutubeTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    const data = await res.json();
    return data.title || videoId;
  } catch {
    return videoId;
  }
}

export default function MusicPage() {
  const {
    playlist, currentIndex, isPlaying, volume, currentTime, duration,
    addTrack, removeTrack, selectTrack, togglePlay, setVolume,
    playNext, playPrev, seek,
  } = useYoutubeStore();

  const [roomCode, setRoomCode] = useState<string | null>(null);
  const { broadcast } = usePusherSync(roomCode);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [fetching, setFetching] = useState(false);

  const track = playlist[currentIndex];

  // ── Wrapped actions that also broadcast to the room ──────────────────────

  const handleTogglePlay = () => {
    const nextPlaying = !isPlaying;
    togglePlay();
    broadcast({ type: nextPlaying ? 'play' : 'pause', currentTime });
  };

  const handleSeek = (time: number) => {
    seek(time);
    broadcast({ type: 'seek', currentTime: time });
  };

  const handleSelectTrack = (index: number) => {
    selectTrack(index);
    broadcast({ type: 'load-track', trackIndex: index });
  };

  const handlePlayPrev = () => {
    playPrev();
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    broadcast({ type: 'load-track', trackIndex: prevIndex });
  };

  const handlePlayNext = () => {
    playNext();
    const nextIndex = (currentIndex + 1) % playlist.length;
    broadcast({ type: 'load-track', trackIndex: nextIndex });
  };

  // ── Add / remove with playlist sync ──────────────────────────────────────

  const handleUrlChange = async (val: string) => {
    setUrl(val);
    const id = extractVideoId(val);
    if (id) {
      setFetching(true);
      setTitle('');
      const t = await fetchYoutubeTitle(id);
      setTitle(t);
      setFetching(false);
    }
  };

  const handleAdd = () => {
    const id = extractVideoId(url.trim());
    if (!id) return;
    const wasEmpty = playlist.length === 0;
    const newTrack = { id: Date.now().toString(), title: title.trim() || id, videoId: id };
    addTrack(newTrack);
    if (wasEmpty) {
      setTimeout(() => {
        selectTrack(0);
        const updated = useYoutubeStore.getState().playlist;
        broadcast({ type: 'sync-playlist', playlist: updated, currentIndex: 0 });
      }, 0);
    } else {
      const updated = [...playlist, newTrack];
      broadcast({ type: 'sync-playlist', playlist: updated, currentIndex });
    }
    setUrl('');
    setTitle('');
  };

  const handleRemove = (id: string) => {
    removeTrack(id);
    setTimeout(() => {
      const { playlist: updated, currentIndex: idx } = useYoutubeStore.getState();
      broadcast({ type: 'sync-playlist', playlist: updated, currentIndex: idx });
    }, 0);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main
      className="relative min-h-screen pt-24 pb-16 px-4 md:px-8 flex flex-col items-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 30%, var(--accent-glow) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl flex flex-col gap-5"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--text)' }}>
            Our Music
          </h1>
          <p className="mt-2 text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            Listen together, in real-time
          </p>
        </div>

        {/* Room connect */}
        <RoomConnect
          roomCode={roomCode}
          onConnect={code => {
            setRoomCode(code);
            // Sync current state to the room when joining
            broadcast({ type: 'sync-playlist', playlist, currentIndex });
          }}
          onDisconnect={() => setRoomCode(null)}
        />

        {/* Now Playing */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            className="flex flex-col items-center gap-4 py-8 px-6"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 4, ease: 'linear', repeat: isPlaying ? Infinity : 0 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'conic-gradient(var(--accent), var(--highlight), var(--accent))',
                boxShadow: isPlaying ? '0 0 30px var(--accent-glow)' : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <div className="w-6 h-6 rounded-full" style={{ background: 'var(--bg)' }} />
            </motion.div>
            <p
              className="text-base font-semibold text-center"
              style={{ color: track ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {track ? track.title : 'No track loaded — add one below'}
            </p>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Progress */}
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
              <input
                type="range" min={0} max={duration || 1} step={0.5} value={currentTime}
                onChange={e => handleSeek(Number(e.target.value))}
                disabled={!track}
                className="flex-1 h-1 rounded-full appearance-none"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="w-8 tabular-nums">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.85 }} onClick={handlePlayPrev}
                  disabled={playlist.length < 2}
                  style={{ color: playlist.length < 2 ? 'var(--card-border)' : 'var(--text-muted)' }}
                >
                  <BackwardIcon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={handleTogglePlay} disabled={!track}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: track ? 'var(--accent)' : 'var(--card-border)',
                    color: '#fff', opacity: track ? 1 : 0.4,
                  }}
                >
                  {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }} onClick={handlePlayNext}
                  disabled={playlist.length < 2}
                  style={{ color: playlist.length < 2 ? 'var(--card-border)' : 'var(--text-muted)' }}
                >
                  <ForwardIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <SpeakerWaveIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="range" min={0} max={100} value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-20 h-1 rounded-full appearance-none"
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Track */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Add a YouTube track
          </p>
          <div className="flex flex-col gap-2">
            <input
              value={url} onChange={e => handleUrlChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Paste YouTube URL or video ID…"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', color: 'var(--text)' }}
            />
            <div className="flex gap-2">
              <input
                value={fetching ? 'Fetching title…' : title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Song title (auto-filled)"
                disabled={fetching}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--card-border)',
                  color: 'var(--text)', opacity: fetching ? 0.5 : 1,
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <PlusIcon className="w-4 h-4" /> Add
              </motion.button>
            </div>
          </div>
        </div>

        {/* Playlist */}
        <AnimatePresence>
          {playlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <p className="px-5 pt-4 pb-2 text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Playlist · {playlist.length} track{playlist.length !== 1 ? 's' : ''}
              </p>
              <ul>
                <AnimatePresence>
                  {playlist.map((t, i) => (
                    <motion.li
                      layout key={t.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12, height: 0 }} transition={{ duration: 0.2 }}
                      onClick={() => handleSelectTrack(i)}
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer"
                      style={{
                        background: i === currentIndex ? 'var(--accent-glow)' : 'transparent',
                        borderBottom: '1px solid var(--card-border)',
                      }}
                    >
                      <span
                        className="w-5 h-5 flex items-center justify-center text-xs rounded-full flex-shrink-0"
                        style={{
                          background: i === currentIndex ? 'var(--accent)' : 'var(--card-border)',
                          color: i === currentIndex ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {i === currentIndex && isPlaying
                          ? <MusicalNoteIcon className="w-2.5 h-2.5" />
                          : i + 1
                        }
                      </span>
                      <span
                        className="flex-1 text-sm truncate"
                        style={{ color: i === currentIndex ? 'var(--accent)' : 'var(--text)' }}
                      >
                        {t.title}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={e => { e.stopPropagation(); handleRemove(t.id); }}
                        className="opacity-40 hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {!roomCode && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-center text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Enter a room code to sync playback with your partner ✦
          </motion.p>
        )}
      </motion.div>
    </main>
  );
}
