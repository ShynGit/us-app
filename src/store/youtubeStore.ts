import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface YTrack {
  id: string;
  title: string;
  videoId: string;
}

export interface YoutubeStore {
  playlist: YTrack[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;

  addTrack: (track: YTrack) => void;
  removeTrack: (id: string) => void;
  selectTrack: (index: number) => void;
  togglePlay: () => void;
  setIsPlaying: (v: boolean) => void;
  setVolume: (v: number) => void;
  setCurrentTime: (v: number) => void;
  setDuration: (v: number) => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
}

export const useYoutubeStore = create<YoutubeStore>()(
  persist(
    (set) => ({
      playlist: [],
      currentIndex: 0,
      isPlaying: false,
      volume: 80,
      currentTime: 0,
      duration: 0,

      addTrack: (track) => set((s) => ({ playlist: [...s.playlist, track] })),

      removeTrack: (id) =>
        set((s) => {
          const next = s.playlist.filter((t) => t.id !== id);
          const idx = s.currentIndex >= next.length
            ? Math.max(0, next.length - 1)
            : s.currentIndex;
          return { playlist: next, currentIndex: idx };
        }),

      selectTrack: (index) => set({ currentIndex: index, isPlaying: true }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),

      playNext: () =>
        set((s) => {
          if (!s.playlist.length) return {};
          return { currentIndex: (s.currentIndex + 1) % s.playlist.length, isPlaying: true };
        }),

      playPrev: () =>
        set((s) => {
          if (!s.playlist.length) return {};
          return {
            currentIndex: (s.currentIndex - 1 + s.playlist.length) % s.playlist.length,
            isPlaying: true,
          };
        }),

      seek: () => {}, // overridden at runtime by YoutubeCore
    }),
    {
      name: 'yt-player',
      partialize: (s) => ({ playlist: s.playlist, volume: s.volume, currentIndex: s.currentIndex }),
    }
  )
);
