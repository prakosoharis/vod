import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateBroadcastInput {
  title: string;
  description?: string;
  scheduled_time?: Date;
  category: string;
  chat_enabled: boolean;
  thumbnail_url?: string;
  backdrop_url?: string;
  ticket_price?: number;
  stream_key?: string;
  rtmp_url?: string;
  playback_url?: string;
}

export interface UpdateBroadcastInput {
  title?: string;
  description?: string;
  scheduled_time?: Date;
  category?: string;
  chat_enabled?: boolean;
  thumbnail_url?: string;
  backdrop_url?: string;
  ticket_price?: number;
  stream_key?: string;
  rtmp_url?: string;
  playback_url?: string;
}

export interface PlaybackAvailabilityResult {
  available: boolean;
  http_status: number | null;
  checked_at: string;
  message: string;
  playback_url: string;
}

export class BroadcastService {
  // Get IVS credentials from environment
  private getIVSCredentials() {
    return {
      stream_key: process.env.IVS_STREAM_KEY || '',
      rtmp_url: process.env.IVS_RTMP_URL || '',
      playback_url: process.env.IVS_PLAYBACK_URL || '',
    };
  }

  // Create new broadcast event
  async create(input: CreateBroadcastInput) {
    const ivsCredentials = this.getIVSCredentials();

    const broadcast = await prisma.broadcastEvent.create({
      data: {
        title: input.title,
        description: input.description,
        scheduled_time: input.scheduled_time || new Date(),
        category: input.category,
        chat_enabled: input.chat_enabled,
        stream_key: input.stream_key || ivsCredentials.stream_key,
        rtmp_url: input.rtmp_url || ivsCredentials.rtmp_url,
        playback_url: input.playback_url || ivsCredentials.playback_url,
        thumbnail_url: input.thumbnail_url,
        backdrop_url: input.backdrop_url,
        ticket_price: input.ticket_price ?? 0,
        status: 'SCHEDULED',
      },
    });

    return broadcast;
  }

  // Get all broadcasts
  async getAll(status?: string) {
    const where = status ? { status: status as any } : {};

    const broadcasts = await prisma.broadcastEvent.findMany({
      where,
      orderBy: {
        scheduled_time: 'desc',
      },
    });

    return broadcasts;
  }

  // Get broadcast by ID
  async getById(id: string) {
    const broadcast = await prisma.broadcastEvent.findUnique({
      where: { id },
      include: {
        chat_messages: {
          orderBy: {
            created_at: 'asc',
          },
          take: 50, // Last 50 messages
        },
      },
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    return broadcast;
  }

  // Update broadcast
  async update(id: string, input: UpdateBroadcastInput) {
    const broadcast = await prisma.broadcastEvent.update({
      where: { id },
      data: input,
    });

    return broadcast;
  }

  // Delete broadcast
  async delete(id: string) {
    await prisma.broadcastEvent.delete({
      where: { id },
    });

    return { message: 'Broadcast deleted successfully' };
  }

  // Update broadcast status
  async updateStatus(id: string, status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED') {
    const updateData: any = {
      status,
    };

    if (status === 'LIVE') {
      updateData.started_at = new Date();
    } else if (status === 'ENDED' || status === 'CANCELLED') {
      updateData.ended_at = new Date();
    }

    const broadcast = await prisma.broadcastEvent.update({
      where: { id },
      data: updateData,
    });

    return broadcast;
  }

  // Get stream info (RTMP URL, Stream Key, Playback URL)
  async getStreamInfo(id: string) {
    const broadcast = await prisma.broadcastEvent.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        stream_key: true,
        rtmp_url: true,
        playback_url: true,
        chat_enabled: true,
      },
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    return broadcast;
  }

  async getPlaybackAvailability(id: string): Promise<PlaybackAvailabilityResult> {
    const broadcast = await prisma.broadcastEvent.findUnique({
      where: { id },
      select: {
        playback_url: true,
      },
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    const checked_at = new Date().toISOString();
    const playback_url = broadcast.playback_url || '';

    if (!playback_url) {
      return {
        available: false,
        http_status: null,
        checked_at,
        playback_url,
        message: 'Playback URL belum diisi.',
      };
    }

    try {
      const response = await fetch(playback_url, {
        method: 'GET',
        headers: {
          accept: 'application/vnd.apple.mpegurl,text/plain,*/*',
        },
        signal: AbortSignal.timeout(5000),
      });

      const body = await response.text();
      const hasManifest = response.ok && body.includes('#EXTM3U');

      return {
        available: hasManifest,
        http_status: response.status,
        checked_at,
        playback_url,
        message: hasManifest
          ? 'Manifest HLS IVS sudah aktif.'
          : `Manifest IVS belum tersedia${response.status ? ` (HTTP ${response.status})` : ''}.`,
      };
    } catch (error: any) {
      return {
        available: false,
        http_status: null,
        checked_at,
        playback_url,
        message: error?.message || 'Gagal menghubungi playback URL.',
      };
    }
  }

  // Add viewer count (manually updated for now)
  async updateViewerCount(id: string, count: number) {
    const broadcast = await prisma.broadcastEvent.update({
      where: { id },
      data: {
        viewer_count: count,
      },
    });

    return broadcast;
  }

  // Get chat messages for broadcast
  async getChatMessages(broadcastId: string, limit: number = 50) {
    const messages = await prisma.chatMessage.findMany({
      where: {
        broadcast_id: broadcastId,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });

    return messages.reverse(); // Return in chronological order
  }

  // Create chat message
  async createChatMessage(broadcastId: string, username: string, message: string, isHostMessage: boolean = false) {
    const chatMessage = await prisma.chatMessage.create({
      data: {
        broadcast_id: broadcastId,
        username,
        message,
        is_host_message: isHostMessage,
      },
    });

    return chatMessage;
  }
}

export const broadcastService = new BroadcastService();
