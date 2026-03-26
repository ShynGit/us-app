import { NextResponse } from 'next/server';
import { getPusherServer, MUSIC_CHANNEL, MUSIC_EVENT } from '@/lib/pusher';
import type { MusicEvent } from '@/lib/pusher';

export async function POST(req: Request) {
  const { roomCode, event, socketId }: { roomCode: string; event: MusicEvent; socketId?: string } =
    await req.json();

  if (!roomCode || !event) {
    return NextResponse.json({ error: 'Missing roomCode or event' }, { status: 400 });
  }

  const pusher = getPusherServer();

  // Exclude the sender (socketId) so they don't receive their own event back
  await pusher.trigger(
    MUSIC_CHANNEL(roomCode),
    MUSIC_EVENT,
    event,
    socketId ? { socket_id: socketId } : undefined,
  );

  return NextResponse.json({ ok: true });
}
