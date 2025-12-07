import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../config/database.js';
import { EventType } from '@prisma/client';

interface EventQuery {
  upcoming?: string;
  type?: string;
  limit?: string;
}

interface EventParams {
  id: string;
}

// Get all events (upcoming by default)
export async function getAllEvents(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const query = request.query as EventQuery;
    const limit = parseInt(query.limit || '20', 10);

    // Build where clause
    const where: any = {};

    // Default: only upcoming events (scheduled_at > now)
    if (query.upcoming !== 'false') {
      where.scheduled_at = {
        gte: new Date(),
      };
    }

    if (query.type) {
      where.event_type = query.type as EventType;
    }

    const events = await prisma.liveEvent.findMany({
      where,
      take: limit,
      orderBy: { scheduled_at: 'asc' }, // Nearest first
    });

    reply.send(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// Get current live event (is_live = true)
export async function getCurrentLiveEvent(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const liveEvent = await prisma.liveEvent.findFirst({
      where: { is_live: true },
      orderBy: { scheduled_at: 'desc' },
    });

    reply.send(liveEvent || null);
  } catch (error) {
    console.error('Error fetching live event:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// Get single event by ID
export async function getEventById(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params as EventParams;

    const event = await prisma.liveEvent.findUnique({
      where: { id },
    });

    if (!event) {
      reply.code(404).send({ error: 'Event not found' });
      return;
    }

    reply.send(event);
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// Create event (admin only)
export async function createEvent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const data = request.body as any;

    const event = await prisma.liveEvent.create({
      data: {
        title: data.title,
        description: data.description,
        event_type: data.event_type,
        scheduled_at: new Date(data.scheduled_at),
        duration_minutes: data.duration_minutes,
        thumbnail_url: data.thumbnail_url,
        backdrop_url: data.backdrop_url,
        local_thumbnail_url: data.local_thumbnail_url,
        local_backdrop_url: data.local_backdrop_url,
        stream_key: data.stream_key,
        host_name: data.host_name,
        is_live: data.is_live || false,
      },
    });

    reply.code(201).send(event);
  } catch (error) {
    console.error('Error creating event:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// Update event (admin only)
export async function updateEvent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params as EventParams;
    const data = request.body as any;

    const event = await prisma.liveEvent.update({
      where: { id },
      data: {
        ...data,
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      },
    });

    reply.send(event);
  } catch (error) {
    console.error('Error updating event:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}

// Set event live status (admin only)
export async function setEventLiveStatus(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params as EventParams;
    const { is_live } = request.body as { is_live: boolean };

    const event = await prisma.liveEvent.update({
      where: { id },
      data: { is_live },
    });

    reply.send(event);
  } catch (error) {
    console.error('Error updating event live status:', error);
    reply.code(500).send({ error: 'Internal server error' });
  }
}
