"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useYoutubeStore } from "@/store/youtubeStore";
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function YoutubeWidget() {
  const pathname = usePathname();
  const [minimized, setMinimized] = useState(false);

  const {
    playlist,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    setVolume,
    playNext,
    playPrev,
    seek,
  } = useYoutubeStore();

  // Hidden on the music page — the full page IS the expanded player
  if (pathname === "/music") return null;

  const track = playlist[currentIndex];

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.4 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          width: 280,
        }}
      >
        {/* Header — click to minimize / expand */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
          onClick={() => setMinimized((v) => !v)}
          style={{
            borderBottom: minimized ? "none" : "1px solid var(--card-border)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <motion.span
              animate={{ rotate: isPlaying ? [0, 15, -15, 0] : 0 }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
              style={{
                color: "var(--accent)",
                display: "inline-block",
                flexShrink: 0,
              }}
            >
              <MusicalNoteIcon className="w-4 h-4" />
            </motion.span>
            <span
              className="text-sm font-medium truncate"
              style={{ color: "var(--text)" }}
            >
              {track ? track.title : "YouTube Music"}
            </span>
          </div>
          <div data-cursor>
            {minimized ? (
              <ChevronUpIcon
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
            ) : (
              <ChevronDownIcon
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
            )}
          </div>
        </div>

        {/* Expandable body */}
        <AnimatePresence initial={false}>
          {!minimized && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden" }}
            >
              <div className="p-4 flex flex-col gap-3">
                {track ? (
                  <>
                    {/* Progress */}
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span className="w-8 text-right tabular-nums">
                        {formatTime(currentTime)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 1}
                        step={0.5}
                        value={currentTime}
                        onChange={(e) => seek(Number(e.target.value))}
                        className="flex-1 h-1 rounded-full appearance-none"
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span className="w-8 tabular-nums">
                        {formatTime(duration)}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={playPrev}
                          style={{ color: "var(--text-muted)" }}
                        >
                          <BackwardIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={togglePlay}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: "var(--accent)", color: "#fff" }}
                        >
                          {isPlaying ? (
                            <PauseIcon className="w-4 h-4" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={playNext}
                          style={{ color: "var(--text-muted)" }}
                        >
                          <ForwardIcon className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <SpeakerWaveIcon
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="w-16 h-1 rounded-full appearance-none"
                          style={{ accentColor: "var(--accent)" }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Visit Music to add songs ✦
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
