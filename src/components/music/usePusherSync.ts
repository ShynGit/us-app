'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getPusherClient, MUSIC_CHANNEL, MUSIC_EVENT } from '@/lib/pusher';
import { useYoutubeStore } from '@/store/youtubeStore';
import type { MusicEvent } from '@/lib/pusher';

export function usePusherSync(roomCode: string | null) {
  const socketIdRef = useRef<string | null>(null);

  // Capture socket_id once the Pusher connection is established
  useEffect(() => {
    if (!roomCode) return;
    const pusher = getPusherClient();

    const onConnected = () => {
      socketIdRef.current = pusher.connection.socket_id ?? null;
    };

    if (pusher.connection.state === 'connected') {
      socketIdRef.current = pusher.connection.socket_id ?? null;
    }
    pusher.connection.bind('connected', onConnected);
    return () => { pusher.connection.unbind('connected', onConnected); };
  }, [roomCode]);

  // Subscribe to channel and apply incoming events to the store
  useEffect(() => {
    if (!roomCode) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(MUSIC_CHANNEL(roomCode));

    channel.bind(MUSIC_EVENT, (event: MusicEvent) => {
      const store = useYoutubeStore.getState();

      switch (event.type) {
        case 'play':
          store.seek(event.currentTime);
          store.setIsPlaying(true);
          break;
        case 'pause':
          store.seek(event.currentTime);
          store.setIsPlaying(false);
          break;
        case 'seek':
          store.seek(event.currentTime);
          break;
        case 'load-track':
          store.selectTrack(event.trackIndex);
          break;
        case 'sync-playlist':
          // Replace playlist + index without touching playback state
          useYoutubeStore.setState({
            playlist: event.playlist,
            currentIndex: event.currentIndex,
          });
          break;
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(MUSIC_CHANNEL(roomCode));
    };
  }, [roomCode]);

  // Send an event to everyone else in the room (sender is excluded via socket_id)
  const broadcast = useCallback(
    async (event: MusicEvent) => {
      if (!roomCode) return;
      await fetch('/api/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, event, socketId: socketIdRef.current }),
      });
    },
    [roomCode],
  );

  return { broadcast };
}
