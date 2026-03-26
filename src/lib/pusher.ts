import Pusher from 'pusher';
import PusherClient from 'pusher-js';
import type { YTrack } from '@/store/youtubeStore';

// ── Event types ──────────────────────────────────────────────────────────────

export type MusicEvent =
  | { type: 'play';          currentTime: number }
  | { type: 'pause';         currentTime: number }
  | { type: 'seek';          currentTime: number }
  | { type: 'load-track';    trackIndex: number }
  | { type: 'sync-playlist'; playlist: YTrack[]; currentIndex: number };

export const MUSIC_CHANNEL = (roomCode: string) => `music-${roomCode}`;
export const MUSIC_EVENT = 'music-event';

// ── Server-side Pusher (API routes only) ─────────────────────────────────────

export function getPusherServer() {
  return new Pusher({
    appId:   process.env.PUSHER_APP_ID!,
    key:     process.env.PUSHER_KEY!,
    secret:  process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS:  true,
  });
}

// ── Client-side Pusher singleton ─────────────────────────────────────────────

let clientInstance: PusherClient | null = null;

export function getPusherClient() {
  if (!clientInstance) {
    clientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return clientInstance;
}
