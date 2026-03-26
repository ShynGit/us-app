'use client';

import { useEffect, useRef } from 'react';
import { useYoutubeStore } from '@/store/youtubeStore';
import type { YoutubeStore } from '@/store/youtubeStore';

interface YTPlayer {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YoutubeCore() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const playerRef = { current: null as YTPlayer | null };
    let unsubscribe: (() => void) | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    const handleStoreChange = (state: YoutubeStore, prev: YoutubeStore) => {
      const player = playerRef.current;
      if (!player) return;

      // New track selected or playlist mutated
      if (state.currentIndex !== prev.currentIndex || state.playlist !== prev.playlist) {
        const track = state.playlist[state.currentIndex];
        if (track?.videoId) {
          player.loadVideoById(track.videoId); // auto-plays
        }
        return; // loadVideoById handles play; skip isPlaying check this tick
      }

      // Play / pause toggled
      if (state.isPlaying !== prev.isPlaying) {
        if (state.isPlaying) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }

      // Volume changed
      if (state.volume !== prev.volume) {
        player.setVolume(state.volume);
      }
    };

    const initPlayer = () => {
      if (!containerRef.current) return;
      const store = useYoutubeStore.getState();

      playerRef.current = new window.YT.Player(containerRef.current, {
        ...(store.playlist[store.currentIndex]?.videoId
          ? { videoId: store.playlist[store.currentIndex].videoId }
          : {}),
        playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady: (e) => {
            e.target.setVolume(useYoutubeStore.getState().volume);

            // Override seek in store to imperatively control the player
            useYoutubeStore.setState({
              seek: (time: number) => {
                playerRef.current?.seekTo(time, true);
                useYoutubeStore.getState().setCurrentTime(time);
              },
            });

            // Subscribe to store changes
            unsubscribe = useYoutubeStore.subscribe(handleStoreChange);

            // Poll currentTime / duration
            interval = setInterval(() => {
              const p = playerRef.current;
              if (!p) return;
              try {
                useYoutubeStore.getState().setCurrentTime(p.getCurrentTime() || 0);
                useYoutubeStore.getState().setDuration(p.getDuration() || 0);
              } catch {
                // player not ready yet
              }
            }, 500);
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) {
              useYoutubeStore.getState().setIsPlaying(true);
            } else if (e.data === S.PAUSED) {
              useYoutubeStore.getState().setIsPlaying(false);
            } else if (e.data === S.ENDED) {
              useYoutubeStore.getState().playNext();
            }
          },
        },
      });
    };

    // Load YT iframe API
    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
        prev?.();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      unsubscribe?.();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{ position: 'fixed', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
    >
      <div ref={containerRef} />
    </div>
  );
}
